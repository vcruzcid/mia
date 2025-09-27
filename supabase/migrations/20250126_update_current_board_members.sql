-- Migration: Update current board members (2025-2026)
-- Date: 2025-01-26
-- Description: Update existing members to be current board members for the 2025-2026 period

-- First, clear any existing board member flags to start fresh
UPDATE members SET 
    is_board_member = false,
    board_position = NULL,
    board_term_start = NULL,
    board_term_end = NULL,
    board_personal_commitment = NULL,
    updated_at = NOW()
WHERE is_board_member = true;

-- Update current board members for 2025-2026 period
-- Daysi Cruz - Presidenta
UPDATE members SET
    is_board_member = true,
    board_position = 'Presidenta',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    board_personal_commitment = 'Mi compromiso es liderar MIA hacia un futuro más inclusivo y representativo en la industria de la animación española, promoviendo la visibilidad y el reconocimiento de las mujeres en este sector.',
    updated_at = NOW()
WHERE email = 'presidencia@animacionesmia.com';

-- Jone Landaluze - Vice-Presidenta
UPDATE members SET
    is_board_member = true,
    board_position = 'Vice-Presidenta',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    board_personal_commitment = 'Apoyar a la Presidenta en la toma de decisiones estratégicas y representar a MIA cuando sea necesario, contribuyendo al crecimiento y desarrollo de la asociación.',
    updated_at = NOW()
WHERE email = 'vicepresidencia@animacionesmia.com';

-- Liliana Rincon - Secretaria
UPDATE members SET
    is_board_member = true,
    board_position = 'Secretaria',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    board_personal_commitment = 'Mantener una comunicación clara y efectiva entre todos los miembros de la asociación, asegurando que la información fluya correctamente y que todos estemos alineados con nuestros objetivos.',
    updated_at = NOW()
WHERE email = 'secretaria@animacionesmia.com';

-- Irene Hernández Montoro - Tesorera
UPDATE members SET
    is_board_member = true,
    board_position = 'Tesorera',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    board_personal_commitment = 'Gestionar las finanzas de MIA con transparencia y responsabilidad, asegurando la sostenibilidad económica de la asociación para poder cumplir con todos nuestros proyectos y objetivos.',
    updated_at = NOW()
WHERE email = 'tesoreria@animacionesmia.com';

-- Eva Perez - Vocal Formacion
UPDATE members SET
    is_board_member = true,
    board_position = 'Vocal Formacion',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE email = 'formacion@animacionesmia.com';

-- Ema - Vocal Comunicacion
UPDATE members SET
    is_board_member = true,
    board_position = 'Vocal Comunicacion',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE email = 'comunicacion@animacionesmia.com';

-- Julia Horrillo - Vocal Mianima
UPDATE members SET
    is_board_member = true,
    board_position = 'Vocal Mianima',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE email = 'mianima@animacionesmia.com';

-- Montse Capón - Vocal Financiacion
UPDATE members SET
    is_board_member = true,
    board_position = 'Vocal Financiacion',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE email = 'financiacion@animacionesmia.com';

-- Patricia Diaz - Vocal Socias
UPDATE members SET
    is_board_member = true,
    board_position = 'Vocal Socias',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE email = 'socias@animacionesmia.com';

-- Sonia Estevez - Vocal Festivales
UPDATE members SET
    is_board_member = true,
    board_position = 'Vocal Festivales',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE email = 'festivales@animacionesmia.com';

-- Alicia Nuñez Puerto - Vocal
UPDATE members SET
    is_board_member = true,
    board_position = 'Vocal',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE email = 'asociaciones@animacionesmia.com';

-- Rocio Benavent - Vocal
UPDATE members SET
    is_board_member = true,
    board_position = 'Vocal',
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE email = 'informemia@animacionesmia.com';

-- Note: If any of these emails don't exist in the members table,
-- you may need to add them manually or create a separate migration
-- to insert them first before running this update.
