// GET /api/members — member gallery data, fetched from WildApricot and cached in KV for 1 hour.

import { getWAToken } from '../_lib/wa-token';
import { FIELD_CODES } from '../_lib/wa-field-ids';
import { log, logError } from '../_lib/logger';

const KV_KEY = 'gallery_members';
const CACHE_TTL = 3600; // 1 hour

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
  ProfileImage?: { Url?: string; IsDefault?: boolean };
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
  const photo = contact.ProfileImage;
  return {
    id: String(contact.Id),
    first_name: contact.FirstName,
    last_name: contact.LastName,
    display_name: contact.DisplayName,
    profile_image_url: photo && photo.IsDefault === false ? photo.Url : undefined,
    biography: getStringField(fields, FIELD_CODES.bio) || undefined,
    main_profession: getOptionLabel(fields, FIELD_CODES.profesionPrincipal) || undefined,
    other_professions: getOptionLabels(fields, FIELD_CODES.profesionAdicional),
    availability_status: getOptionLabel(fields, FIELD_CODES.statusEmpleo) || undefined,
    city: getStringField(fields, FIELD_CODES.ciudad) || undefined,
    country: getOptionLabel(fields, FIELD_CODES.pais) || undefined,
    membership_type: normalizeMembershipType(env, contact.MembershipLevel),
    created_at: contact.MemberSince,
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
    const params = new URLSearchParams({
      '$filter': 'MembershipEnabled eq true',
      '$select': 'Id,FirstName,LastName,DisplayName,MembershipLevel,MemberSince,ProfileImage,FieldValues',
      '$top': '500',
      '$async': 'false',
    });
    const res = await fetch(
      `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}/contacts?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`WA contacts fetch failed: ${res.status}`);

    const data = await res.json() as { Contacts: WAContact[] };
    const members = (data.Contacts ?? []).map(c => transformContact(env, c));

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
