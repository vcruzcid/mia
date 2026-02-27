// WildApricot contact helpers — create/update contacts and apply membership levels

import { getWAToken, type WATokenEnv } from './wa-token';

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
}

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

async function findContactByEmail(
  baseUrl: string,
  headers: Record<string, string>,
  email: string,
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
  return data.Contacts?.[0]?.Id ?? null;
}

export async function createOrUpdateContact(env: WAContactsEnv, data: NewMemberData): Promise<void> {
  const token = await getWAToken(env);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const existingId = await findContactByEmail(baseUrl, headers, data.email);
  const levelId = resolveLevelId(env, data.membershipType);

  const body = {
    ...(existingId ? { Id: existingId } : {}),
    Email: data.email,
    FirstName: data.firstName,
    LastName: data.lastName,
    MembershipLevel: { Id: levelId },
    MembershipEnabled: true,
  };

  const method = existingId ? 'PUT' : 'POST';
  const url = existingId ? `${baseUrl}/contacts/${existingId}` : `${baseUrl}/contacts`;

  const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WA contact ${existingId ? 'update' : 'create'} failed: ${res.status} ${err}`);
  }
}

export async function lapseMembership(env: WAContactsEnv, email: string): Promise<void> {
  const token = await getWAToken(env);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const existingId = await findContactByEmail(baseUrl, headers, email);
  if (!existingId) {
    console.warn(`WA contact not found for email ${email} — skipping lapse`);
    return;
  }

  const res = await fetch(`${baseUrl}/contacts/${existingId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ Id: existingId, MembershipEnabled: false }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WA membership lapse failed: ${res.status} ${err}`);
  }
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
  FieldValues?: Array<{ FieldName: string; SystemCode: string; Value: unknown }>;
}

export async function getContact(env: WAContactsEnv, contactId: number): Promise<WAContact> {
  const token = await getWAToken(env);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  const res = await fetch(`${baseUrl}/contacts/${contactId}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`WA getContact failed: ${res.status}`);
  return res.json() as Promise<WAContact>;
}

export async function getContactByEmail(env: WAContactsEnv, email: string): Promise<WAContact | null> {
  const token = await getWAToken(env);
  const baseUrl = `https://api.wildapricot.org/v2.2/accounts/${env.WILDAPRICOT_ACCOUNT_ID}`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const id = await findContactByEmail(baseUrl, headers, email);
  if (!id) return null;
  // Reuse headers to avoid a second getWAToken call.
  const res = await fetch(`${baseUrl}/contacts/${id}`, { headers });
  if (!res.ok) throw new Error(`WA getContact failed: ${res.status}`);
  return res.json() as Promise<WAContact>;
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
