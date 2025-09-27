-- Migration: Insert current board members (2025-2026)
-- Date: 2025-01-26
-- Description: Insert the current board members for the 2025-2026 period

-- First, ensure we have the members in the members table
-- We'll insert them if they don't exist, or update them if they do

-- Insert/Update Alicia Nuñez Puerto (asociaciones@animacionesmia.com)
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
    'placeholder_board_member_1',
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

-- Insert/Update Daysi Cruz (presidencia@animacionesmia.com)
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'presidencia@animacionesmia.com',
    'Daysi',
    'Cruz',
    'Daysi Cruz',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_2',
    true,
    'Presidenta',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Presidenta',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Insert/Update Ema (comunicacion@animacionesmia.com)
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
    'placeholder_board_member_3',
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

-- Insert/Update Beli (comunicacion@animacionesmia.com - second person)
-- Note: This email is shared, so we'll use a different approach
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'comunicacion2@animacionesmia.com',
    'Beli',
    '',
    'Beli',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_4',
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

-- Insert/Update Eva Perez (formacion@animacionesmia.com)
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
    'placeholder_board_member_5',
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

-- Insert/Update Irene Hernández Montoro (tesoreria@animacionesmia.com)
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'tesoreria@animacionesmia.com',
    'Irene',
    'Hernández Montoro',
    'Irene Hernández Montoro',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_6',
    true,
    'Tesorera',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Tesorera',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Insert/Update Jone Landaluze (vicepresidencia@animacionesmia.com)
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
    'placeholder_board_member_7',
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
    updated_at = NOW();

-- Insert/Update Julia Horrillo (mianima@animacionesmia.com)
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
    'placeholder_board_member_8',
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

-- Insert/Update Liliana Rincon (secretaria@animacionesmia.com)
INSERT INTO members (
    email, first_name, last_name, display_name, 
    address, city, country, membership_type, 
    stripe_customer_id, is_board_member, board_position,
    board_term_start, board_term_end, privacy_level
) VALUES (
    'secretaria@animacionesmia.com',
    'Liliana',
    'Rincon',
    'Liliana Rincon',
    'Madrid, España',
    'Madrid',
    'Spain',
    'profesional',
    'placeholder_board_member_9',
    true,
    'Secretaria',
    '2025-01-01',
    '2026-12-31',
    'public'
) ON CONFLICT (email) DO UPDATE SET
    is_board_member = true,
    board_position = 'Secretaria',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW();

-- Insert/Update Montse Capón (financiacion@animacionesmia.com)
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
    'placeholder_board_member_10',
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

-- Insert/Update Patricia Diaz (socias@animacionesmia.com)
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
    'placeholder_board_member_11',
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

-- Insert/Update Rocio Benavent (informemia@animacionesmia.com)
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
    'placeholder_board_member_12',
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

-- Insert/Update Sonia Estevez (festivales@animacionesmia.com)
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
    'placeholder_board_member_13',
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

-- Add some personal commitments for key positions
UPDATE members SET board_personal_commitment = 'Mi compromiso es liderar MIA hacia un futuro más inclusivo y representativo en la industria de la animación española, promoviendo la visibilidad y el reconocimiento de las mujeres en este sector.' WHERE email = 'presidencia@animacionesmia.com';

UPDATE members SET board_personal_commitment = 'Apoyar a la Presidenta en la toma de decisiones estratégicas y representar a MIA cuando sea necesario, contribuyendo al crecimiento y desarrollo de la asociación.' WHERE email = 'vicepresidencia@animacionesmia.com';

UPDATE members SET board_personal_commitment = 'Mantener una comunicación clara y efectiva entre todos los miembros de la asociación, asegurando que la información fluya correctamente y que todos estemos alineados con nuestros objetivos.' WHERE email = 'secretaria@animacionesmia.com';

UPDATE members SET board_personal_commitment = 'Gestionar las finanzas de MIA con transparencia y responsabilidad, asegurando la sostenibilidad económica de la asociación para poder cumplir con todos nuestros proyectos y objetivos.' WHERE email = 'tesoreria@animacionesmia.com';
