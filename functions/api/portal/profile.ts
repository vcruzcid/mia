// GET /api/portal/profile — fetch member profile from WildApricot
// PUT /api/portal/profile — update member profile in WildApricot
//
// Protected by _middleware.ts — context.data.session is guaranteed to exist.
//
// IMPORTANT: FIELD_CODES below are placeholders.
// Run: curl -s -H "Authorization: Bearer <TOKEN>" \
//   "https://api.wildapricot.org/v2.2/accounts/511043/contactfields" | jq '.[] | {FieldName,SystemCode}'
// Then fill in the actual SystemCodes.

import { getContact, updateContact, type WAContactsEnv, type WAContact } from '../../_lib/wa-contacts';

// TODO: Fill in actual SystemCodes after running:
// GET /accounts/511043/contactfields
const FIELD_CODES = {
  bio: 'custom-FILL_ME',
  specializations: 'custom-FILL_ME',
  linkedin: 'custom-FILL_ME',
  instagram: 'custom-FILL_ME',
  twitter: 'custom-FILL_ME',
  website: 'custom-FILL_ME',
} as const;

interface Env extends WAContactsEnv {
  KV: KVNamespace;
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

function getArrayField(fv: FieldValue[], code: string): string[] {
  const raw = fv.find(f => f.SystemCode === code)?.Value;
  if (!Array.isArray(raw)) return [];
  // WA multi-select returns [{ Id, Label }] — extract Label strings
  return raw.map((item: unknown) => {
    if (typeof item === 'object' && item !== null && 'Label' in item) {
      return String((item as { Label: unknown }).Label);
    }
    return String(item);
  });
}

function mapContactToProfile(contact: WAContact) {
  const fv = (contact.FieldValues ?? []) as FieldValue[];
  return {
    contactId: String(contact.Id),
    firstName: contact.FirstName,
    lastName: contact.LastName,
    email: contact.Email,
    bio: getStringField(fv, FIELD_CODES.bio),
    // City/Country: try top-level first, fall back to FieldValues if needed
    city: (contact as Record<string, unknown>)['City'] as string ?? getStringField(fv, 'City'),
    country: (contact as Record<string, unknown>)['Country'] as string ?? getStringField(fv, 'Country'),
    specializations: getArrayField(fv, FIELD_CODES.specializations),
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

export async function onRequestGet(
  context: { request: Request; env: Env; data: Record<string, unknown> },
): Promise<Response> {
  const session = context.data['session'] as SessionData | undefined;
  if (!session) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const contact = await getContact(context.env, parseInt(session.contactId, 10));
    const profile = mapContactToProfile(contact);
    return new Response(
      JSON.stringify({ success: true, profile }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Failed to fetch contact profile:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Error obteniendo perfil' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
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
  const session = context.data['session'] as SessionData | undefined;
  if (!session) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: ProfileUpdateBody;
  try {
    body = await context.request.json() as ProfileUpdateBody;
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Cuerpo de la solicitud inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const contactId = parseInt(session.contactId, 10);

  // Build FieldValues — specializations written as [{ Id }] if we have IDs,
  // but since we store Labels, we write string values for text fields.
  // For multi-select fields WA expects [{ Id }], but if we only have labels
  // we write them as-is and WA will attempt to match.
  // TODO: once FIELD_CODES are filled and multi-select options discovered,
  // resolve label→id mapping here.
  const fieldValues: FieldValue[] = [
    { FieldName: 'Bio', SystemCode: FIELD_CODES.bio, Value: body.bio ?? '' },
    { FieldName: 'Specializations', SystemCode: FIELD_CODES.specializations, Value: body.specializations ?? [] },
    { FieldName: 'LinkedIn', SystemCode: FIELD_CODES.linkedin, Value: body.socialLinks?.linkedin ?? '' },
    { FieldName: 'Instagram', SystemCode: FIELD_CODES.instagram, Value: body.socialLinks?.instagram ?? '' },
    { FieldName: 'Twitter', SystemCode: FIELD_CODES.twitter, Value: body.socialLinks?.twitter ?? '' },
    { FieldName: 'Website', SystemCode: FIELD_CODES.website, Value: body.socialLinks?.website ?? '' },
  ];

  const updateFields: Record<string, unknown> = {
    FieldValues: fieldValues,
  };

  if (body.firstName !== undefined) updateFields['FirstName'] = body.firstName;
  if (body.lastName !== undefined) updateFields['LastName'] = body.lastName;
  // City/Country: set as top-level fields (standard WA fields)
  if (body.city !== undefined) updateFields['City'] = body.city;
  if (body.country !== undefined) updateFields['Country'] = body.country;

  try {
    await updateContact(context.env, contactId, updateFields);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Failed to update contact:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Error actualizando perfil' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
