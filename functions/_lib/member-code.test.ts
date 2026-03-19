// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const waContacts = vi.hoisted(() => ({
  getContact: vi.fn(),
  getMemberCode: vi.fn(),
  updateContact: vi.fn(),
}));

vi.mock('./wa-contacts', () => ({
  getContact: waContacts.getContact,
  getMemberCode: waContacts.getMemberCode,
  updateContact: waContacts.updateContact,
}));

vi.mock('./logger', () => ({
  warn: vi.fn(),
}));

import {
  ensureMemberCode,
  ensureMemberCodeAssignment,
  reserveNextMemberCode,
  type MemberCodeEnv,
} from './member-code';

interface AssignmentRow {
  email: string;
  contact_id: string;
  member_code: number;
  created_at: string;
}

class FakeD1Statement {
  private args: unknown[] = [];

  constructor(
    private readonly db: FakeD1Database,
    private readonly query: string,
  ) {}

  bind(...args: unknown[]): this {
    this.args = args;
    return this;
  }

  async run(): Promise<{ success: true }> {
    const sql = this.normalizedQuery();

    if (sql.includes('INSERT INTO member_code_sequence')) {
      const startValue = Number(this.args[1]);
      if (this.db.sequence === null) {
        this.db.sequence = startValue;
      }
      return { success: true };
    }

    if (sql.includes('INSERT INTO member_code_assignments')) {
      const [email, contactId, memberCode] = this.args as [string, string, number];
      this.db.insertAssignment(email, contactId, memberCode);
      return { success: true };
    }

    if (sql.includes('UPDATE member_code_assignments') && sql.includes('SET email = ?')) {
      const [email, contactId, expectedOldEmail] = this.args as [string, string, string];
      this.db.syncEmail(contactId, email, expectedOldEmail);
      return { success: true };
    }

    throw new Error(`Unsupported run query in test DB: ${sql}`);
  }

  async first<T>(): Promise<T | null> {
    const sql = this.normalizedQuery();

    if (sql.includes('UPDATE member_code_sequence') && sql.includes('RETURNING next_value - 1 AS member_code')) {
      if (this.db.sequence === null) {
        throw new Error('Sequence not seeded');
      }
      const memberCode = this.db.sequence;
      this.db.sequence += 1;
      return { member_code: memberCode } as T;
    }

    if (sql.includes('FROM member_code_assignments') && sql.includes('WHERE contact_id = ?')) {
      const contactId = String(this.args[0]);
      return (this.db.findByContactId(contactId) ?? null) as T | null;
    }

    if (sql.includes('FROM member_code_assignments') && sql.includes('WHERE member_code = ?')) {
      const memberCode = Number(this.args[0]);
      return (this.db.findByMemberCode(memberCode) ?? null) as T | null;
    }

    throw new Error(`Unsupported first query in test DB: ${sql}`);
  }

  private normalizedQuery(): string {
    return this.query.replace(/\s+/g, ' ').trim();
  }
}

class FakeD1Database {
  sequence: number | null = null;
  private readonly assignments = new Map<string, AssignmentRow>();

  prepare(query: string): FakeD1Statement {
    return new FakeD1Statement(this, query);
  }

  seedAssignment(email: string, contactId: number, memberCode: number): void {
    this.assignments.set(String(contactId), {
      email,
      contact_id: String(contactId),
      member_code: memberCode,
      created_at: '2026-03-19 00:00:00',
    });
  }

  findByContactId(contactId: string): AssignmentRow | undefined {
    return this.assignments.get(contactId);
  }

  findByMemberCode(memberCode: number): AssignmentRow | undefined {
    return Array.from(this.assignments.values()).find(row => row.member_code === memberCode);
  }

  insertAssignment(email: string, contactId: string, memberCode: number): void {
    if (this.assignments.has(contactId)) {
      throw new Error('UNIQUE constraint failed: member_code_assignments.contact_id');
    }
    if (this.findByMemberCode(memberCode)) {
      throw new Error('UNIQUE constraint failed: member_code_assignments.member_code');
    }
    this.assignments.set(contactId, {
      email,
      contact_id: contactId,
      member_code: memberCode,
      created_at: '2026-03-19 00:00:00',
    });
  }

  syncEmail(contactId: string, email: string, expectedOldEmail: string): void {
    const row = this.assignments.get(contactId);
    if (!row || row.email === email || row.email !== expectedOldEmail) {
      return;
    }
    row.email = email;
    this.assignments.set(contactId, row);
  }
}

function createEnv(start = 9000): { env: MemberCodeEnv; db: FakeD1Database } {
  const db = new FakeD1Database();
  const env = {
    DB: db as unknown as D1Database,
    MEMBER_CODE_NEXT_START: String(start),
  } as MemberCodeEnv;
  return { env, db };
}

describe('member code helpers', () => {
  beforeEach(() => {
    waContacts.getContact.mockReset();
    waContacts.getMemberCode.mockReset();
    waContacts.updateContact.mockReset();
  });

  it('backfills D1 from an existing WA member code', async () => {
    const { env, db } = createEnv();
    waContacts.getContact.mockResolvedValue({ Id: 42, FieldValues: [] });
    waContacts.getMemberCode.mockReturnValue('9000');

    const memberCode = await ensureMemberCode(env, 42, 'retry@example.com');

    expect(memberCode).toBe('9000');
    expect(db.findByContactId('42')).toMatchObject({
      email: 'retry@example.com',
      contact_id: '42',
      member_code: 9000,
    });
    expect(waContacts.updateContact).not.toHaveBeenCalled();
  });

  it('restores the existing D1 code to WA when the contact lost it', async () => {
    const { env, db } = createEnv();
    db.seedAssignment('member@example.com', 77, 9012);
    waContacts.getContact.mockResolvedValue({ Id: 77, FieldValues: [] });
    waContacts.getMemberCode.mockReturnValue('');
    waContacts.updateContact.mockResolvedValue(undefined);

    const memberCode = await ensureMemberCode(env, 77, 'member@example.com');

    expect(memberCode).toBe('9012');
    expect(waContacts.updateContact).toHaveBeenCalledWith(
      env,
      77,
      expect.objectContaining({
        FieldValues: [
          expect.objectContaining({
            Value: '9012',
          }),
        ],
      }),
    );
  });

  it('allocates a new code when neither WA nor D1 has one', async () => {
    const { env, db } = createEnv(9000);
    waContacts.getContact.mockResolvedValue({ Id: 88, FieldValues: [] });
    waContacts.getMemberCode.mockReturnValue('');
    waContacts.updateContact.mockResolvedValue(undefined);

    const memberCode = await ensureMemberCode(env, 88, 'fresh@example.com');

    expect(memberCode).toBe('9000');
    expect(db.findByContactId('88')).toMatchObject({
      email: 'fresh@example.com',
      contact_id: '88',
      member_code: 9000,
    });
  });

  it('allows the same email to exist on different contacts without reusing codes', async () => {
    const { env, db } = createEnv();
    db.seedAssignment('shared@example.com', 1, 9000);

    const memberCode = await ensureMemberCodeAssignment(env, 'shared@example.com', 2, '9001');

    expect(memberCode).toBe('9001');
    expect(db.findByContactId('1')?.member_code).toBe(9000);
    expect(db.findByContactId('2')).toMatchObject({
      email: 'shared@example.com',
      member_code: 9001,
    });
  });

  it('reserves the next code without consulting email ownership', async () => {
    const { env, db } = createEnv(9000);
    db.seedAssignment('old@example.com', 5, 9000);
    db.sequence = 9001;

    const memberCode = await reserveNextMemberCode(env);

    expect(memberCode).toBe('9001');
  });

  it('returns D1 code when a concurrent request already assigned a different code to the contact', async () => {
    // Simulates the race: D1 has code 9001 for contact 10, but caller is trying to assign 9002
    // (because a concurrent webhook reserved and wrote 9002 in WA before D1 was updated).
    // Expected: D1 wins; 9001 is returned and the caller can sync WA back.
    const { env, db } = createEnv();
    db.seedAssignment('race@example.com', 10, 9001);

    const memberCode = await ensureMemberCodeAssignment(env, 'race@example.com', 10, '9002');

    expect(memberCode).toBe('9001');
  });

  it('returns D1 code from conflict retry path when INSERT loses the race', async () => {
    // Simulates the optimistic-insert path: INSERT fails with a UNIQUE violation because a
    // concurrent request already inserted code 9001 for contact 20 between our pre-check
    // and our INSERT. The post-insert lookup should resolve to the winning code.
    const { env, db } = createEnv();

    // Intercept insertAssignment to inject the pre-existing row after the first INSERT fails.
    const origPrepare = db.prepare.bind(db);
    let insertCalled = false;
    db.prepare = (query: string) => {
      const stmt = origPrepare(query);
      if (query.includes('INSERT INTO member_code_assignments')) {
        const origRun = stmt.run.bind(stmt);
        stmt.run = async () => {
          if (!insertCalled) {
            insertCalled = true;
            // Seed the winning row (from the concurrent request) before throwing
            db.seedAssignment('race2@example.com', 20, 9001);
            throw new Error('UNIQUE constraint failed: member_code_assignments.contact_id');
          }
          return origRun();
        };
      }
      return stmt;
    };

    const memberCode = await ensureMemberCodeAssignment(env, 'race2@example.com', 20, '9001');

    expect(memberCode).toBe('9001');
  });

  it('throws when a different contact already owns the requested member code', async () => {
    // This is a genuine data-integrity error (should never happen with the atomic sequence).
    const { env, db } = createEnv();
    db.seedAssignment('other@example.com', 99, 9005);

    await expect(
      ensureMemberCodeAssignment(env, 'new@example.com', 50, '9005'),
    ).rejects.toThrow('already assigned to contact 99');
  });

  it('throws when ensureMemberCodeAssignment receives an invalid member code string', async () => {
    const { env } = createEnv();

    await expect(ensureMemberCodeAssignment(env, 'x@example.com', 1, 'abc')).rejects.toThrow(
      'Invalid member code value',
    );
    await expect(ensureMemberCodeAssignment(env, 'x@example.com', 1, '0')).rejects.toThrow(
      'Invalid member code value',
    );
    await expect(ensureMemberCodeAssignment(env, 'x@example.com', 1, '-5')).rejects.toThrow(
      'Invalid member code value',
    );
  });
});
