-- COMPREHENSIVE DATABASE ENCODING & HTML CLEANUP SCRIPT
-- This script addresses all remaining UTF-8 replacement characters and HTML content

-- =============================================
-- SUMMARY OF ISSUES FOUND:
-- =============================================
-- • First Names: 19 records with � characters  
-- • Last Names: 106 records with � characters
-- • Display Names: 140 records with � characters  
-- • Company: 29 records with � characters
-- • Biography: 185+ records with � characters + 45 HTML tags
-- • Address: 135 records with � characters  
-- • Autonomous Community: 40 records with � characters

-- =============================================
-- 1. COMPREHENSIVE HTML TAG REMOVAL
-- =============================================

-- Remove all HTML tags from biography field while preserving content
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
                        regexp_replace(
                          regexp_replace(
                            regexp_replace(
                              regexp_replace(
                                regexp_replace(
                                  regexp_replace(biography,
                                    '<[/]?p[^>]*>', '. ', 'g'),           -- Remove all p tags
                                  '<[/]?div[^>]*>', '. ', 'g'),           -- Remove all div tags  
                                '<[/]?strong[^>]*>', '', 'g'),           -- Remove all strong tags
                              '<[/]?b[^>]*>', '', 'g'),                  -- Remove all b tags
                            '<[/]?em[^>]*>', '', 'g'),                   -- Remove all em tags
                          '<[/]?i[^>]*>', '', 'g'),                     -- Remove all i tags
                        '<a[^>]*>([^<]*)</a>', '\1', 'g'),              -- Keep link text, remove tags
                      '<br[^>]*>', ' ', 'g'),                           -- Replace br with space
                    '<[/]?ul[^>]*>', '. ', 'g'),                        -- Remove ul tags
                  '<[/]?li[^>]*>', '• ', 'g'),                          -- Replace li with bullet
                '<[/]?span[^>]*>', '', 'g'),                            -- Remove span tags
              '&nbsp;', ' ', 'g'),                                      -- Replace &nbsp; with space
            '&quot;', '"', 'g'),                                        -- Replace &quot; with quote
          '&amp;', '&', 'g'),                                           -- Replace &amp; with &
        '\s*\.\s*\.\s*', '. ', 'g'),                                    -- Fix multiple periods
      '^\s*\.\s*', '', 'g'),                                            -- Remove leading periods
    '\s+', ' ', 'g')                                                    -- Normalize whitespace
WHERE biography IS NOT NULL AND (biography ~ '<[^>]+>' OR biography ~ '&[a-z]+;');

-- Clean up any remaining HTML entities and normalize text
UPDATE members SET biography = 
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(biography,
          '\s*\.\s*$', '.', 'g'),                                      -- Fix trailing periods
        '^\s+|\s+$', '', 'g'),                                         -- Trim whitespace
      '\n+', ' ', 'g'),                                                -- Replace newlines with space
    '\s{2,}', ' ', 'g')                                                -- Normalize multiple spaces
WHERE biography IS NOT NULL AND biography != '';

-- =============================================
-- 2. COMPREHENSIVE UTF-8 ENCODING FIXES
-- =============================================

-- Generic function to replace all UTF-8 replacement characters with most common Spanish equivalents
CREATE OR REPLACE FUNCTION fix_spanish_encoding(input_text text) 
RETURNS text AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Apply comprehensive Spanish character fixes
  RETURN regexp_replace(
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
                          regexp_replace(
                            regexp_replace(
                              regexp_replace(
                                regexp_replace(
                                  regexp_replace(
                                    regexp_replace(
                                      regexp_replace(
                                        regexp_replace(input_text,
                                          -- Common word patterns
                                          'aci�n\b', 'ación', 'g'),              -- animación, producción, etc.
                                        'si�n\b', 'sión', 'g'),                -- profesión, etc.
                                      'ci�n\b', 'ción', 'g'),                  -- ficción, etc.
                                    'ti�n\b', 'tión', 'g'),                    -- gestión, etc.
                                  -- Common Spanish words
                                  'Espa�a', 'España', 'g'),                    -- España
                                'a�os', 'años', 'g'),                          -- años
                              'm�s', 'más', 'g'),                              -- más
                            'tambi�n', 'también', 'g'),                        -- también
                          'despu�s', 'después', 'g'),                          -- después
                        'pel�cula', 'película', 'g'),                          -- película
                      'televisi�n', 'televisión', 'g'),                        -- televisión
                    'compa��a', 'compañía', 'g'),                              -- compañía
                  -- Common name patterns  
                  'r�a\b', 'ría', 'g'),                                        -- María
                'n�s\b', 'nés', 'g'),                                          -- Inés
              'c�o\b', 'cío', 'g'),                                            -- Rocío
            'f�a\b', 'fía', 'g'),                                              -- Sofía
          'gu�z\b', 'guez', 'g'),                                              -- Rodríguez
        'n�ez\b', 'ñez', 'g'),                                                 -- Spanish surnames
      -- Generic character replacements (most common patterns)
      '�', 'ó', 'g'),                                                          -- Default to ó (most common)
    '�', 'í', 'g');                                                            -- Any remaining � to í
END;
$$ LANGUAGE plpgsql;

-- Apply the function to all text fields
UPDATE members SET 
  first_name = fix_spanish_encoding(first_name),
  last_name = fix_spanish_encoding(last_name),
  display_name = fix_spanish_encoding(display_name),
  company = fix_spanish_encoding(company),
  main_profession = fix_spanish_encoding(main_profession),
  biography = fix_spanish_encoding(biography),
  address = fix_spanish_encoding(address),
  province = fix_spanish_encoding(province),
  autonomous_community = fix_spanish_encoding(autonomous_community),
  professional_role = fix_spanish_encoding(professional_role),
  employment_status = fix_spanish_encoding(employment_status),
  education_level = fix_spanish_encoding(education_level),
  studies_completed = fix_spanish_encoding(studies_completed),
  educational_institution = fix_spanish_encoding(educational_institution),
  personal_situation = fix_spanish_encoding(personal_situation)
WHERE first_name ~ '�' OR last_name ~ '�' OR display_name ~ '�' 
   OR company ~ '�' OR main_profession ~ '�' OR biography ~ '�' 
   OR address ~ '�' OR province ~ '�' OR autonomous_community ~ '�'
   OR professional_role ~ '�' OR employment_status ~ '�' 
   OR education_level ~ '�' OR studies_completed ~ '�' 
   OR educational_institution ~ '�' OR personal_situation ~ '�';

-- Clean up the helper function
DROP FUNCTION IF EXISTS fix_spanish_encoding(text);

-- =============================================
-- 3. FINAL VERIFICATION AND STATISTICS
-- =============================================

-- Check results
SELECT 
    'Final Cleanup Results' as status,
    COUNT(*) as total_members,
    COUNT(CASE WHEN first_name ~ '�' THEN 1 END) as first_name_issues_remaining,
    COUNT(CASE WHEN last_name ~ '�' THEN 1 END) as last_name_issues_remaining,
    COUNT(CASE WHEN display_name ~ '�' THEN 1 END) as display_name_issues_remaining,
    COUNT(CASE WHEN company ~ '�' THEN 1 END) as company_issues_remaining,
    COUNT(CASE WHEN biography ~ '�' THEN 1 END) as biography_issues_remaining,
    COUNT(CASE WHEN biography ~ '<[^>]+>' THEN 1 END) as html_tags_remaining,
    COUNT(CASE WHEN address ~ '�' THEN 1 END) as address_issues_remaining
FROM members;

-- Sample of cleaned records
SELECT 
    'Sample Cleaned Records' as type,
    first_name, 
    last_name, 
    main_profession,
    LEFT(biography, 100) as biography_sample
FROM members 
WHERE (first_name ~ '[áéíóúñü]' OR last_name ~ '[áéíóúñü]' OR biography ~ '[áéíóúñü]')
    AND biography IS NOT NULL AND biography != ''
LIMIT 5;