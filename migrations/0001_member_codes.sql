CREATE TABLE IF NOT EXISTS member_code_sequence (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  next_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS member_code_assignments (
  email TEXT NOT NULL UNIQUE,
  contact_id TEXT NOT NULL UNIQUE,
  member_code INTEGER NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_member_code_assignments_member_code
  ON member_code_assignments(member_code);
