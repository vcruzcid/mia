import { FIELD_CODES } from './wa-field-ids';
import { getContact, getMemberCode, updateContact, type WAContactsEnv } from './wa-contacts';
import { warn } from './logger';

export interface MemberCodeEnv extends WAContactsEnv {
  DB: D1Database;
  MEMBER_CODE_NEXT_START: string;
}

interface MemberCodeAssignmentRow {
  email: string;
  contact_id: string;
  member_code: number;
}

const SEQUENCE_ID = 1;

function parseStartValue(raw: string): number {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid MEMBER_CODE_NEXT_START value: ${raw}`);
  }
  return parsed;
}

async function ensureSequenceSeeded(env: MemberCodeEnv): Promise<void> {
  const startValue = parseStartValue(env.MEMBER_CODE_NEXT_START);
  await env.DB
    .prepare(`
      INSERT INTO member_code_sequence (id, next_value)
      VALUES (?, ?)
      ON CONFLICT(id) DO NOTHING
    `)
    .bind(SEQUENCE_ID, startValue)
    .run();
}

async function findAssignmentByContactId(
  env: MemberCodeEnv,
  contactId: number,
): Promise<MemberCodeAssignmentRow | null> {
  const row = await env.DB
    .prepare(`
      SELECT email, contact_id, member_code
      FROM member_code_assignments
      WHERE contact_id = ?
      LIMIT 1
    `)
    .bind(String(contactId))
    .first<MemberCodeAssignmentRow>();

  return row ?? null;
}

async function findAssignmentByEmail(
  env: MemberCodeEnv,
  email: string,
): Promise<MemberCodeAssignmentRow | null> {
  const row = await env.DB
    .prepare(`
      SELECT email, contact_id, member_code
      FROM member_code_assignments
      WHERE email = ?
      LIMIT 1
    `)
    .bind(email)
    .first<MemberCodeAssignmentRow>();

  return row ?? null;
}

async function syncAssignmentEmail(
  env: MemberCodeEnv,
  contactId: number,
  email: string,
): Promise<void> {
  try {
    await env.DB
      .prepare(`
        UPDATE member_code_assignments
        SET email = ?
        WHERE contact_id = ? AND email != ?
      `)
      .bind(email, String(contactId), email)
      .run();
  } catch (err) {
    warn('member_code.email_sync_failed', {
      email,
      contactId,
      error: err instanceof Error ? err.message : String(err ?? ''),
    });
  }
}

async function reserveNextCode(env: MemberCodeEnv): Promise<number> {
  await ensureSequenceSeeded(env);

  const row = await env.DB
    .prepare(`
      UPDATE member_code_sequence
      SET next_value = next_value + 1
      WHERE id = ?
      RETURNING next_value - 1 AS member_code
    `)
    .bind(SEQUENCE_ID)
    .first<{ member_code: number }>();

  if (!row) {
    throw new Error('Unable to reserve next member code');
  }

  return row.member_code;
}

export async function getOrReserveMemberCodeForEmail(
  env: MemberCodeEnv,
  email: string,
): Promise<string> {
  const existingAssignment = await findAssignmentByEmail(env, email);
  if (existingAssignment) {
    return String(existingAssignment.member_code);
  }

  return String(await reserveNextCode(env));
}

async function persistAssignment(
  env: MemberCodeEnv,
  email: string,
  contactId: number,
  memberCode: number,
): Promise<number> {
  try {
    await env.DB
      .prepare(`
        INSERT INTO member_code_assignments (email, contact_id, member_code, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `)
      .bind(email, String(contactId), memberCode)
      .run();

    return memberCode;
  } catch (err) {
    warn('member_code.conflict_on_insert', {
      email,
      contactId,
      error: err instanceof Error ? err.message : String(err ?? ''),
    });
    const existing = await findAssignmentByContactId(env, contactId);
    if (!existing) throw new Error('Unable to persist member code assignment');
    return existing.member_code;
  }
}

export async function attachMemberCodeAssignment(
  env: MemberCodeEnv,
  email: string,
  contactId: number,
  memberCode: string,
): Promise<string> {
  const existingByContact = await findAssignmentByContactId(env, contactId);
  if (existingByContact) {
    if (existingByContact.email !== email) {
      await syncAssignmentEmail(env, contactId, email);
    }
    return String(existingByContact.member_code);
  }

  const existingByEmail = await findAssignmentByEmail(env, email);
  if (existingByEmail) {
    await env.DB
      .prepare(`
        UPDATE member_code_assignments
        SET contact_id = ?, member_code = ?, created_at = datetime('now')
        WHERE email = ?
      `)
      .bind(String(contactId), Number.parseInt(memberCode, 10), email)
      .run();
    return String(existingByEmail.member_code);
  }

  const assignedCode = await persistAssignment(env, email, contactId, Number.parseInt(memberCode, 10));
  return String(assignedCode);
}

async function writeMemberCodeToWA(
  env: MemberCodeEnv,
  contactId: number,
  memberCode: string,
): Promise<void> {
  await updateContact(env, contactId, {
    FieldValues: [
      {
        FieldName: 'Código de socia',
        SystemCode: FIELD_CODES.memberCode,
        Value: memberCode,
      },
    ],
  });
}

export async function ensureMemberCode(
  env: MemberCodeEnv,
  contactId: number,
  email: string,
): Promise<string> {
  const contact = await getContact(env, contactId);
  const existingCode = getMemberCode(contact);
  if (existingCode) return existingCode;

  const existingAssignment = await findAssignmentByContactId(env, contactId);
  if (existingAssignment) {
    if (existingAssignment.email !== email) {
      await syncAssignmentEmail(env, contactId, email);
    }
    const assignedCode = String(existingAssignment.member_code);
    await writeMemberCodeToWA(env, contactId, assignedCode);
    return assignedCode;
  }

  const reservedCode = await reserveNextCode(env);
  const assignedCode = await persistAssignment(env, email, contactId, reservedCode);
  const memberCode = String(assignedCode);
  await writeMemberCodeToWA(env, contactId, memberCode);
  return memberCode;
}
