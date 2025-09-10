-- Member Number Generation System
-- Automatically generates sequential member numbers for new subscriptions

-- Create sequence for member numbers
CREATE SEQUENCE IF NOT EXISTS member_number_seq START WITH 1;

-- Function to generate member number
CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Get next number from sequence
    next_number := nextval('member_number_seq');
    
    -- Format as MIA-YYYY-NNN (e.g., MIA-2025-001)
    formatted_number := 'MIA-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Function to assign member number when subscription is created
CREATE OR REPLACE FUNCTION assign_member_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only assign if member_number is null
    IF NEW.member_number IS NULL THEN
        NEW.member_number := generate_member_number();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign member numbers
DROP TRIGGER IF EXISTS assign_member_number_trigger ON members;
CREATE TRIGGER assign_member_number_trigger
    BEFORE INSERT ON members
    FOR EACH ROW
    EXECUTE FUNCTION assign_member_number();

-- Initialize sequence with current max member number (if any exist)
-- This ensures new numbers don't conflict with migrated data
SELECT setval('member_number_seq', 
    COALESCE((
        SELECT MAX(CAST(SUBSTRING(member_number FROM 'MIA-[0-9]+-([0-9]+)') AS INTEGER))
        FROM members 
        WHERE member_number ~ 'MIA-[0-9]+-[0-9]+'
    ), 0)
);