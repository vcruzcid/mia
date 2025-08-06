#!/usr/bin/env node

/**
 * Simple data quality check for Supabase using ANON key
 * This script can identify some data quality issues without admin access
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPublicMembers() {
  console.log('\n🔍 Checking public member data quality...');
  
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, company, bio, city, province, main_profession')
      .eq('privacy_level', 'public')
      .limit(100);

    if (error) {
      console.error('Error checking members:', error);
      return;
    }

    console.log(`📊 Checking ${members?.length || 0} public member records...`);
    
    if (!members || members.length === 0) {
      console.log('No public members found to check');
      return;
    }

    let encodingIssues = 0;
    let missingData = 0;
    
    // Check for encoding issues and missing data
    members.forEach(member => {
      const fields = ['first_name', 'last_name', 'company', 'bio', 'city', 'province', 'main_profession'];
      
      fields.forEach(field => {
        const value = member[field];
        if (value && typeof value === 'string') {
          // Check for HTML entities and encoded characters
          if (value.match(/&[a-zA-Z0-9#]+;/)) {
            encodingIssues++;
            console.log(`   ⚠️  Encoding issue in ${field} for member ${member.id}: ${value.substring(0, 50)}...`);
          }
        }
      });
      
      // Check for missing essential data
      if (!member.first_name || !member.last_name) {
        missingData++;
        console.log(`   ⚠️  Missing name data for member ${member.id}`);
      }
    });

    console.log('\n📈 Data Quality Summary:');
    console.log(`   • Records checked: ${members.length}`);
    console.log(`   • Encoding issues found: ${encodingIssues}`);
    console.log(`   • Missing essential data: ${missingData}`);
    
    if (encodingIssues > 0 || missingData > 0) {
      console.log('\n🔧 To fix these issues:');
      console.log('   1. Run the enhanced cleanup-supabase.sql script in Supabase SQL Editor');
      console.log('   2. The script includes comprehensive character encoding fixes');
    }
    
  } catch (error) {
    console.error('❌ Error during data quality check:', error);
  }
}

async function main() {
  console.log('🚀 Starting Simple Supabase Data Quality Check...\n');
  
  try {
    await checkPublicMembers();
    console.log('\n✅ Simple data quality check completed!');
    
  } catch (error) {
    console.error('❌ Error during data quality check:', error);
    process.exit(1);
  }
}

main();