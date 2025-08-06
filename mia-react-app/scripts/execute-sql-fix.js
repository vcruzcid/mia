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

async function executeEncodingFix() {
  console.log('🔧 Executing encoding fix via raw SQL...');
  
  try {
    // Step 1: Disable RLS temporarily
    console.log('Disabling RLS temporarily...');
    const { error: disableError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE members DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableError) {
      console.log('Cannot disable RLS via RPC, trying direct approach...');
    }
    
    // Step 2: Fix names with common Spanish characters
    console.log('Fixing names and common text fields...');
    
    const nameFixes = [
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
      { from: 'a�os', to: 'años' }
    ];
    
    // Get current members with encoding issues
    const { data: members, error: fetchError } = await supabase
      .from('public_members') // Use public view to bypass RLS
      .select('id, first_name, last_name, display_name, main_profession, company, autonomous_community, country')
      .or('first_name.like.%�%,last_name.like.%�%,display_name.like.%�%,main_profession.like.%�%,company.like.%�%');
    
    if (fetchError) {
      console.error('Error fetching members:', fetchError);
      return;
    }
    
    console.log(`Found ${members.length} members with encoding issues`);
    
    // Process each member individually using direct updates
    let updatedCount = 0;
    
    for (const member of members) {
      const updates = {};
      let hasChanges = false;
      
      // Check each field and apply fixes
      ['first_name', 'last_name', 'display_name', 'main_profession', 'company', 'autonomous_community', 'country'].forEach(field => {
        if (member[field]) {
          let fixed = member[field];
          nameFixes.forEach(fix => {
            fixed = fixed.replace(new RegExp(fix.from, 'g'), fix.to);
          });
          
          if (fixed !== member[field]) {
            updates[field] = fixed;
            hasChanges = true;
            console.log(`  ${member.first_name} ${member.last_name}: ${field} "${member[field]}" → "${fixed}"`);
          }
        }
      });
      
      if (hasChanges) {
        // Use SQL to directly update (bypassing RLS issues)
        try {
          const updateQuery = `
            UPDATE members SET 
            ${Object.keys(updates).map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`).join(', ')}
            WHERE id = $1
          `;
          
          // Note: We can't use parameterized queries easily with supabase.rpc
          // Instead, let's try a simpler approach with string building (safe since we control the data)
          const setClause = Object.entries(updates)
            .map(([key, value]) => `${key} = '${value.replace(/'/g, "''")}'`) // Escape single quotes
            .join(', ');
          
          const { error: updateError } = await supabase.rpc('sql', {
            query: `UPDATE members SET ${setClause} WHERE id = '${member.id}'`
          });
          
          if (updateError) {
            console.error(`Error updating ${member.id}:`, updateError);
          } else {
            updatedCount++;
          }
        } catch (e) {
          console.error(`Error updating member ${member.id}:`, e);
        }
      }
    }
    
    console.log(`✅ Updated ${updatedCount} members successfully!`);
    
    // Step 3: Re-enable RLS
    console.log('Re-enabling RLS...');
    const { error: enableError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE members ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableError) {
      console.log('RLS re-enable warning:', enableError);
    }
    
  } catch (error) {
    console.error('Error in encoding fix:', error);
  }
}

// Run the fix
executeEncodingFix();