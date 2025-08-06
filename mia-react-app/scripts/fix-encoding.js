import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Character mapping to fix encoding issues
const encodingFixes = {
  'Ram�rez': 'Ramírez',
  'Rodr�guez': 'Rodríguez',
  'M�riam': 'Míriam',
  'Su�rez': 'Suárez',
  'N��ez': 'Núñez',
  'Mart�nez': 'Martínez',
  'Gonz�lez': 'González',
  'L�pez': 'López',
  'Jim�nez': 'Jiménez',
  'Hern�ndez': 'Hernández',
  'P�rez': 'Pérez',
  'S�nchez': 'Sánchez',
  'Fern�ndez': 'Fernández',
  'Mu�oz': 'Muñoz',
  'Ru�z': 'Ruiz',
  'D�az': 'Díaz',
  'V�zquez': 'Vázquez',
  'Rub�n': 'Rubén',
  'Guti�rrez': 'Gutiérrez',
  'Jes�s': 'Jesús',
  'Mar�a': 'María',
  'Jos�': 'José',
  'Andr�s': 'Andrés',
  'Sebasti�n': 'Sebastián',
  'Nicol�s': 'Nicolás',
  'Iv�n': 'Iván',
  'F�lix': 'Félix',
  '�ngel': 'Ángel',
  '�lvarez': 'Álvarez',
  '�vila': 'Ávila',
  'In�s': 'Inés',
  'Bel�n': 'Belén',
  'Cristi�n': 'Cristián',
  'Dami�n': 'Damián',
  'Fabi�n': 'Fabián',
  'Adri�n': 'Adrián',
  'direcci�n': 'dirección',
  'producci�n': 'producción',
  'animaci�n': 'animación',
  'especializaci�n': 'especialización',
  'creaci�n': 'creación',
  'investigaci�n': 'investigación',
  'educaci�n': 'educación',
  'formaci�n': 'formación',
  'participaci�n': 'participación',
  'colaboraci�n': 'colaboración',
  'organizaci�n': 'organización',
  'presentaci�n': 'presentación',
  'dise�o': 'diseño',
  'dise�ador': 'diseñador',
  'dise�adora': 'diseñadora',
  'espa�ol': 'español',
  'espa�ola': 'española',
  'Espa�a': 'España',
  'a�os': 'años',
  'ni�os': 'niños',
  'compa��a': 'compañía',
  'compa��as': 'compañías',
  'ense�anza': 'enseñanza',
  'pe�a': 'peña',
  'caba�a': 'cabaña',
  'monta�a': 'montaña',
  'oto�o': 'otoño',
  'peque�o': 'pequeño',
  'peque�a': 'pequeña',
  'ni�a': 'niña',
  'sue�o': 'sueño',
  'due�o': 'dueño',
  'due�a': 'dueña',
  'bebe�': 'bebeí',
  'polic�a': 'policía',
  'geograf�a': 'geografía',
  'fotograf�a': 'fotografía',
  'biograf�a': 'biografía',
  'televisio�n': 'televisión',
  'informaci�n': 'información',
  'construcci�n': 'construcción',
  'instalaci�n': 'instalación',
  'aplicaci�n': 'aplicación',
  'operaci�n': 'operación',
  'ubicaci�n': 'ubicación',
  '�til': 'útil',
  '�ltimo': 'último',
  '�ltima': 'última',
  'f�cil': 'fácil',
  'dif�cil': 'difícil',
  'm�vil': 'móvil',
  'posici�n': 'posición',
  'misi�n': 'misión',
  'visi�n': 'visión',
  'decisi�n': 'decisión',
  'presi�n': 'presión',
  'profesi�n': 'profesión',
  'expresi�n': 'expresión',
  'impresi�n': 'impresión',
  'dimensi�n': 'dimensión',
  'extensi�n': 'extensión',
  'pasi�n': 'pasión',
  'ocasi�n': 'ocasión',
  'graduaci�n': 'graduación',
  'situaci�n': 'situación',
  'evoluci�n': 'evolución',
  'resoluci�n': 'resolución',
  'revoluci�n': 'revolución',
  'contribuci�n': 'contribución',
  'distribuci�n': 'distribución',
  'soluci�n': 'solución',
  'constituci�n': 'constitución',
  'instituci�n': 'institución',
  'prostituci�n': 'prostitución',
  'sustituci�n': 'sustitución',
  'ejecuci�n': 'ejecución',
  'persecuci�n': 'persecución',
  'consecuci�n': 'consecución',
  'atenci�n': 'atención',
  'intenci�n': 'intención',
  'retenci�n': 'retención',
  'prevenci�n': 'prevención',
  'convenci�n': 'convención',
  'intervenci�n': 'intervención',
  'invenci�n': 'invención',
  'subvenci�n': 'subvención',
  'menci�n': 'mención',
  'dimensi�n': 'dimensión',
  'suspensi�n': 'suspensión',
  'extensi�n': 'extensión',
  'compresi�n': 'compresión',
  'expresi�n': 'expresión',
  'depresi�n': 'depresión',
  'regresi�n': 'regresión',
  'agresi�n': 'agresión',
  'progresi�n': 'progresión',
  'cesi�n': 'cesión',
  'sesi�n': 'sesión',
  'profesi�n': 'profesión',
  'confesi�n': 'confesión',
  'obsesi�n': 'obsesión',
  'posesi�n': 'posesión',
  'recesi�n': 'recesión',
  'precisi�n': 'precisión',
  'decisi�n': 'decisión',
  'divisi�n': 'división',
  'visi�n': 'visión',
  'revisi�n': 'revisión',
  'supervisi�n': 'supervisión',
  'provisi�n': 'provisión',
  'misi�n': 'misión',
  'emisi�n': 'emisión',
  'admisi�n': 'admisión',
  'comisi�n': 'comisión',
  'omisi�n': 'omisión',
  'permisi�n': 'permisión',
  'remisi�n': 'remisión',
  'transmisi�n': 'transmisión',
  'sumisi�n': 'sumisión',
  'demisi�n': 'demisión'
};

function fixEncoding(text) {
  if (!text || typeof text !== 'string') return text;
  
  let fixed = text;
  for (const [corrupted, correct] of Object.entries(encodingFixes)) {
    // Global replacement with case-insensitive matching
    const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    fixed = fixed.replace(regex, correct);
  }
  
  return fixed;
}

async function processMembers(members) {
  console.log(`Found ${members.length} members to check...`);
  
  let updatedCount = 0;
  
  for (const member of members) {
    const updates = {};
    let hasChanges = false;
    
    // Check and fix text fields
    const textFields = [
      'first_name', 'last_name', 'display_name', 'main_profession', 
      'company', 'biography', 'professional_role', 'address', 
      'province', 'autonomous_community', 'country', 'education_level',
      'studies_completed', 'educational_institution', 'personal_situation'
    ];
    
    for (const field of textFields) {
      if (member[field]) {
        const fixed = fixEncoding(member[field]);
        if (fixed !== member[field]) {
          updates[field] = fixed;
          hasChanges = true;
          console.log(`  ${member.first_name} ${member.last_name}: ${field} "${member[field]}" → "${fixed}"`);
        }
      }
    }
    
    // Check and fix array fields
    if (member.other_professions && Array.isArray(member.other_professions)) {
      const fixedProfessions = member.other_professions.map(fixEncoding);
      if (JSON.stringify(fixedProfessions) !== JSON.stringify(member.other_professions)) {
        updates.other_professions = fixedProfessions;
        hasChanges = true;
      }
    }
    
    if (member.other_associations && Array.isArray(member.other_associations)) {
      const fixedAssociations = member.other_associations.map(fixEncoding);
      if (JSON.stringify(fixedAssociations) !== JSON.stringify(member.other_associations)) {
        updates.other_associations = fixedAssociations;
        hasChanges = true;
      }
    }
    
    // Update member if changes found
    if (hasChanges) {
      // Use SQL query directly to bypass RLS
      const { error: updateError } = await supabase.rpc('update_member_encoding', {
        member_id: member.id,
        updates: updates
      });
        
      if (updateError) {
        console.error(`Error updating member ${member.id}:`, updateError);
        // Try alternative update method
        try {
          const { error: altError } = await supabase
            .from('members')
            .update(updates)
            .eq('id', member.id);
            
          if (altError) {
            console.error(`Alternative update also failed for ${member.id}:`, altError);
          } else {
            updatedCount++;
          }
        } catch (e) {
          console.error(`Both update methods failed for ${member.id}`);
        }
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`✅ Encoding fix completed! Updated ${updatedCount} members.`);
}

async function fixMembersEncoding() {
  console.log('🔧 Starting encoding fix for members...');
  
  try {
    // Try to get members from public_members view first
    const { data: members, error } = await supabase
      .from('public_members')
      .select('*');
      
    if (error) {
      console.error('Error fetching members from public_members:', error);
      return;
    }
    
    await processMembers(members);
    
  } catch (error) {
    console.error('Error in encoding fix:', error);
  }
}

// Run the fix
fixMembersEncoding();