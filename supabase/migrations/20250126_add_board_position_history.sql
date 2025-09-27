-- Migration: Add board position history and new position types
-- Date: 2025-01-26
-- Description: Add support for board position history tracking and new position types

-- First, let's check if we need to create the board_position enum type
DO $$ 
BEGIN
    -- Create the enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'board_position_enum') THEN
        CREATE TYPE board_position_enum AS ENUM (
            'Presidenta',
            'Secretaria', 
            'Tesorera',
            'Vocal'
        );
    END IF;
END $$;

-- Add new position types to the enum
ALTER TYPE board_position_enum ADD VALUE IF NOT EXISTS 'Vice-Presidenta';
ALTER TYPE board_position_enum ADD VALUE IF NOT EXISTS 'Vocal Formacion';
ALTER TYPE board_position_enum ADD VALUE IF NOT EXISTS 'Vocal Comunicacion';
ALTER TYPE board_position_enum ADD VALUE IF NOT EXISTS 'Vocal Mianima';
ALTER TYPE board_position_enum ADD VALUE IF NOT EXISTS 'Vocal Financiacion';
ALTER TYPE board_position_enum ADD VALUE IF NOT EXISTS 'Vocal Socias';
ALTER TYPE board_position_enum ADD VALUE IF NOT EXISTS 'Vocal Festivales';

-- Create board position history table
CREATE TABLE IF NOT EXISTS board_position_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    position TEXT NOT NULL,
    term_start DATE NOT NULL,
    term_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_board_position_history_member_id ON board_position_history(member_id);
CREATE INDEX IF NOT EXISTS idx_board_position_history_position ON board_position_history(position);
CREATE INDEX IF NOT EXISTS idx_board_position_history_term ON board_position_history(term_start, term_end);

-- Create board position responsibilities table
CREATE TABLE IF NOT EXISTS board_position_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position TEXT NOT NULL UNIQUE,
    default_responsibilities TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add personal commitment field to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS board_personal_commitment TEXT;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_board_position_history_updated_at ON board_position_history;
CREATE TRIGGER update_board_position_history_updated_at
    BEFORE UPDATE ON board_position_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_board_position_responsibilities_updated_at ON board_position_responsibilities;
CREATE TRIGGER update_board_position_responsibilities_updated_at
    BEFORE UPDATE ON board_position_responsibilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE board_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_position_responsibilities ENABLE ROW LEVEL SECURITY;

-- Policy for board_position_history: public read access
CREATE POLICY "board_position_history_public_read" ON board_position_history
    FOR SELECT USING (true);

-- Policy for board_position_responsibilities: public read access
CREATE POLICY "board_position_responsibilities_public_read" ON board_position_responsibilities
    FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON TABLE board_position_history IS 'Historical record of board member positions across different terms';
COMMENT ON TABLE board_position_responsibilities IS 'Default responsibilities for each board position';
COMMENT ON COLUMN members.board_personal_commitment IS 'Personal commitment statement for current board position';
