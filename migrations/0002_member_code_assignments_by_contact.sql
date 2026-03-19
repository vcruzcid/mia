BEGIN;

DROP INDEX IF EXISTS idx_member_code_assignments_member_code;

ALTER TABLE member_code_assignments RENAME TO member_code_assignments_old;

CREATE TABLE member_code_assignments (
  email TEXT NOT NULL,
  contact_id TEXT NOT NULL UNIQUE,
  member_code INTEGER NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

INSERT INTO member_code_assignments (email, contact_id, member_code, created_at)
SELECT email, contact_id, member_code, created_at
FROM member_code_assignments_old;

DROP TABLE member_code_assignments_old;

CREATE INDEX idx_member_code_assignments_member_code
  ON member_code_assignments(member_code);

CREATE INDEX idx_member_code_assignments_email
  ON member_code_assignments(email);

COMMIT;
