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

async function checkSchema() {
  try {
    // Get a sample record to see available fields
    const { data, error } = await supabase
      .from('public_members')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Available fields in public_members:');
      console.log(Object.keys(data[0]));
      
      // Show sample data with encoding issues
      console.log('\nSample record:');
      console.log('first_name:', data[0].first_name);
      console.log('last_name:', data[0].last_name);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();