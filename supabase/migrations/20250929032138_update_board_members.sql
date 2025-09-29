-- Migration: Update current board members with personal commitments
-- Date: 2025-01-26
-- Description: Add personal commitments to existing board members

-- Add personal commitments to existing board members
UPDATE members SET 
    board_personal_commitment = 'Mi compromiso es liderar MIA hacia un futuro más inclusivo y representativo en la industria de la animación española, promoviendo la visibilidad y el reconocimiento de las mujeres en este sector.',
    updated_at = NOW()
WHERE email = 'daysi@morganastudios.com';

UPDATE members SET 
    board_personal_commitment = 'Mantener una comunicación clara y efectiva entre todos los miembros de la asociación, asegurando que la información fluya correctamente y que todos estemos alineados con nuestros objetivos.',
    updated_at = NOW()
WHERE email = 'lilianarincon@3dadosmedia.com';

UPDATE members SET 
    board_personal_commitment = 'Gestionar las finanzas de MIA con transparencia y responsabilidad, asegurando la sostenibilidad económica de la asociación para poder cumplir con todos nuestros proyectos y objetivos.',
    updated_at = NOW()
WHERE email = 'hernandezmoirene@gmail.com';

-- Update any other existing board members to ensure they have proper term dates
UPDATE members SET 
    board_term_start = '2025-01-01',
    board_term_end = '2026-12-31',
    updated_at = NOW()
WHERE is_board_member = true 
AND (board_term_start IS NULL OR board_term_end IS NULL);
