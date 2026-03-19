// WildApricot contact helpers — create/update contacts and apply membership levels

import { getWAToken, type WATokenEnv } from './wa-token';
import { log, warn } from './logger';
import { COUNTRY_CODE_TO_LABEL, COUNTRY_IDS, FIELD_CODES } from './wa-field-ids';

export interface WAContactsEnv extends WATokenEnv {
  WILDAPRICOT_ACCOUNT_ID: string;
  WA_LEVEL_ID_PLENO_DERECHO: string;
  WA_LEVEL_ID_ESTUDIANTE: string;
  WA_LEVEL_ID_COLABORADOR: string;
}

export interface NewMemberData {
  email: string;
  firstName: string;
  lastName: string;
  membershipType: string;
  country?: string;
  memberCode?: string;
  /**
   * When provided, skips the internal `findContactByEmail` lookup and uses this ID directly.
   * Pass when the caller has already resolved the contact ID to avoid a redundant WA API call.
   */
  existingContactId?: number;
}

type WAFieldValue = { FieldName?: string; SystemCode: string; Value: unknown };

function resolveLevelId(env: WAContactsEnv, membershipType: string): number {
  const map: Record<string, string> = {
    'pleno-derecho': env.WA_LEVEL_ID_PLENO_DERECHO,
    'estudiante': env.WA_LEVEL_ID_ESTUDIANTE,
    'colaborador': env.WA_LEVEL_ID_COLABORADOR,
  };
  const id = map[membershipType];
  if (!id) throw new Error(`Unknown membership type: ${membershipType}`);
  return parseInt(id, 10);
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || (parts[0] ?? ''),
  };
}

export { splitName };

function getStringFieldValue(fieldValues: WAFieldValue[] | undefined, systemCode: string): string {
  const raw = fieldValues?.find(field => field.SystemCode === systemCode)?.Value;
  if (raw === undefined || raw === null) return '';
  return String(raw).trim();
}

export function getMemberCode(contact: Pick<WAContact, 'FieldValues'>): string {
  return getStringFieldValue(contact.FieldValues as WAFieldValue[] | undefined, FIELD_CODES.memberCode);
}

async function getContactById(
  baseUrl: string,
  headers: Record<string, string>,
  contactId: number,
): Promise<WAContact> {
  const res = await fetch(`${baseUrl}/contacts/${contactId}`, { headers });
  if (!res.ok) throw new Error(`WA getContact failed: ${res.status}`);
  return res.json() as Promise<WAContact>;
}

async function findContactByEmail(
  baseUrl: string,
  headers: Record<string, string>,
  email: string,
  requestId?: string,
): Promise<number | null> {
  // Escape single quotes per OData convention to prevent filter injection.
  const safeEmail = email.replace(/'/g, "''");
  const filter = encodeURIComponent(`Email eq '${safeEmail}'`);
  const res = await fetch(
    `${baseUrl}/contacts?$filter=${filter}&$select=Id&$async=false`,
    { headers },
  );
  if (!res.ok) throw new Error(`WA contact search failed: ${res.status}`);
  const data = await res.json() as { Contacts: Array<{ Id: number }> };
  const contactId = data.Contacts?.[0]?.Id ?? null;
  log('wa.contact_lookup', { email, found: contactId !== null, requestId });
  return contactId;
}

export async function createOrUpdateContact(
  env: WAContactsEnv,
  data: NewMemberData,
  requestId?: string,
): Promise<{ contactId: number; renewalDate: string; memberCode: string }> {
  const token = await getWAToken(env, requestId);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const existingId = data.existingContactId ?? await findContactByEmail(baseUrl, headers, data.email, requestId);
  const levelId = resolveLevelId(env, data.membershipType);

  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const renewalDate = nextYear.toISOString().split('T')[0];

  const fieldValues: Array<{ SystemCode: string; Value: unknown }> = [
    { SystemCode: 'RenewalDue', Value: `${renewalDate}T00:00:00` },
  ];
  if (data.country) {
    const countryLabel = COUNTRY_CODE_TO_LABEL[data.country.toUpperCase()];
    const countryId = countryLabel ? COUNTRY_IDS[countryLabel] : undefined;
    if (countryId) {
      fieldValues.push({ SystemCode: FIELD_CODES.pais, Value: { Id: countryId } });
    }
  }
  if (data.memberCode) {
    fieldValues.push({ SystemCode: FIELD_CODES.memberCode, Value: data.memberCode });
  }

  const body = {
    ...(existingId ? { Id: existingId } : {}),
    Email: data.email,
    FirstName: data.firstName,
    LastName: data.lastName,
    MembershipLevel: { Id: levelId },
    MembershipEnabled: true,
    Status: 'Active',
    MemberSince: today,
    RecreateInvoice: false,
    FieldValues: fieldValues,
  };

  const method = existingId ? 'PUT' : 'POST';
  const url = existingId ? `${baseUrl}/contacts/${existingId}` : `${baseUrl}/contacts`;

  const t0 = Date.now();
  const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WA contact ${existingId ? 'update' : 'create'} failed: ${res.status} ${err}`);
  }

  const durationMs = Date.now() - t0;
  if (existingId) {
    const updatedContact = await getContactById(baseUrl, headers, existingId);
    const memberCode = getMemberCode(updatedContact);
    log('wa.contact_updated', { email: data.email, contactId: existingId, membershipType: data.membershipType, memberSince: today, renewalDue: renewalDate, durationMs, requestId });
    return { contactId: existingId, renewalDate, memberCode };
  }
  const created = await res.json() as { Id: number };
  log('wa.contact_created', { email: data.email, contactId: created.Id, membershipType: data.membershipType, memberSince: today, renewalDue: renewalDate, durationMs, requestId });
  return { contactId: created.Id, renewalDate, memberCode: data.memberCode ?? '' };
}

export async function lapseMembership(env: WAContactsEnv, email: string, requestId?: string): Promise<void> {
  const token = await getWAToken(env, requestId);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const existingId = await findContactByEmail(baseUrl, headers, email, requestId);
  if (!existingId) {
    warn('wa.contact_not_found', { email, requestId });
    return;
  }

  const t0 = Date.now();
  const res = await fetch(`${baseUrl}/contacts/${existingId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ Id: existingId, MembershipEnabled: false }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WA membership lapse failed: ${res.status} ${err}`);
  }

  log('wa.membership_lapsed', { email, contactId: existingId, durationMs: Date.now() - t0, requestId });
}

export interface WAContact {
  Id: number;
  FirstName: string;
  LastName: string;
  Email: string;
  DisplayName?: string;
  MembershipLevel?: { Id: number; Name: string };
  Status?: string;
  MembershipEnabled?: boolean;
  MemberSince?: string;
  MembershipRenewalDue?: string;
  FieldValues?: Array<{ FieldName: string; SystemCode: string; Value: unknown }>;
}

export async function getContact(env: WAContactsEnv, contactId: number): Promise<WAContact> {
  const token = await getWAToken(env);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  return getContactById(baseUrl, { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, contactId);
}

export async function getContactByEmail(env: WAContactsEnv, email: string): Promise<WAContact | null> {
  const token = await getWAToken(env);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const id = await findContactByEmail(baseUrl, headers, email);
  if (!id) return null;
  return getContactById(baseUrl, headers, id);
}

export async function updateContact(
  env: WAContactsEnv,
  contactId: number,
  fields: Record<string, unknown>,
): Promise<void> {
  const token = await getWAToken(env);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  const res = await fetch(`${baseUrl}/contacts/${contactId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Id: contactId, ...fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WA updateContact failed: ${res.status} ${err}`);
  }
}
