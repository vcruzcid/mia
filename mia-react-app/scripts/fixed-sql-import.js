#!/usr/bin/env node

/**
 * Fixed SQL Import - Handle only tables, not views
 * Creates a corrected SQL import that works with the actual schema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Creating fixed SQL import (tables only)...');

// Load member data
const membersPath = path.join(__dirname, 'exports', 'supabase-members.json');
const members = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));

console.log(`📊 Processing ${members.length} members...`);

// Helper function to escape SQL strings
function escapeSqlString(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str.toString();
  if (typeof str === 'boolean') return str ? 'true' : 'false';
  if (Array.isArray(str)) {
    if (str.length === 0) return 'NULL';
    return `'{${str.map(s => `"${String(s).replace(/"/g, '""')}"`).join(',')}}'`;
  }
  if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'`;
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Generate SQL INSERT statements
let sql = `-- Fixed SQL Import for MIA Members
-- Generated: ${new Date().toISOString()}
-- Total Members: ${members.length}

-- Only disable RLS on actual tables (not views)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity DISABLE ROW LEVEL SECURITY;

-- Insert members data in smaller batches to avoid memory issues
`;

// Process members in smaller batches
const batchSize = 50;
for (let i = 0; i < members.length; i += batchSize) {
  const batch = members.slice(i, i + batchSize);
  
  sql += `
-- Batch ${Math.floor(i / batchSize) + 1}: Members ${i + 1} to ${Math.min(i + batchSize, members.length)}
INSERT INTO members (
  wp_post_id, wp_user_id, member_number, first_name, last_name, display_name,
  email, phone, birth_date, main_profession, other_professions, company,
  years_experience, biography, professional_role, employment_status, salary_range,
  address, postal_code, province, autonomous_community, country, social_media,
  education_level, studies_completed, educational_institution, is_student,
  membership_type, is_board_member, board_position, is_active, accepts_newsletter, 
  accepts_job_offers, gdpr_accepted, privacy_level, personal_situation, has_children, 
  work_life_balance, experienced_gender_discrimination, experienced_salary_discrimination,
  experienced_sexual_harassment, experienced_sexual_abuse, experienced_glass_ceiling,
  experienced_inequality_episode, stripe_customer_id, stripe_subscription_status,
  other_associations, cv_document_url, profile_image_url, created_at, migrated_at
) VALUES `;

  const values = batch.map(member => {
    const socialMedia = member.social_media && Object.keys(member.social_media).length > 0 
      ? member.social_media 
      : {};
    
    const fields = [
      member.wp_post_id || 'NULL',
      member.wp_user_id || 'NULL', 
      member.member_number || 'NULL',
      escapeSqlString(member.first_name),
      escapeSqlString(member.last_name),
      escapeSqlString(member.display_name),
      escapeSqlString(member.email),
      escapeSqlString(member.phone),
      member.birth_date ? `'${member.birth_date}'` : 'NULL',
      escapeSqlString(member.main_profession),
      escapeSqlString(member.other_professions || []),
      escapeSqlString(member.company),
      member.years_experience || 'NULL',
      escapeSqlString(member.biography),
      escapeSqlString(member.professional_role),
      escapeSqlString(member.employment_status),
      member.salary_range || 'NULL',
      escapeSqlString(member.address),
      escapeSqlString(member.postal_code),
      escapeSqlString(member.province),
      escapeSqlString(member.autonomous_community),
      escapeSqlString(member.country || 'España'),
      escapeSqlString(socialMedia),
      escapeSqlString(member.education_level),
      escapeSqlString(member.studies_completed),
      escapeSqlString(member.educational_institution),
      member.is_student === true ? 'true' : 'false',
      escapeSqlString(member.membership_type),
      member.board_position ? 'true' : 'false', // is_board_member
      escapeSqlString(member.board_position), // board_position
      member.is_active !== false ? 'true' : 'false',
      member.accepts_newsletter === true ? 'true' : 'false',
      member.accepts_job_offers === true ? 'true' : 'false',
      member.gdpr_accepted !== false ? 'true' : 'false',
      escapeSqlString(member.privacy_level || 'public'),
      escapeSqlString(member.personal_situation),
      member.has_children === true ? 'true' : 'false',
      member.work_life_balance !== false ? 'true' : 'false',
      member.experienced_gender_discrimination === true ? 'true' : 'false',
      member.experienced_salary_discrimination === true ? 'true' : 'false',
      member.experienced_sexual_harassment === true ? 'true' : 'false',
      member.experienced_sexual_abuse === true ? 'true' : 'false',
      member.experienced_glass_ceiling === true ? 'true' : 'false',
      member.experienced_inequality_episode === true ? 'true' : 'false',
      escapeSqlString(member.stripe_customer_id),
      escapeSqlString(member.stripe_subscription_status || 'unknown'),
      escapeSqlString(member.other_associations || []),
      escapeSqlString(member.cv_document_url),
      escapeSqlString(member.profile_image_url),
      member.created_at ? `'${member.created_at}'` : 'NOW()',
      `'${member.migrated_at || new Date().toISOString()}'`
    ];
    
    return `(${fields.join(', ')})`;
  });

  sql += values.join(',\n') + '\nON CONFLICT (email) DO NOTHING;\n';
}

// Re-enable RLS and create basic policies
sql += `
-- Re-enable RLS on tables only
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;

-- Create basic policies for public access
CREATE POLICY "Public can view public member info" ON members 
  FOR SELECT USING (privacy_level = 'public');

-- Update statistics
SELECT 'Import Complete: ' || COUNT(*) || ' members imported' AS status FROM members;
SELECT 'Board Members: ' || COUNT(*) || ' members with board positions' AS board_status 
FROM members WHERE board_position IS NOT NULL;
SELECT 'Stripe Customers: ' || COUNT(*) || ' members with Stripe IDs' AS stripe_status 
FROM members WHERE stripe_customer_id IS NOT NULL;
`;

// Write SQL file
const sqlPath = path.join(__dirname, 'exports', 'fixed-import.sql');
fs.writeFileSync(sqlPath, sql);

// Get statistics
const boardMembers = members.filter(m => m.board_position);
const stripeMembers = members.filter(m => m.stripe_customer_id);

console.log('✅ Fixed SQL import file created:', sqlPath);
console.log('');
console.log('🔧 To import data:');
console.log('1. Go to your Supabase Dashboard → SQL Editor');
console.log('2. Copy and paste the contents of fixed-import.sql'); 
console.log('3. Click "Run" to execute');
console.log('');
console.log('📊 Statistics:');
console.log(`   - Total members: ${members.length}`);
console.log(`   - Board members: ${boardMembers.length}`);
console.log(`   - Members with Stripe: ${stripeMembers.length}`);
console.log('');
console.log('✅ This version:');
console.log('   - Only handles actual tables (not views)');
console.log('   - Uses ON CONFLICT to handle duplicates');
console.log('   - Smaller batches for better performance');
console.log('   - Proper boolean and JSON handling');