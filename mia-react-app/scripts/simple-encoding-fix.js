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

const supabase = createClient(supabaseUrl, supabaseKey);

// Character mapping for common Spanish encoding issues
const fixes = [
  { from: 'Ram�rez', to: 'Ramírez' },
  { from: 'Rodr�guez', to: 'Rodríguez' },
  { from: 'M�riam', to: 'Míriam' },
  { from: 'Su�rez', to: 'Suárez' },
  { from: 'N��ez', to: 'Núñez' },
  { from: 'Mart�nez', to: 'Martínez' },
  { from: 'Gonz�lez', to: 'González' },
  { from: 'L�pez', to: 'López' },
  { from: 'Jim�nez', to: 'Jiménez' },
  { from: 'Hern�ndez', to: 'Hernández' },
  { from: 'P�rez', to: 'Pérez' },
  { from: 'S�nchez', to: 'Sánchez' },
  { from: 'Fern�ndez', to: 'Fernández' },
  { from: 'Mu�oz', to: 'Muñoz' },
  { from: 'D�az', to: 'Díaz' },
  { from: 'V�zquez', to: 'Vázquez' },
  { from: 'Guti�rrez', to: 'Gutiérrez' },
  { from: 'Mar�a', to: 'María' },
  { from: 'Jos�', to: 'José' },
  { from: 'Andr�s', to: 'Andrés' },
  { from: '�ngel', to: 'Ángel' },
  { from: '�lvarez', to: 'Álvarez' },
  { from: 'In�s', to: 'Inés' },
  { from: 'direcci�n', to: 'dirección' },
  { from: 'producci�n', to: 'producción' },
  { from: 'animaci�n', to: 'animación' },
  { from: 'dise�o', to: 'diseño' },
  { from: 'Espa�a', to: 'España' },
  { from: 'a�os', to: 'años' },
  { from: 'ni�os', to: 'niños' },
  { from: 'ense�anza', to: 'enseñanza' },
  { from: 'compa��a', to: 'compañía' },
  { from: 'televisi�n', to: 'televisión' },
  { from: 'creaci�n', to: 'creación' }
];

function fixText(text) {
  if (!text) return text;
  let fixed = text;
  fixes.forEach(fix => {
    fixed = fixed.replace(new RegExp(fix.from, 'g'), fix.to);
  });
  return fixed;
}

async function fixEncodingIssues() {
  console.log('🔧 Starting encoding fix for member data...');
  
  try {
    // Get all public members
    const { data: members, error } = await supabase
      .from('public_members')
      .select('*');
    
    if (error) {
      console.error('Error fetching members:', error);
      return;
    }
    
    console.log(`Checking ${members.length} members for encoding issues...`);
    
    let fixedCount = 0;
    
    // Process each member
    for (const member of members) {
      const updates = {};
      let hasChanges = false;
      
      // Check text fields for encoding issues
      const textFields = ['first_name', 'last_name', 'display_name', 'main_profession', 'company', 'biography'];
      
      textFields.forEach(field => {
        if (member[field] && member[field].includes('�')) {
          const original = member[field];
          const fixed = fixText(original);
          if (fixed !== original) {
            updates[field] = fixed;
            hasChanges = true;
            console.log(`${member.display_name || member.first_name + ' ' + member.last_name}: ${field}`);
            console.log(`  "${original}" → "${fixed}"`);
          }
        }
      });
      
      // Check array fields
      if (member.other_professions && Array.isArray(member.other_professions)) {
        const fixedProfessions = member.other_professions.map(fixText);
        if (JSON.stringify(fixedProfessions) !== JSON.stringify(member.other_professions)) {
          updates.other_professions = fixedProfessions;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        console.log(`\n🔄 Updating member: ${member.display_name || member.first_name + ' ' + member.last_name}`);
        
        // Create a set of SQL UPDATE statements for each field
        for (const [field, value] of Object.entries(updates)) {
          try {
            let sqlValue;
            if (Array.isArray(value)) {
              // Handle array fields
              sqlValue = `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
            } else {
              // Handle text fields - escape single quotes
              sqlValue = `'${value.replace(/'/g, "''")}'`;
            }
            
            const updateSQL = `UPDATE members SET ${field} = ${sqlValue} WHERE id = '${member.id}'`;
            
            const { error: updateError } = await supabase.rpc('sql', {
              query: updateSQL
            });
            
            if (updateError) {
              console.error(`❌ Error updating ${field} for ${member.id}:`, updateError);
            } else {
              console.log(`✅ Updated ${field} successfully`);
            }
          } catch (e) {
            console.error(`❌ Exception updating ${field}:`, e);
          }
        }
        
        fixedCount++;
        console.log(`Completed ${fixedCount}/${members.filter(m => 
          ['first_name', 'last_name', 'display_name', 'main_profession', 'company', 'biography']
            .some(field => m[field] && m[field].includes('�'))
        ).length} members with encoding issues\n`);
      }
    }
    
    console.log(`\n✅ Encoding fix completed! Fixed ${fixedCount} members.`);
    
    // Verify the fix by checking some updated records
    console.log('\n🔍 Verifying fixes...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('public_members')
      .select('first_name, last_name, display_name')
      .limit(5);
    
    if (!verifyError && verifyData) {
      verifyData.forEach(member => {
        console.log(`${member.first_name} ${member.last_name} (${member.display_name})`);
      });
    }
    
  } catch (error) {
    console.error('Error in encoding fix:', error);
  }
}

// Run the fix
fixEncodingIssues();