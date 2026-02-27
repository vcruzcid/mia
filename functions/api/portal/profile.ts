// GET /api/portal/profile — fetch member profile from WildApricot
// PUT /api/portal/profile — update member profile in WildApricot
//
// Protected by _middleware.ts — context.data.session is guaranteed to exist.

import { getContact, updateContact, type WAContactsEnv, type WAContact } from '../../_lib/wa-contacts';
import { getCorsHeaders, getPreflightResponse } from '../../_lib/cors';

const METHODS = 'GET, PUT, OPTIONS';

// Discovered via GET /accounts/511043/contactfields on 2026-02-27
const FIELD_CODES = {
  bio: 'custom-17708434',               // Biografía (text)
  profesionPrincipal: 'custom-17708342', // Profesión Principal (Dropdown — single select)
  profesionAdicional: 'custom-17708340', // Profesión Adicional (MultipleChoice — multi select)
  ciudad: 'custom-17708331',             // Ciudad (custom text)
  pais: 'custom-17708479',               // País (custom text)
  instagram: 'custom-17708437',          // Instagram
  linkedin: 'custom-17708438',           // LinkedIn
  twitter: 'custom-17774035',            // X/Twitter
  website: 'custom-17708442',            // Website
  statusEmpleo: 'custom-17708435',       // Status de Empleo
} as const;

// Label→Id mapping for Profesión Principal (Dropdown)
// IDs from GET /accounts/511043/contactfields on 2026-02-27
const PROFESION_PRINCIPAL_IDS: Record<string, number> = {
  'Guión': 23050045, 'Dirección': 23050046, 'Storyboard': 23050047,
  'Dirección de arte': 23050048, 'Concept Art': 23050049, 'Diseño de personajes': 23050050,
  'Diseño de sets': 23050051, 'Visual Development': 23050052, 'Modelado 3D': 23050053,
  'Motion Graphics': 23050054, 'Layout 2D': 23050055, 'Layout 3D': 23050056,
  'Color BG': 23050057, 'Rigging 2D': 23050058, 'Rigging 3D': 23050059,
  'Animación 2D': 23050060, '2D FX': 23050061, 'Clean Up': 23050062,
  'Ink and Paint': 23050063, 'Animación 3D': 23050064, 'Animación StopMotion': 23050065,
  'Artista para Stopmotion': 23050066, 'Composición Digital': 23050067,
  'Sonido/ Música/ SFX': 23050068, 'Montaje': 23050069, 'Pipeline': 23050070,
  'Producción': 23050071, 'Asistente de producción': 23050072,
  'Directora de producción': 23050073, 'Coordinadora de producción': 23050074,
  'Line producer': 23050075, 'Producción ejecutiva': 23050076, 'Matte painting': 23050077,
  'Render wrangler': 23050078, 'Lighting': 23050079, 'Shading': 23050080,
  'Marketing': 23050081, 'Groom artist': 23050082, 'Compositora musical': 23050083,
};

// Label→Id mapping for Profesión Adicional (MultipleChoice)
// IDs from GET /accounts/511043/contactfields on 2026-02-27
const PROFESION_ADICIONAL_IDS: Record<string, number> = {
  'Guión': 23050006, 'Dirección': 23050007, 'Storyboard': 23050008,
  'Dirección de arte': 23050009, 'Concept Art': 23050010, 'Diseño de personajes': 23050011,
  'Diseño de sets': 23050012, 'Visual Development': 23050013, 'Modelado 3D': 23050014,
  'Motion Graphics': 23050015, 'Layout 2D': 23050016, 'Layout 3D': 23050017,
  'Color BG': 23050018, 'Rigging 2D': 23050019, 'Rigging 3D': 23050020,
  'Animación 2D': 23050021, '2D FX': 23050022, 'Clean Up': 23050023,
  'Ink and Paint': 23050024, 'Animación 3D': 23050025, 'Animación StopMotion': 23050026,
  'Artista para Stopmotion': 23050027, 'Composición Digital': 23050028,
  'Sonido/ Música/ SFX': 23050029, 'Montaje': 23050030, 'Pipeline': 23050031,
  'Producción': 23050032, 'Asistente de producción': 23050033,
  'Directora de producción': 23050034, 'Coordinadora de producción': 23050035,
  'Line producer': 23050036, 'Producción ejecutiva': 23050037, 'Matte painting': 23050038,
  'Render wrangler': 23050039, 'Lighting': 23050040, 'Shading': 23050041,
  'Marketing': 23050042, 'Groom artist': 23050043, 'Compositora musical': 23050044,
};

interface Env extends WAContactsEnv {
  KV: KVNamespace;
}

interface PortalProfile {
  contactId: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  city: string;
  country: string;
  specializations: string[];
  socialLinks: { linkedin: string; instagram: string; twitter: string; website: string };
  membershipLevel: string;
  membershipStatus: string;
}

interface SessionData {
  email: string;
  contactId: string;
  nombre: string;
}

type FieldValue = { FieldName: string; SystemCode: string; Value: unknown };

function getStringField(fv: FieldValue[], code: string): string {
  return String(fv.find(f => f.SystemCode === code)?.Value ?? '');
}

// Dropdown (single): WA returns { Id, Label } object or null
function getDropdownLabel(fv: FieldValue[], code: string): string {
  const raw = fv.find(f => f.SystemCode === code)?.Value;
  if (raw && typeof raw === 'object' && 'Label' in raw) {
    return String((raw as { Label: unknown }).Label);
  }
  return '';
}

// MultipleChoice (multi): WA returns [{ Id, Label }]
function getMultiLabels(fv: FieldValue[], code: string): string[] {
  const raw = fv.find(f => f.SystemCode === code)?.Value;
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    if (typeof item === 'object' && item !== null && 'Label' in item) {
      return String((item as { Label: unknown }).Label);
    }
    return String(item);
  }).filter(Boolean);
}

function mapContactToProfile(contact: WAContact): PortalProfile {
  const fv = (contact.FieldValues ?? []) as FieldValue[];
  // Collect specializations: primary (single) + additional (multi), deduplicated
  const primary = getDropdownLabel(fv, FIELD_CODES.profesionPrincipal);
  const additional = getMultiLabels(fv, FIELD_CODES.profesionAdicional);
  const specializations = primary
    ? [primary, ...additional.filter(s => s !== primary)]
    : additional;

  return {
    contactId: String(contact.Id),
    firstName: contact.FirstName,
    lastName: contact.LastName,
    email: contact.Email,
    bio: getStringField(fv, FIELD_CODES.bio),
    city: getStringField(fv, FIELD_CODES.ciudad),
    country: getStringField(fv, FIELD_CODES.pais),
    specializations,
    socialLinks: {
      linkedin: getStringField(fv, FIELD_CODES.linkedin),
      instagram: getStringField(fv, FIELD_CODES.instagram),
      twitter: getStringField(fv, FIELD_CODES.twitter),
      website: getStringField(fv, FIELD_CODES.website),
    },
    membershipLevel: contact.MembershipLevel?.Name ?? '',
    membershipStatus: contact.Status ?? '',
  };
}

export function onRequestOptions(context: { request: Request }): Response {
  return getPreflightResponse(context.request, METHODS);
}

export async function onRequestGet(
  context: { request: Request; env: Env; data: Record<string, unknown> },
): Promise<Response> {
  const cors = getCorsHeaders(context.request, METHODS);
  const session = context.data['session'] as SessionData | undefined;
  if (!session) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: cors },
    );
  }

  try {
    const contact = await getContact(context.env, parseInt(session.contactId, 10));
    const profile = mapContactToProfile(contact);
    return new Response(
      JSON.stringify({ success: true, profile }),
      { status: 200, headers: cors },
    );
  } catch (err) {
    console.error('Failed to fetch contact profile:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Error obteniendo perfil' }),
      { status: 500, headers: cors },
    );
  }
}

// Request body shape for PUT
interface ProfileUpdateBody {
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  country?: string;
  specializations?: string[];
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export async function onRequestPut(
  context: { request: Request; env: Env; data: Record<string, unknown> },
): Promise<Response> {
  const cors = getCorsHeaders(context.request, METHODS);
  const session = context.data['session'] as SessionData | undefined;
  if (!session) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: cors },
    );
  }

  let body: ProfileUpdateBody;
  try {
    body = await context.request.json() as ProfileUpdateBody;
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Cuerpo de la solicitud inválido' }),
      { status: 400, headers: cors },
    );
  }

  const contactId = parseInt(session.contactId, 10);
  const specs = body.specializations ?? [];

  // Split specializations: first → Profesión Principal (Dropdown), rest → Profesión Adicional (MultipleChoice)
  // Dropdown write: { Id: number } or null to clear
  const primaryLabel = specs[0];
  const primaryId = primaryLabel ? PROFESION_PRINCIPAL_IDS[primaryLabel] : undefined;
  const primaryValue = primaryId ? { Id: primaryId } : null;

  // MultipleChoice write: [{ Id: number }]
  const additionalLabels = specs.slice(1);
  const additionalValue = additionalLabels
    .map(label => PROFESION_ADICIONAL_IDS[label])
    .filter((id): id is number => id !== undefined)
    .map(id => ({ Id: id }));

  const fieldValues: FieldValue[] = [
    { FieldName: 'Biografía', SystemCode: FIELD_CODES.bio, Value: body.bio ?? '' },
    { FieldName: 'Profesión Principal', SystemCode: FIELD_CODES.profesionPrincipal, Value: primaryValue },
    { FieldName: 'Profesión Adicional', SystemCode: FIELD_CODES.profesionAdicional, Value: additionalValue },
    { FieldName: 'Ciudad', SystemCode: FIELD_CODES.ciudad, Value: body.city ?? '' },
    { FieldName: 'País', SystemCode: FIELD_CODES.pais, Value: body.country ?? '' },
    { FieldName: 'LinkedIn', SystemCode: FIELD_CODES.linkedin, Value: body.socialLinks?.linkedin ?? '' },
    { FieldName: 'Instagram', SystemCode: FIELD_CODES.instagram, Value: body.socialLinks?.instagram ?? '' },
    { FieldName: 'X/Twitter', SystemCode: FIELD_CODES.twitter, Value: body.socialLinks?.twitter ?? '' },
    { FieldName: 'Website', SystemCode: FIELD_CODES.website, Value: body.socialLinks?.website ?? '' },
  ];

  const updateFields: Record<string, unknown> = {
    FieldValues: fieldValues,
  };

  if (body.firstName !== undefined) updateFields['FirstName'] = body.firstName;
  if (body.lastName !== undefined) updateFields['LastName'] = body.lastName;

  try {
    await updateContact(context.env, contactId, updateFields);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: cors },
    );
  } catch (err) {
    console.error('Failed to update contact:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Error actualizando perfil' }),
      { status: 500, headers: cors },
    );
  }
}
