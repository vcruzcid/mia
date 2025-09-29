-- Migration: Insert missing board members
-- Date: 2025-01-26
-- Description: Insert or update additional board members that might be missing

-- First, let's check what board member emails we need to add
-- We'll insert them with placeholder data that can be updated later

-- Insert/Update additional board members (using the emails from your migration files)
-- Note: These will only insert if the emails don't exist, or update if they do

-- Vice-Presidenta
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'vicepresidencia@animacionesmia.com',
    'Jone',
    'Landaluze',
    'Jone Landaluze',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_vp',
    true,
    'Vice-Presidenta',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vice-Presidenta',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    board_personal_commitment = 'Apoyar a la Presidenta en la toma de decisiones estratégicas y representar a MIA cuando sea necesario, contribuyendo al crecimiento y desarrollo de la asociación.',
    updated_at = NOW();

-- Vocal Formacion
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'formacion@animacionesmia.com',
    'Eva',
    'Perez',
    'Eva Perez',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_formacion',
    true,
    'Vocal Formacion',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vocal Formacion',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Vocal Comunicacion
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'comunicacion@animacionesmia.com',
    'Ema',
    '',
    'Ema',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_comunicacion',
    true,
    'Vocal Comunicacion',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vocal Comunicacion',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Vocal Mianima
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'mianima@animacionesmia.com',
    'Julia',
    'Horrillo',
    'Julia Horrillo',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_mianima',
    true,
    'Vocal Mianima',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vocal Mianima',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Vocal Financiacion
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'financiacion@animacionesmia.com',
    'Montse',
    'Capón',
    'Montse Capón',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_financiacion',
    true,
    'Vocal Financiacion',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vocal Financiacion',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Vocal Socias
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'socias@animacionesmia.com',
    'Patricia',
    'Diaz',
    'Patricia Diaz',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_socias',
    true,
    'Vocal Socias',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vocal Socias',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Vocal Festivales
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'festivales@animacionesmia.com',
    'Sonia',
    'Estevez',
    'Sonia Estevez',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_festivales',
    true,
    'Vocal Festivales',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vocal Festivales',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Additional Vocals
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'asociaciones@animacionesmia.com',
    'Alicia',
    'Nuñez Puerto',
    'Alicia Nuñez Puerto',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_asociaciones',
    true,
    'Vocal',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vocal',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'informemia@animacionesmia.com',
    'Rocio',
    'Benavent',
    'Rocio Benavent',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_informemia',
    true,
    'Vocal',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Vocal',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();
