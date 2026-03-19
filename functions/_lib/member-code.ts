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

async function findAssignmentByMemberCode(
  env: MemberCodeEnv,
  memberCode: number,
): Promise<MemberCodeAssignmentRow | null> {
  const row = await env.DB
    .prepare(`
      SELECT email, contact_id, member_code
      FROM member_code_assignments
      WHERE member_code = ?
      LIMIT 1
    `)
    .bind(memberCode)
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

function parseMemberCode(memberCode: string): number {
  const parsed = Number.parseInt(memberCode, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid member code value: ${memberCode}`);
  }
  return parsed;
}

export async function reserveNextMemberCode(env: MemberCodeEnv): Promise<string> {
  return String(await reserveNextCode(env));
}

async function insertAssignment(
  env: MemberCodeEnv,
  email: string,
  contactId: number,
  memberCode: number,
): Promise<void> {
  await env.DB
    .prepare(`
      INSERT INTO member_code_assignments (email, contact_id, member_code, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `)
    .bind(email, String(contactId), memberCode)
    .run();
}

export async function ensureMemberCodeAssignment(
  env: MemberCodeEnv,
  email: string,
  contactId: number,
  memberCode: string,
): Promise<string> {
  const parsedCode = parseMemberCode(memberCode);
  const existingByContact = await findAssignmentByContactId(env, contactId);
  if (existingByContact) {
    if (existingByContact.member_code !== parsedCode) {
      // D1 is the source of truth. A concurrent request already persisted a different code.
      // Return D1's code; the caller is responsible for syncing WA if the codes differ.
      warn('member_code.concurrent_assignment_resolved', {
        email,
        contactId,
        requestedCode: parsedCode,
        resolvedCode: existingByContact.member_code,
      });
    }
    if (existingByContact.email !== email) {
      await syncAssignmentEmail(env, contactId, email);
    }
    return String(existingByContact.member_code);
  }

  const existingByCode = await findAssignmentByMemberCode(env, parsedCode);
  if (existingByCode) {
    if (existingByCode.contact_id !== String(contactId)) {
      throw new Error(`Member code ${parsedCode} already assigned to contact ${existingByCode.contact_id}`);
    }
    if (existingByCode.email !== email) {
      await syncAssignmentEmail(env, contactId, email);
    }
    return String(existingByCode.member_code);
  }

  try {
    await insertAssignment(env, email, contactId, parsedCode);
    return String(parsedCode);
  } catch (err) {
    warn('member_code.conflict_on_insert', {
      email,
      contactId,
      memberCode: parsedCode,
      error: err instanceof Error ? err.message : String(err ?? ''),
    });

    const byContact = await findAssignmentByContactId(env, contactId);
    if (byContact) {
      if (byContact.member_code !== parsedCode) {
        // Same as the pre-check case: trust D1 over the requested code.
        warn('member_code.concurrent_assignment_resolved', {
          email,
          contactId,
          requestedCode: parsedCode,
          resolvedCode: byContact.member_code,
        });
      }
      if (byContact.email !== email) {
        await syncAssignmentEmail(env, contactId, email);
      }
      return String(byContact.member_code);
    }

    const byCode = await findAssignmentByMemberCode(env, parsedCode);
    if (byCode) {
      if (byCode.contact_id !== String(contactId)) {
        throw new Error(`Member code ${parsedCode} already assigned to contact ${byCode.contact_id}`);
      }
      if (byCode.email !== email) {
        await syncAssignmentEmail(env, contactId, email);
      }
      return String(byCode.member_code);
    }

    throw new Error('Unable to persist member code assignment');
  }
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
  if (existingCode) {
    const assignedCode = await ensureMemberCodeAssignment(env, email, contactId, existingCode);
    if (assignedCode !== existingCode) {
      // WA has a stale code from a concurrent request — restore the D1 truth.
      await writeMemberCodeToWA(env, contactId, assignedCode);
    }
    return assignedCode;
  }

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
  const memberCode = await ensureMemberCodeAssignment(env, email, contactId, String(reservedCode));
  await writeMemberCodeToWA(env, contactId, memberCode);
  return memberCode;
}
