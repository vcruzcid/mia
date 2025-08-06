#!/usr/bin/env node

/**
 * Import Members to Supabase Database
 * 
 * This script imports the transformed member data into your Supabase database
 * using the Supabase client library
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📥 Importing Members to Supabase Database...');

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

// Check if Supabase JS library is available
async function setupSupabaseClient(env) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
    return supabase;
  } catch (error) {
    console.log('⚠️  @supabase/supabase-js not found. Installing...');
    
    try {
      const { execSync } = await import('child_process');
      execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
      
      // Try again after installation
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      console.log('✅ Supabase client installed and initialized');
      return supabase;
    } catch (installError) {
      console.error('❌ Failed to install @supabase/supabase-js:', installError.message);
      return null;
    }
  }
}

// Import members in batches
async function importMembersBatch(supabase, members, batchSize = 50) {
  console.log(`📦 Importing ${members.length} members in batches of ${batchSize}...`);
  
  const results = {
    imported: 0,
    errors: [],
    duplicates: 0
  };
  
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(members.length / batchSize);
    
    console.log(`   Processing batch ${batchNumber}/${totalBatches} (${batch.length} members)...`);
    
    try {
      const { data, error } = await supabase
        .from('members')
        .insert(batch)
        .select('id, email, first_name, last_name');
      
      if (error) {
        if (error.message.includes('duplicate key value')) {
          console.log(`   ⚠️  Batch ${batchNumber}: Some members already exist (duplicates)`);
          results.duplicates += batch.length;
        } else {
          console.error(`   ❌ Batch ${batchNumber} failed:`, error.message);
          results.errors.push({ batch: batchNumber, error: error.message });
        }
      } else {
        console.log(`   ✅ Batch ${batchNumber}: ${data.length} members imported`);
        results.imported += data.length;
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (batchError) {
      console.error(`   ❌ Batch ${batchNumber} exception:`, batchError.message);
      results.errors.push({ batch: batchNumber, error: batchError.message });
    }
  }
  
  return results;
}

// Import board members
async function importBoardMembers(supabase, members) {
  console.log('👥 Setting up board members...');
  
  const boardMembers = members.filter(member => member.board_position);
  
  if (boardMembers.length === 0) {
    console.log('   No board members found in data');
    return { imported: 0, errors: [] };
  }
  
  console.log(`   Found ${boardMembers.length} board members`);
  
  const boardData = boardMembers.map(member => ({
    member_id: member.id,
    position: member.board_position,
    year_start: new Date().getFullYear(),
    is_current: true,
    created_at: new Date().toISOString()
  }));
  
  try {
    const { data, error } = await supabase
      .from('board_members')
      .insert(boardData)
      .select();
    
    if (error) {
      console.error('   ❌ Board members import failed:', error.message);
      return { imported: 0, errors: [error.message] };
    }
    
    console.log(`   ✅ ${data.length} board members configured`);
    return { imported: data.length, errors: [] };
    
  } catch (error) {
    console.error('   ❌ Board members exception:', error.message);
    return { imported: 0, errors: [error.message] };
  }
}

// Verify import by checking record counts
async function verifyImport(supabase) {
  console.log('🔍 Verifying import...');
  
  try {
    // Count total members
    const { count: memberCount, error: memberError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });
    
    if (memberError) {
      console.error('   ❌ Failed to count members:', memberError.message);
      return false;
    }
    
    // Count board members
    const { count: boardCount, error: boardError } = await supabase
      .from('board_members')
      .select('*', { count: 'exact', head: true });
    
    if (boardError) {
      console.error('   ❌ Failed to count board members:', boardError.message);
      return false;
    }
    
    console.log(`   ✅ Total members in database: ${memberCount}`);
    console.log(`   ✅ Total board members: ${boardCount || 0}`);
    
    // Test a sample query
    const { data: sampleMembers, error: sampleError } = await supabase
      .from('members')
      .select('first_name, last_name, email, membership_type')
      .limit(3);
    
    if (sampleError) {
      console.error('   ❌ Sample query failed:', sampleError.message);
      return false;
    }
    
    console.log('   ✅ Sample members:');
    sampleMembers.forEach(member => {
      console.log(`      - ${member.first_name} ${member.last_name} (${member.email})`);
    });
    
    return true;
    
  } catch (error) {
    console.error('   ❌ Verification failed:', error.message);
    return false;
  }
}

// Generate import report
function generateImportReport(results, boardResults, verification) {
  const report = {
    timestamp: new Date().toISOString(),
    import_results: {
      members_imported: results.imported,
      members_duplicates: results.duplicates,
      members_errors: results.errors.length,
      board_members_imported: boardResults.imported,
      board_errors: boardResults.errors.length
    },
    verification_passed: verification,
    errors: [
      ...results.errors,
      ...boardResults.errors.map(error => ({ type: 'board_member', error }))
    ]
  };
  
  const reportPath = path.join(__dirname, 'exports', 'import-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

// Main import function
async function importMembers() {
  try {
    // Load environment variables
    const env = loadEnvLocal();
    
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase credentials in .env.local');
      console.error('   Required: SUPABASE_URL, SUPABASE_ANON_KEY');
      process.exit(1);
    }
    
    console.log(`🔗 Supabase Project: ${env.SUPABASE_URL}`);
    
    // Setup Supabase client
    const supabase = await setupSupabaseClient(env);
    if (!supabase) {
      console.error('❌ Failed to setup Supabase client');
      process.exit(1);
    }
    
    // Load member data
    const membersPath = path.join(__dirname, 'exports', 'supabase-members.json');
    if (!fs.existsSync(membersPath)) {
      console.error('❌ Member data not found:', membersPath);
      console.error('   Please run the migration script first');
      process.exit(1);
    }
    
    const members = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));
    console.log(`📊 Loaded ${members.length} members from export`);
    
    // Import members
    const results = await importMembersBatch(supabase, members);
    
    // Import board members (if any)
    const boardResults = await importBoardMembers(supabase, members);
    
    // Verify import
    const verification = await verifyImport(supabase);
    
    // Generate report
    const report = generateImportReport(results, boardResults, verification);
    
    // Print summary
    console.log('');
    console.log('✅ Import completed!');
    console.log('');
    console.log('📊 Import Summary:');
    console.log(`   - Members imported: ${results.imported}`);
    console.log(`   - Duplicates skipped: ${results.duplicates}`);
    console.log(`   - Import errors: ${results.errors.length}`);
    console.log(`   - Board members: ${boardResults.imported}`);
    console.log(`   - Verification: ${verification ? 'PASSED' : 'FAILED'}`);
    
    if (results.errors.length > 0) {
      console.log('');
      console.log('❌ Import Errors:');
      results.errors.forEach(error => {
        console.log(`   - Batch ${error.batch}: ${error.error}`);
      });
    }
    
    console.log('');
    console.log('📁 Report saved to:', path.join(__dirname, 'exports', 'import-report.json'));
    
    if (verification) {
      console.log('');
      console.log('🎉 Database is ready! You can now:');
      console.log('   1. Start the application: npm run dev');
      console.log('   2. Test member authentication');
      console.log('   3. View the member gallery');
      console.log('   4. Set up Stripe integration');
      
      // Update migration status
      const statusPath = path.join(__dirname, '..', 'migration-status.json');
      if (fs.existsSync(statusPath)) {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
        status.steps.member_import.completed = true;
        status.steps.member_import.timestamp = new Date().toISOString();
        status.status = results.imported > 0 ? 'completed' : 'completed_with_errors';
        fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
        console.log('   ✅ Migration status updated');
      }
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
importMembers();