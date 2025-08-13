-- Add member number field to members table
-- This field stores the unique member number from WordPress (numero_socia)

ALTER TABLE members ADD COLUMN IF NOT EXISTS member_number TEXT;

-- Add unique constraint for member numbers (when not null)
CREATE UNIQUE INDEX IF NOT EXISTS members_member_number_unique 
ON members (member_number) 
WHERE member_number IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN members.member_number IS 'Unique member number from WordPress (numero_socia field)';

-- Update RLS policies to include member_number in select queries
DROP POLICY IF EXISTS "Members can view their own data" ON members;
CREATE POLICY "Members can view their own data" ON members
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can update their own data" ON members;
CREATE POLICY "Members can update their own data" ON members
  FOR UPDATE USING (auth.uid() = user_id);