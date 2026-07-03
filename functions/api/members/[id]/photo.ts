// GET /api/members/:id/photo — member profile photo proxy.
//
// The WildApricot photo lives in the custom Picture field `fotoPerfil` and its
// URL is auth-gated (api.wildapricot.org returns 401 without a Bearer token), so a
// browser <img> cannot load it directly. This Worker looks up the contact's photo
// URL, fetches the image WITH the token, and streams it back publicly — caching the
// bytes in the Cloudflare Cache API and the contact→URL mapping in KV so repeat
// views cost zero-to-one WildApricot subrequests. Members with no photo redirect to
// the static placeholder.

import { getWAToken } from '../../../_lib/wa-token';
import { FIELD_CODES } from '../../../_lib/wa-field-ids';
import { log, logError } from '../../../_lib/logger';

interface Env {
  KV: KVNamespace;
  WILDAPRICOT_API_KEY: string;
  WILDAPRICOT_ACCOUNT_ID: string;
}

interface WAFieldValue { SystemCode: string; Value: unknown }

// 30 min during onboarding so updated photos surface quickly; mirrors the gallery
// cache. Restore to 86400 (24h) once the directory stabilizes.
const IMAGE_TTL = 1800;
const PLACEHOLDER = '/avatar-placeholder.jpg';

// KV value for the contact→photo mapping. Empty string is a cached "no photo".
function photoUrlKey(id: string): string {
  return `photo_url:${id}`;
}

function extractPhotoUrl(fields: WAFieldValue[] | undefined): string {
  const raw = fields?.find(f => f.SystemCode === FIELD_CODES.fotoPerfil)?.Value;
  if (raw && typeof raw === 'object') {
    const url = (raw as { Url?: string }).Url;
    if (typeof url === 'string' && url.trim()) return url.trim();
  }
  return '';
}

interface Context {
  request: Request;
  env: Env;
  params: { id: string | string[] };
  waitUntil: (p: Promise<unknown>) => void;
}

export async function onRequestGet(context: Context): Promise<Response> {
  const { request, env, params } = context;
  const id = String(Array.isArray(params.id) ? params.id[0] : params.id);

  if (!/^\d+$/.test(id)) {
    return new Response('Invalid member id', { status: 400 });
  }

  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) {
    log('gallery.photo_cache_hit', { contactId: id });
    return hit;
  }

  try {
    const token = await getWAToken(env);
    const auth = { Authorization: `Bearer ${token}` };

    // 1. Resolve contact → photo URL, cached in KV (empty string = known no-photo).
    let photoUrl = await env.KV.get(photoUrlKey(id));
    if (photoUrl === null) {
      const contactRes = await fetch(
        `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}/contacts/${id}`,
        { headers: auth },
      );
      if (contactRes.status === 404) {
        photoUrl = '';
      } else if (!contactRes.ok) {
        throw new Error(`WA contact lookup failed: ${contactRes.status}`);
      } else {
        const contact = await contactRes.json() as { FieldValues?: WAFieldValue[] };
        photoUrl = extractPhotoUrl(contact.FieldValues);
      }
      await env.KV.put(photoUrlKey(id), photoUrl, { expirationTtl: IMAGE_TTL });
    }

    if (!photoUrl) {
      log('gallery.photo_missing', { contactId: id });
      return Response.redirect(new URL(PLACEHOLDER, request.url).toString(), 302);
    }

    // 2. Fetch the actual image WITH the token and stream it back publicly.
    const imgRes = await fetch(photoUrl, { headers: auth });
    if (!imgRes.ok) {
      logError('gallery.photo_fetch_failed', undefined, { contactId: id, status: imgRes.status });
      return Response.redirect(new URL(PLACEHOLDER, request.url).toString(), 302);
    }

    const response = new Response(imgRes.body, {
      headers: {
        'Content-Type': imgRes.headers.get('Content-Type') || 'image/png',
        'Cache-Control': `public, max-age=${IMAGE_TTL}, s-maxage=${IMAGE_TTL}`,
        'Access-Control-Allow-Origin': '*',
      },
    });

    log('gallery.photo_served', { contactId: id });
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    logError('gallery.photo_error', err, { contactId: id });
    return Response.redirect(new URL(PLACEHOLDER, request.url).toString(), 302);
  }
}
