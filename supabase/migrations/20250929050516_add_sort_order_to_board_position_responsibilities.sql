-- Migration: Add sort_order column to board_position_responsibilities
-- Date: 2025-09-29
-- Description: Add sort_order column to enable proper ordering of board positions

-- Add sort_order column with default value
ALTER TABLE board_position_responsibilities 
ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 999;

-- Update sort_order for existing positions
UPDATE board_position_responsibilities 
SET sort_order = 1 
WHERE position = 'Presidenta';

UPDATE board_position_responsibilities 
SET sort_order = 2 
WHERE position = 'Vice-Presidenta';

UPDATE board_position_responsibilities 
SET sort_order = 3 
WHERE position = 'Secretaria';

UPDATE board_position_responsibilities 
SET sort_order = 4 
WHERE position = 'Tesorera';

UPDATE board_position_responsibilities 
SET sort_order = 5 
WHERE position = 'Vocal';

UPDATE board_position_responsibilities 
SET sort_order = 6 
WHERE position = 'Vocal Comunicacion';

UPDATE board_position_responsibilities 
SET sort_order = 7 
WHERE position = 'Vocal Festivales';

UPDATE board_position_responsibilities 
SET sort_order = 8 
WHERE position = 'Vocal Financiacion';

UPDATE board_position_responsibilities 
SET sort_order = 9 
WHERE position = 'Vocal Formacion';

UPDATE board_position_responsibilities 
SET sort_order = 10 
WHERE position = 'Vocal Mianima';

UPDATE board_position_responsibilities 
SET sort_order = 11 
WHERE position = 'Vocal Socias';
