-- SQL script to fix character encoding issues in the members table
-- Run this in the Supabase SQL Editor

-- Temporarily disable RLS for the update operation
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Create a function to perform the encoding fixes
CREATE OR REPLACE FUNCTION fix_encoding_issues()
RETURNS void AS $$
BEGIN
  -- Update all text fields with encoding fixes
  UPDATE members SET
    first_name = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      first_name,
      'Ram�rez', 'Ramírez'), 'Rodr�guez', 'Rodríguez'), 'M�riam', 'Míriam'), 'Su�rez', 'Suárez'),
      'N��ez', 'Núñez'), 'Mart�nez', 'Martínez'), 'Gonz�lez', 'González'), 'L�pez', 'López'),
      'Jim�nez', 'Jiménez'), 'Hern�ndez', 'Hernández'), 'P�rez', 'Pérez'), 'S�nchez', 'Sánchez'),
      'Fern�ndez', 'Fernández'), 'Mu�oz', 'Muñoz'), 'Ru�z', 'Ruiz'), 'D�az', 'Díaz'),
      'V�zquez', 'Vázquez'), 'Rub�n', 'Rubén'), 'Guti�rrez', 'Gutiérrez'), 'Jes�s', 'Jesús'),
    
    last_name = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      last_name,
      'Ram�rez', 'Ramírez'), 'Rodr�guez', 'Rodríguez'), 'M�riam', 'Míriam'), 'Su�rez', 'Suárez'),
      'N��ez', 'Núñez'), 'Mart�nez', 'Martínez'), 'Gonz�lez', 'González'), 'L�pez', 'López'),
      'Jim�nez', 'Jiménez'), 'Hern�ndez', 'Hernández'), 'P�rez', 'Pérez'), 'S�nchez', 'Sánchez'),
      'Fern�ndez', 'Fernández'), 'Mu�oz', 'Muñoz'), 'Ru�z', 'Ruiz'), 'D�az', 'Díaz'),
      'V�zquez', 'Vázquez'), 'Rub�n', 'Rubén'), 'Guti�rrez', 'Gutiérrez'), 'Jes�s', 'Jesús'),
      'Mar�a', 'María'), 'Jos�', 'José'), 'Andr�s', 'Andrés'), 'Sebasti�n', 'Sebastián'),
      'Nicol�s', 'Nicolás'), 'Iv�n', 'Iván'), 'F�lix', 'Félix'), '�ngel', 'Ángel'),
      '�lvarez', 'Álvarez'), '�vila', 'Ávila'), 'In�s', 'Inés'), 'Bel�n', 'Belén'),
    
    display_name = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      display_name,
      'Ram�rez', 'Ramírez'), 'Rodr�guez', 'Rodríguez'), 'M�riam', 'Míriam'), 'Su�rez', 'Suárez'),
      'N��ez', 'Núñez'), 'Mart�nez', 'Martínez'), 'Gonz�lez', 'González'), 'L�pez', 'López'),
      'Jim�nez', 'Jiménez'), 'Hern�ndez', 'Hernández'), 'P�rez', 'Pérez'), 'S�nchez', 'Sánchez'),
      'Fern�ndez', 'Fernández'), 'Mu�oz', 'Muñoz'), 'Ru�z', 'Ruiz'), 'D�az', 'Díaz'),
      'V�zquez', 'Vázquez'), 'Rub�n', 'Rubén'), 'Guti�rrez', 'Gutiérrez'), 'Jes�s', 'Jesús'),
      'Mar�a', 'María'), 'Jos�', 'José'), 'Andr�s', 'Andrés'), 'Sebasti�n', 'Sebastián'),
      'Nicol�s', 'Nicolás'), 'Iv�n', 'Iván'), 'F�lix', 'Félix'), '�ngel', 'Ángel'),
      '�lvarez', 'Álvarez'), '�vila', 'Ávila'), 'In�s', 'Inés'), 'Bel�n', 'Belén'),
    
    main_profession = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      main_profession,
      'direcci�n', 'dirección'), 'producci�n', 'producción'), 'animaci�n', 'animación'),
      'especializaci�n', 'especialización'), 'creaci�n', 'creación'), 'investigaci�n', 'investigación'),
      'educaci�n', 'educación'), 'formaci�n', 'formación'), 'participaci�n', 'participación'),
      'colaboraci�n', 'colaboración'), 'organizaci�n', 'organización'), 'presentaci�n', 'presentación'),
      'dise�o', 'diseño'), 'dise�ador', 'diseñador'), 'dise�adora', 'diseñadora'),
      'espa�ol', 'español'), 'espa�ola', 'española'), 'Espa�a', 'España'),
      'televisi�n', 'televisión'), 'informaci�n', 'información'),
    
    company = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      company,
      'direcci�n', 'dirección'), 'producci�n', 'producción'), 'animaci�n', 'animación'),
      'especializaci�n', 'especialización'), 'creaci�n', 'creación'), 'investigaci�n', 'investigación'),
      'educaci�n', 'educación'), 'formaci�n', 'formación'), 'participaci�n', 'participación'),
      'colaboraci�n', 'colaboración'), 'organizaci�n', 'organización'), 'presentaci�n', 'presentación'),
      'dise�o', 'diseño'), 'dise�ador', 'diseñador'), 'dise�adora', 'diseñadora'),
      'espa�ol', 'español'), 'espa�ola', 'española'), 'Espa�a', 'España'),
      'televisi�n', 'televisión'), 'informaci�n', 'información'),
    
    autonomous_community = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      autonomous_community,
      'Arag�n', 'Aragón'), 'Catal��a', 'Cataluña'), 'Catalu�a', 'Cataluña'),
      'Castell�n', 'Castellón'), 'Le�n', 'León'), 'C�rdoba', 'Córdoba'),
      'M�laga', 'Málaga'), 'C�diz', 'Cádiz'), 'Ja�n', 'Jaén'), 'Logro�o', 'Logroño'),
    
    country = REPLACE(country, 'Espa�a', 'España')
    
  WHERE 
    first_name LIKE '%�%' OR 
    last_name LIKE '%�%' OR 
    display_name LIKE '%�%' OR 
    main_profession LIKE '%�%' OR 
    company LIKE '%�%' OR 
    autonomous_community LIKE '%�%' OR 
    country LIKE '%�%';

  -- Fix biography field (this might be large, so we'll do it separately)
  UPDATE members SET
    biography = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      biography,
      'direcci�n', 'dirección'), 'producci�n', 'producción'), 'animaci�n', 'animación'),
      'a�os', 'años'), 'ni�os', 'niños'), 'dise�o', 'diseño'), 'Espa�a', 'España'),
      'televisi�n', 'televisión'), 'creaci�n', 'creación'), 'especializaci�n', 'especialización'),
      'formaci�n', 'formación'), 'educaci�n', 'educación'), 'participaci�n', 'participación'),
      'colaboraci�n', 'colaboración'), 'organizaci�n', 'organización'), 'presentaci�n', 'presentación'),
      'informaci�n', 'información'), 'construcci�n', 'construcción'), 'instalaci�n', 'instalación'),
      'aplicaci�n', 'aplicación'), 'operaci�n', 'operación'), 'ubicaci�n', 'ubicación'),
      'posici�n', 'posición'), 'misi�n', 'misión'), 'visi�n', 'visión'), 'decisi�n', 'decisión'),
      'presi�n', 'presión'), 'profesi�n', 'profesión'), 'expresi�n', 'expresión'), 'impresi�n', 'impresión'),
      'dimensi�n', 'dimensión'), 'extensi�n', 'extensión'), 'pasi�n', 'pasión'), 'ocasi�n', 'ocasión'),
      'graduaci�n', 'graduación'), 'situaci�n', 'situación'), 'evoluci�n', 'evolución'), 'resoluci�n', 'resolución'),
      'revoluci�n', 'revolución'), 'contribuci�n', 'contribución'), 'distribuci�n', 'distribución'), 'soluci�n', 'solución'),
      'constituci�n', 'constitución'), 'instituci�n', 'institución')
  WHERE biography LIKE '%�%';

  -- Fix address field
  UPDATE members SET
    address = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      address,
      'M�sica', 'Música'), 'Oc�ano', 'Océano'), 'Atl�ntico', 'Atlántico'), 'R�os', 'Ríos'),
      'Pla�a', 'Plaza'), 'Pe�a', 'Peña'), 'Monta�a', 'Montaña'), '�pera', 'Ópera'),
      'Catalu�a', 'Cataluña'), 'Arag�n', 'Aragón')
  WHERE address LIKE '%�%';

  -- Log the number of updated rows
  RAISE NOTICE 'Encoding fix completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Run the encoding fix
SELECT fix_encoding_issues();

-- Clean up the function
DROP FUNCTION fix_encoding_issues();

-- Re-enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Verify the fix worked by checking some names
SELECT first_name, last_name, display_name 
FROM members 
WHERE first_name LIKE '%í%' OR last_name LIKE '%í%' OR display_name LIKE '%í%'
LIMIT 10;