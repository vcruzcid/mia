// GET /api/portal/profile — fetch member profile from WildApricot
// PUT /api/portal/profile — update member profile in WildApricot
//
// Protected by _middleware.ts — context.data.session is guaranteed to exist.

import { getContact, updateContact, type WAContactsEnv, type WAContact } from '../../_lib/wa-contacts';
import { getCorsHeaders, getPreflightResponse } from '../../_lib/cors';
import { FIELD_CODES, PROFESION_PRINCIPAL_IDS, PROFESION_ADICIONAL_IDS } from '../../_lib/wa-field-ids';
import { log, logError } from '../../_lib/logger';

const METHODS = 'GET, PUT, OPTIONS';

interface Env extends WAContactsEnv {
  KV: KVNamespace;
}

interface PortalProfile {
  contactId: string;
  memberCode: string;
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
    memberCode: getStringField(fv, FIELD_CODES.memberCode),
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
    log('portal.profile_fetched', { contactId: session.contactId });
    return new Response(
      JSON.stringify({ success: true, profile }),
      { status: 200, headers: cors },
    );
  } catch (err) {
    logError('portal.error', err, { contactId: session.contactId, step: 'fetch' });
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
    log('portal.profile_updated', { contactId: session.contactId });
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: cors },
    );
  } catch (err) {
    logError('portal.error', err, { contactId: session.contactId, step: 'update' });
    return new Response(
      JSON.stringify({ success: false, error: 'Error actualizando perfil' }),
      { status: 500, headers: cors },
    );
  }
}
