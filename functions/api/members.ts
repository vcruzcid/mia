// GET /api/members — member gallery data, fetched from WildApricot and cached in KV.

import { getWAToken } from '../_lib/wa-token';
import { FIELD_CODES } from '../_lib/wa-field-ids';
import { log, logError } from '../_lib/logger';

const KV_KEY = 'gallery_members';
// 30 min during the member-onboarding period (profiles are being imported and
// edited frequently) so changes surface quickly. Restore to 86400 (24h) once the
// directory stabilizes — the WA fetch is the only cost and rebuilds stay well
// under the rate limit.
const CACHE_TTL = 1800;

interface Env {
  KV: KVNamespace;
  WILDAPRICOT_API_KEY: string;
  WILDAPRICOT_ACCOUNT_ID: string;
  WA_LEVEL_ID_PLENO_DERECHO: string;
  WA_LEVEL_ID_ESTUDIANTE: string;
  WA_LEVEL_ID_COLABORADOR: string;
}

type WAFieldValue = { FieldName?: string; SystemCode: string; Value: unknown };

interface WAContact {
  Id: number;
  FirstName: string;
  LastName: string;
  DisplayName?: string;
  MembershipLevel?: { Id: number; Name: string };
  MemberSince?: string;
  FieldValues?: WAFieldValue[];
}

function getStringField(fields: WAFieldValue[] | undefined, code: string): string {
  const raw = fields?.find(f => f.SystemCode === code)?.Value;
  if (raw === null || raw === undefined) return '';
  return String(raw).trim();
}

function getOptionLabel(fields: WAFieldValue[] | undefined, code: string): string {
  const raw = fields?.find(f => f.SystemCode === code)?.Value;
  if (!raw || typeof raw !== 'object') return '';
  return ((raw as { Label?: string }).Label ?? '').trim();
}

function getOptionLabels(fields: WAFieldValue[] | undefined, code: string): string[] {
  const raw = fields?.find(f => f.SystemCode === code)?.Value;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(v => ((v as { Label?: string }).Label ?? '').trim()).filter(Boolean);
  }
  if (typeof raw === 'object') {
    const label = ((raw as { Label?: string }).Label ?? '').trim();
    return label ? [label] : [];
  }
  return [];
}

function normalizeMembershipType(env: Env, level?: { Id: number; Name: string }): string {
  if (!level) return '';
  const id = String(level.Id);
  if (id === env.WA_LEVEL_ID_PLENO_DERECHO) return 'pleno_derecho';
  if (id === env.WA_LEVEL_ID_ESTUDIANTE) return 'estudiante';
  if (id === env.WA_LEVEL_ID_COLABORADOR) return 'colaborador';
  return level.Name?.toLowerCase().replace(/\s+/g, '_') ?? '';
}

function transformContact(env: Env, contact: WAContact): object {
  const fields = contact.FieldValues;
  return {
    id: String(contact.Id),
    first_name: contact.FirstName,
    last_name: contact.LastName,
    display_name: contact.DisplayName,
    // The WildApricot photo is in an auth-gated custom field absent from this async
    // list, so we point at the photo proxy Worker (resolves + streams it per member).
    profile_image_url: `/api/members/${contact.Id}/photo`,
    biography: getStringField(fields, FIELD_CODES.bio) || undefined,
    main_profession: getOptionLabel(fields, FIELD_CODES.profesionPrincipal) || undefined,
    other_professions: getOptionLabels(fields, FIELD_CODES.profesionAdicional),
    // Status de Empleo may arrive as a single option object or an array of options.
    availability_status:
      getOptionLabel(fields, FIELD_CODES.statusEmpleo) ||
      getOptionLabels(fields, FIELD_CODES.statusEmpleo)[0] ||
      undefined,
    city: getStringField(fields, FIELD_CODES.ciudad) || undefined,
    country: getOptionLabel(fields, FIELD_CODES.pais) || undefined,
    membership_type: normalizeMembershipType(env, contact.MembershipLevel),
    // MemberSince comes back as a FieldValue (not top-level) in async responses.
    created_at: getStringField(fields, 'MemberSince') || contact.MemberSince || undefined,
    social_media: {
      linkedin: getStringField(fields, FIELD_CODES.linkedin) || undefined,
      instagram: getStringField(fields, FIELD_CODES.instagram) || undefined,
      twitter: getStringField(fields, FIELD_CODES.twitter) || undefined,
      website: getStringField(fields, FIELD_CODES.website) || undefined,
    },
  };
}

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context;

  try {
    const cached = await env.KV.get(KV_KEY);
    if (cached) {
      log('gallery.cache_hit', {});
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, s-maxage=${CACHE_TTL}`,
          ...CORS_HEADERS,
        },
      });
    }

    const token = await getWAToken(env);
    const auth = { Authorization: `Bearer ${token}` };
    const base = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}/contacts`;
    const filter = "'Membership status' eq 'Active'";

    // The synchronous contacts list returns only simplified records (system fields,
    // no custom FieldValues). To get full profiles (bio, profession, social, etc.) we
    // use the asynchronous request: kick it off ONCE, then read its computed ResultUrl.
    // Async results are capped at 100 rows, so page the SAME result with $skip (those
    // reads return immediately — no extra polling, which keeps us under the Worker
    // subrequest limit). A dedup guard prevents an unbounded loop if $skip is ignored.
    const PAGE = 100;
    const startRes = await fetch(`${base}?$async=true&$filter=${encodeURIComponent(filter)}`, { headers: auth });
    if (!startRes.ok) {
      const errBody = await startRes.text().catch(() => '');
      throw new Error(`WA contacts async start failed: ${startRes.status} — ${errBody.slice(0, 300)}`);
    }
    const startData = await startRes.json() as { Contacts?: WAContact[]; ResultUrl?: string };
    const resultUrl = startData.ResultUrl;

    const contacts: WAContact[] = [];
    const seen = new Set<number>();
    for (let skip = 0; skip < 5000; skip += PAGE) {
      let page: WAContact[] | null = skip === 0 ? (startData.Contacts ?? null) : null;
      // Poll only while the async result is still computing (first reads); paged reads
      // of a ready result return Contacts immediately.
      for (let i = 0; i < 8 && !page && resultUrl; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const u = new URL(resultUrl);
        u.searchParams.set('$top', String(PAGE));
        u.searchParams.set('$skip', String(skip));
        const r = await fetch(u.toString(), { headers: auth });
        if (!r.ok) throw new Error(`WA contacts result failed: ${r.status}`);
        const d = await r.json() as { Contacts?: WAContact[] };
        if (Array.isArray(d.Contacts)) page = d.Contacts;
      }
      if (!page) throw new Error('WA contacts async timed out');

      const fresh = page.filter(c => !seen.has(c.Id));
      fresh.forEach(c => seen.add(c.Id));
      contacts.push(...fresh);
      if (page.length < PAGE || fresh.length === 0) break; // last page (or $skip ignored)
    }

    const members = contacts.map(c => transformContact(env, c));

    log('gallery.cache_miss', { count: members.length });

    const body = JSON.stringify({ members, total: members.length });
    await env.KV.put(KV_KEY, body, { expirationTtl: CACHE_TTL });

    return new Response(body, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, s-maxage=${CACHE_TTL}`,
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    logError('gallery.fetch_error', err, {});
    return new Response(
      JSON.stringify({ error: 'No se ha podido cargar el directorio. Inténtalo de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
