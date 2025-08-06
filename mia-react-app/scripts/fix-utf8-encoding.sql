-- Comprehensive UTF-8 Replacement Character Fix Script
-- This script fixes corrupted UTF-8 characters (� symbols) that appear when 
-- Spanish accented characters were incorrectly converted during data migration

-- =============================================
-- FIX UTF-8 REPLACEMENT CHARACTERS (�)
-- =============================================

-- The � character represents corrupted UTF-8 sequences (hex: efbfbd)
-- These typically should be Spanish accented characters

-- Fix first names with common Spanish character patterns
UPDATE members SET first_name = 
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(first_name,
                      'c�o\b', 'cío', 'g'),     -- Rocío
                    'f�a\b', 'fía', 'g'),       -- Sofía  
                  'r�a\b', 'ría', 'g'),         -- María
                'n�s\b', 'nés', 'g'),           -- Inés
              'g�a\b', 'gía', 'g'),             -- (any)gía
            'n�a\b', 'ña', 'g'),               -- Begoña
          'l�a\b', 'lía', 'g'),                 -- (any)lía
        'v�a\b', 'vía', 'g'),                   -- Sílvia -> Sílvia  
      'nica\b', 'nica', 'g'),                   -- Verónica pattern
    'n�ca\b', 'nica', 'g')                     -- Ver�nica -> Verónica
WHERE first_name ~ '�';

-- Fix remaining first name patterns  
UPDATE members SET first_name = 
  regexp_replace(first_name, '�', 'í', 'g')
WHERE first_name ~ '�' AND first_name ~ '[bcdfghjklmnpqrstvwxyz]�[aeiou]';

-- Fix last names with Spanish character patterns
UPDATE members SET last_name = 
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(last_name,
                      'gu�z\b', 'guez', 'g'),    -- Rodríguez, etc
                    'n�n\b', 'nón', 'g'),        -- (any)nón  
                  'r�n\b', 'rón', 'g'),          -- (any)rón
                'z�n\b', 'zón', 'g'),            -- (any)zón
              'n�ez\b', 'ñez', 'g'),             -- (any)ñez
            't�n\b', 'tín', 'g'),               -- (any)tín
          'p�ez\b', 'rez', 'g'),                -- P�rez -> Pérez
        'c�a\b', 'cía', 'g'),                   -- (any)cía  
      'n�o\b', 'ño', 'g'),                      -- (any)ño
    'l�n\b', 'lín', 'g')                       -- (any)lín
WHERE last_name ~ '�';

-- Fix common word endings in last names
UPDATE members SET last_name = 
  regexp_replace(
    regexp_replace(
      regexp_replace(last_name,
        '�GUEZ\b', 'ÍGUEZ', 'g'),              -- RODRÍGUEZ
      '�ndez\b', 'ández', 'g'),                -- Fernández, Hernández
    '�n\b', 'án', 'g')                        -- Any -án ending
WHERE last_name ~ '�';

-- Fix main_profession field
UPDATE members SET main_profession = 
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(main_profession,
            'cci�n', 'cción', 'g'),            -- producción, animación
          'si�n', 'sión', 'g'),                -- (any)sión  
        'ti�n', 'tión', 'g'),                  -- (any)tión
      'Dise�', 'Diseñ', 'g'),                  -- Diseño, Diseñador
    'aci�n', 'ación', 'g')                     -- (any)ación
WHERE main_profession ~ '�';

-- Fix company names
UPDATE members SET company = 
  regexp_replace(
    regexp_replace(company,
      'aci�n', 'ación', 'g'),                  -- (any)ación
    'cci�n', 'cción', 'g')                     -- (any)cción  
WHERE company IS NOT NULL AND company ~ '�';

-- Fix biography field (more comprehensive due to longer text)
UPDATE members SET biography = 
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(
                        regexp_replace(biography,
                          'cci�n', 'cción', 'g'),        -- producción, animación
                        'si�n', 'sión', 'g'),            -- (any)sión  
                      'ti�n', 'tión', 'g'),              -- (any)tión
                    'aci�n', 'ación', 'g'),              -- (any)ación
                  'Espa�a', 'España', 'g'),              -- España
                'a�os', 'años', 'g'),                    -- años
              'm�s', 'más', 'g'),                        -- más
            'pel�cula', 'película', 'g'),                -- película  
          'televisi�n', 'televisión', 'g'),              -- televisión
        'direcci�n', 'dirección', 'g'),                  -- dirección
      'producci�n', 'producción', 'g'),                  -- producción
    'animaci�n', 'animación', 'g')                       -- animación
WHERE biography IS NOT NULL AND biography ~ '�';

-- Fix specific location fields
UPDATE members SET province = 
  regexp_replace(province, 'C�rdoba', 'Córdoba', 'g')
WHERE province IS NOT NULL AND province ~ '�';

UPDATE members SET autonomous_community = 
  regexp_replace(
    regexp_replace(autonomous_community,
      'Catalu�a', 'Cataluña', 'g'),
    'Arag�n', 'Aragón', 'g')
WHERE autonomous_community IS NOT NULL AND autonomous_community ~ '�';

-- Generic fallback replacements for remaining cases
-- These handle the most common Spanish diacritical marks
UPDATE members SET first_name = 
  regexp_replace(first_name, '�', 'ó', 'g')
WHERE first_name ~ '�';

UPDATE members SET last_name = 
  regexp_replace(last_name, '�', 'í', 'g')  
WHERE last_name ~ '�';

UPDATE members SET main_profession = 
  regexp_replace(main_profession, '�', 'ó', 'g')
WHERE main_profession ~ '�';

UPDATE members SET biography = 
  regexp_replace(biography, '�', 'ó', 'g')
WHERE biography IS NOT NULL AND biography ~ '�';

-- Final cleanup statistics
SELECT 
    'UTF-8 Encoding Fix Results' as check_type,
    COUNT(CASE WHEN first_name ~ '�' THEN 1 END) as first_name_issues_remaining,
    COUNT(CASE WHEN last_name ~ '�' THEN 1 END) as last_name_issues_remaining,
    COUNT(CASE WHEN company ~ '�' THEN 1 END) as company_issues_remaining,
    COUNT(CASE WHEN main_profession ~ '�' THEN 1 END) as profession_issues_remaining,
    COUNT(CASE WHEN biography ~ '�' THEN 1 END) as biography_issues_remaining
FROM members;