#!/usr/bin/env node

/**
 * Check for duplicate and invalid member records in Supabase
 * This script identifies data quality issues without making changes
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicateEmails() {
  console.log('\n🔍 Checking for duplicate email addresses...');
  
  const { data: duplicates, error } = await supabase
    .rpc('sql', {
      query: `
        SELECT email, COUNT(*) as count, array_agg(id) as member_ids
        FROM members 
        WHERE email IS NOT NULL AND email != ''
        GROUP BY email 
        HAVING COUNT(*) > 1
        ORDER BY count DESC;
      `
    });

  if (error) {
    console.error('Error checking duplicates:', error);
    return;
  }

  if (duplicates && duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} duplicate email(s):`);
    duplicates.forEach(dup => {
      console.log(`   • ${dup.email}: ${dup.count} records (IDs: ${dup.member_ids.join(', ')})`);
    });
  } else {
    console.log('✅ No duplicate emails found');
  }

  return duplicates || [];
}

async function checkInvalidData() {
  console.log('\n🔍 Checking for invalid member data...');
  
  const { data: members, error } = await supabase
    .from('members')
    .select('id, email, first_name, last_name, privacy_level, membership_type, is_active')
    .or('email.is.null,email.eq.,first_name.is.null,first_name.eq.,last_name.is.null,last_name.eq.');

  if (error) {
    console.error('Error checking invalid data:', error);
    return;
  }

  console.log(`📊 Found ${members?.length || 0} records with missing required fields`);
  
  if (members && members.length > 0) {
    const issues = {
      missing_email: members.filter(m => !m.email || m.email === '').length,
      missing_first_name: members.filter(m => !m.first_name || m.first_name === '').length,
      missing_last_name: members.filter(m => !m.last_name || m.last_name === '').length,
    };

    Object.entries(issues).forEach(([issue, count]) => {
      if (count > 0) {
        console.log(`   • ${issue.replace('_', ' ')}: ${count} records`);
      }
    });
  }

  return members || [];
}

async function checkOrphanedData() {
  console.log('\n🔍 Checking for orphaned data...');
  
  // Check orphaned categories
  const { data: orphanedCategories, error: catError } = await supabase
    .from('member_categories')
    .select('id, member_id')
    .not('member_id', 'in', '(select id from members)');

  if (!catError && orphanedCategories) {
    console.log(`📊 Orphaned categories: ${orphanedCategories.length}`);
  }

  // Check orphaned activity logs
  const { data: orphanedActivity, error: actError } = await supabase
    .from('member_activity')
    .select('id, member_id')
    .not('member_id', 'in', '(select id from members)');

  if (!actError && orphanedActivity) {
    console.log(`📊 Orphaned activity logs: ${orphanedActivity.length}`);
  }

  // Check orphaned stripe data
  const { data: orphanedStripe, error: stripeError } = await supabase
    .from('stripe_customers')
    .select('id, member_id')
    .not('member_id', 'in', '(select id from members)');

  if (!stripeError && orphanedStripe) {
    console.log(`📊 Orphaned stripe customers: ${orphanedStripe.length}`);
  }

  return {
    categories: orphanedCategories?.length || 0,
    activity: orphanedActivity?.length || 0,
    stripe: orphanedStripe?.length || 0
  };
}

async function generateDataQualityReport() {
  console.log('\n📈 Generating data quality report...');
  
  const { data: stats, error } = await supabase
    .rpc('sql', {
      query: `
        SELECT 
          COUNT(*) as total_members,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_members,
          COUNT(CASE WHEN is_board_member = true THEN 1 END) as board_members,
          COUNT(CASE WHEN privacy_level = 'public' THEN 1 END) as public_members,
          COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as missing_emails,
          COUNT(CASE WHEN stripe_customer_id IS NOT NULL THEN 1 END) as stripe_connected,
          COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as members_logged_in
        FROM members;
      `
    });

  if (!error && stats && stats.length > 0) {
    const report = stats[0];
    console.log('\n📊 Database Statistics:');
    console.log(`   • Total members: ${report.total_members}`);
    console.log(`   • Active members: ${report.active_members}`);
    console.log(`   • Board members: ${report.board_members}`);
    console.log(`   • Public members: ${report.public_members}`);
    console.log(`   • Missing emails: ${report.missing_emails}`);
    console.log(`   • Stripe connected: ${report.stripe_connected}`);
    console.log(`   • Ever logged in: ${report.members_logged_in}`);
  }
}

async function main() {
  console.log('🚀 Starting Supabase Data Quality Check...\n');
  
  try {
    const duplicates = await checkDuplicateEmails();
    const invalidData = await checkInvalidData();
    const orphanedData = await checkOrphanedData();
    await generateDataQualityReport();

    console.log('\n✅ Data quality check completed!');
    
    const totalIssues = duplicates.length + invalidData.length + 
                       orphanedData.categories + orphanedData.activity + orphanedData.stripe;
    
    if (totalIssues > 0) {
      console.log(`\n⚠️  Total issues found: ${totalIssues}`);
      console.log('\n🔧 To fix these issues, run the cleanup-supabase.sql script in Supabase SQL Editor');
    } else {
      console.log('\n🎉 No data quality issues found!');
    }
    
  } catch (error) {
    console.error('❌ Error during data quality check:', error);
    process.exit(1);
  }
}

main();