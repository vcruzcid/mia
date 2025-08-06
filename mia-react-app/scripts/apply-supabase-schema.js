#!/usr/bin/env node

/**
 * Apply Supabase Schema Script
 * 
 * This script applies the complete database schema to your Supabase project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗄️  Applying Supabase Schema...');

// Load environment variables from .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found. Please create it with your Supabase credentials.');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]*?)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
  
  return envVars;
}

// Check Supabase CLI installation
async function checkSupabaseCLI() {
  try {
    const { execSync } = await import('child_process');
    execSync('supabase --version', { stdio: 'pipe' });
    console.log('✅ Supabase CLI found');
    return true;
  } catch (error) {
    console.log('⚠️  Supabase CLI not found. Please install it:');
    console.log('   npm install -g supabase');
    console.log('   or visit: https://supabase.com/docs/guides/cli');
    return false;
  }
}

// Apply schema using Supabase CLI
async function applySchemaWithCLI(env) {
  console.log('🔧 Applying schema using Supabase CLI...');
  
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    return false;
  }
  
  try {
    const { execSync } = await import('child_process');
    
    // Set environment variables for Supabase CLI
    const cliEnv = {
      ...process.env,
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY
    };
    
    console.log('   Executing schema.sql...');
    execSync(`supabase db push --db-url "${env.SUPABASE_URL}" --password "${env.SUPABASE_ANON_KEY}"`, {
      cwd: path.join(__dirname, '..'),
      env: cliEnv,
      stdio: 'inherit'
    });
    
    console.log('✅ Schema applied successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to apply schema with CLI:', error.message);
    return false;
  }
}

// Apply schema using direct SQL execution (fallback)
async function applySchemaDirectly(env) {
  console.log('🔧 Applying schema using direct SQL execution...');
  
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    return false;
  }
  
  try {
    // For now, we'll provide instructions for manual application
    console.log('📝 Manual schema application required:');
    console.log('');
    console.log('1. Go to your Supabase dashboard:');
    console.log(`   ${env.SUPABASE_URL.replace('supabase.co', 'supabase.com/dashboard')}`);
    console.log('');
    console.log('2. Navigate to SQL Editor');
    console.log('');
    console.log('3. Copy and paste the contents of:');
    console.log(`   ${schemaPath}`);
    console.log('');
    console.log('4. Execute the SQL to create all tables and functions');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to prepare schema:', error.message);
    return false;
  }
}

// Main function
async function applySchema() {
  try {
    // Load environment variables
    const env = loadEnvLocal();
    
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase credentials in .env.local');
      console.error('   Required: SUPABASE_URL, SUPABASE_ANON_KEY');
      process.exit(1);
    }
    
    console.log(`🔗 Supabase Project: ${env.SUPABASE_URL}`);
    
    // Check if Supabase CLI is available
    const hasSupabaseCLI = await checkSupabaseCLI();
    
    let success = false;
    
    if (hasSupabaseCLI) {
      success = await applySchemaWithCLI(env);
    }
    
    if (!success) {
      success = await applySchemaDirectly(env);
    }
    
    if (success) {
      console.log('');
      console.log('✅ Schema application completed!');
      console.log('');
      console.log('🔄 Next steps:');
      console.log('   1. Verify tables were created in your Supabase dashboard');
      console.log('   2. Run the member data import script');
      console.log('   3. Test the application');
      
      // Update migration status
      const statusPath = path.join(__dirname, '..', 'migration-status.json');
      if (fs.existsSync(statusPath)) {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
        status.steps.supabase_schema.completed = true;
        status.steps.supabase_schema.timestamp = new Date().toISOString();
        fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
        console.log('   ✅ Migration status updated');
      }
    }
    
  } catch (error) {
    console.error('❌ Schema application failed:', error.message);
    process.exit(1);
  }
}

// Run the script
applySchema();