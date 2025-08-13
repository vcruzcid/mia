#!/usr/bin/env node

/**
 * Supabase Data Verification Script
 * Checks completeness of member data in Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Supabase config from .env.local
config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check data completeness
async function verifySupabaseData() {
  console.log('🔍 Verifying Supabase data completeness...');
  console.log('📊 Target Supabase:', process.env.VITE_SUPABASE_URL);
  
  try {
    // 1. Check members table
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (membersError) {
      console.error('❌ Error fetching members:', membersError.message);
      return;
    }
    
    console.log(`\n📋 MEMBERS TABLE:`);
    console.log(`Total members: ${members.length}`);
    
    if (members.length === 0) {
      console.log('❌ No members found in database!');
      return;
    }
    
    // Check data completeness
    const dataStats = {
      with_email: 0,
      with_first_name: 0,
      with_last_name: 0,
      with_phone: 0,
      with_city: 0,
      with_province: 0,
      with_professions: 0,
      with_company: 0,
      with_biography: 0,
      with_profile_image: 0,
      with_cv_document: 0,
      with_social_media: 0,
      active_members: 0,
      board_members: 0,
      membership_types: {}
    };
    
    members.forEach(member => {
      if (member.email) dataStats.with_email++;
      if (member.first_name) dataStats.with_first_name++;
      if (member.last_name) dataStats.with_last_name++;
      if (member.phone) dataStats.with_phone++;
      if (member.city) dataStats.with_city++;
      if (member.province) dataStats.with_province++;
      if (member.consolidated_professions?.length > 0) dataStats.with_professions++;
      if (member.company) dataStats.with_company++;
      if (member.biography) dataStats.with_biography++;
      if (member.profile_image_url) dataStats.with_profile_image++;
      if (member.cv_document_url) dataStats.with_cv_document++;
      if (member.social_media && Object.keys(member.social_media).length > 0) dataStats.with_social_media++;
      if (member.is_active) dataStats.active_members++;
      if (member.is_board_member) dataStats.board_members++;
      
      const membershipType = member.membership_type || 'unknown';
      dataStats.membership_types[membershipType] = (dataStats.membership_types[membershipType] || 0) + 1;
    });
    
    // Display statistics
    console.log('\n📊 DATA COMPLETENESS:');
    Object.entries(dataStats).forEach(([key, value]) => {
      if (key === 'membership_types') {
        console.log(`${key}:`, value);
      } else {
        const percentage = ((value / members.length) * 100).toFixed(1);
        console.log(`${key}: ${value}/${members.length} (${percentage}%)`);
      }
    });
    
    // 2. Check member_files table
    const { data: memberFiles, error: filesError } = await supabase
      .from('member_files')
      .select('*');
    
    if (filesError) {
      console.log('⚠️  member_files table not found or error:', filesError.message);
    } else {
      console.log(`\n📎 MEMBER_FILES TABLE:`);
      console.log(`Total files: ${memberFiles.length}`);
      
      const fileStats = {};
      memberFiles.forEach(file => {
        fileStats[file.file_type] = (fileStats[file.file_type] || 0) + 1;
      });
      console.log('File types:', fileStats);
    }
    
    // 3. Check for missing profile images and resumes
    console.log(`\n🖼️  MISSING FILES ANALYSIS:`);
    const missingData = [];
    
    members.forEach(member => {
      const issues = [];
      if (!member.profile_image_url) issues.push('no profile image');
      if (!member.cv_document_url) issues.push('no resume');
      if (!member.email) issues.push('no email');
      if (!member.first_name || !member.last_name) issues.push('incomplete name');
      
      if (issues.length > 0) {
        missingData.push({
          id: member.id,
          name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'No name',
          email: member.email || 'No email',
          issues: issues
        });
      }
    });
    
    if (missingData.length > 0) {
      console.log(`❌ ${missingData.length} members with missing data:`);
      missingData.slice(0, 10).forEach((member, index) => {
        console.log(`${index + 1}. ${member.name} (${member.email}): ${member.issues.join(', ')}`);
      });
      if (missingData.length > 10) {
        console.log(`... and ${missingData.length - 10} more`);
      }
    } else {
      console.log('✅ All members have complete basic data');
    }
    
    // 4. Sample member data
    console.log(`\n👤 SAMPLE MEMBER DATA:`);
    const sampleMember = members[0];
    console.log('First member:', {
      id: sampleMember.id,
      name: `${sampleMember.first_name} ${sampleMember.last_name}`,
      email: sampleMember.email,
      membership_type: sampleMember.membership_type,
      professions: sampleMember.consolidated_professions,
      city: sampleMember.city,
      province: sampleMember.province,
      has_profile_image: !!sampleMember.profile_image_url,
      has_resume: !!sampleMember.cv_document_url,
      social_media_keys: sampleMember.social_media ? Object.keys(sampleMember.social_media) : [],
      is_active: sampleMember.is_active,
      created_at: sampleMember.created_at
    });
    
    // 5. Check Stripe integration
    try {
      const { data: stripeData, error: stripeError } = await supabase
        .from('member_stripe_data')
        .select('*')
        .limit(5);
      
      if (stripeError) {
        console.log('\n💳 STRIPE INTEGRATION: View not available or error:', stripeError.message);
      } else {
        console.log(`\n💳 STRIPE INTEGRATION:`);
        console.log(`Members with Stripe data: ${stripeData.length}`);
        if (stripeData.length > 0) {
          console.log('Sample Stripe member:', {
            email: stripeData[0].email,
            stripe_customer_id: stripeData[0].stripe_customer_id,
            subscription_status: stripeData[0].subscription_status
          });
        }
      }
    } catch (error) {
      console.log('\n💳 STRIPE INTEGRATION: Not available or error:', error.message);
    }
    
    console.log('\n✅ Verification completed!');
    
  } catch (error) {
    console.error('💥 Verification failed:', error.message);
  }
}

// Additional function to show all members
async function showAllMembers() {
  console.log('\n📋 ALL MEMBERS IN DATABASE:');
  
  const { data: members, error } = await supabase
    .from('members')
    .select(`
      id,
      first_name,
      last_name,
      email,
      membership_type,
      city,
      province,
      consolidated_professions,
      profile_image_url,
      cv_document_url,
      is_active,
      is_board_member,
      created_at
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log(`\nFound ${members.length} members:\n`);
  
  members.forEach((member, index) => {
    const name = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'No name';
    const location = [member.city, member.province].filter(Boolean).join(', ') || 'No location';
    const professions = member.consolidated_professions?.join(', ') || 'No professions';
    const files = [
      member.profile_image_url ? '📸' : '❌',
      member.cv_document_url ? '📄' : '❌'
    ].join(' ');
    
    console.log(`${(index + 1).toString().padStart(3)}. ${name.padEnd(30)} | ${member.email?.padEnd(30) || 'No email'.padEnd(30)} | ${member.membership_type?.padEnd(15) || 'unknown'.padEnd(15)} | ${files} | ${member.is_active ? '✅' : '❌'} | ${location}`);
  });
  
  console.log(`\nLegend: 📸 = Profile Image, 📄 = Resume, ✅ = Active, ❌ = Missing/Inactive`);
}

// Run verification
async function main() {
  await verifySupabaseData();
  
  // Ask if user wants to see all members
  console.log('\n❓ Would you like to see all members? (This will show detailed list)');
  console.log('💡 Uncomment the line below to show all members:');
  console.log('// await showAllMembers();');
  
  // Uncomment to show all members:
  await showAllMembers();
}

// Run verification
main().catch(console.error);