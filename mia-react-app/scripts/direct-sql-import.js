#!/usr/bin/env node

/**
 * Direct SQL Import - Bypass RLS completely
 * Uses raw SQL INSERT statements to import member data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Creating direct SQL import file...');

// Load member data
const membersPath = path.join(__dirname, 'exports', 'supabase-members.json');
const members = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));

console.log(`📊 Processing ${members.length} members...`);

// Generate SQL INSERT statements
let sql = `-- Direct SQL Import for MIA Members
-- Generated: ${new Date().toISOString()}
-- Total Members: ${members.length}

-- Disable RLS temporarily
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;

-- Insert members data
`;

// Helper function to escape SQL strings
function escapeSqlString(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str.toString();
  if (typeof str === 'boolean') return str ? 'true' : 'false';
  if (Array.isArray(str)) return `'{${str.map(s => `"${s.replace(/"/g, '""')}"`).join(',')}}'`;
  if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'`;
  return `'${str.toString().replace(/'/g, "''")}'`;
}

// Generate INSERT statements in batches
const batchSize = 100;
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
  membership_type, board_position, is_active, accepts_newsletter, accepts_job_offers,
  gdpr_accepted, privacy_level, personal_situation, has_children, work_life_balance,
  experienced_gender_discrimination, experienced_salary_discrimination,
  experienced_sexual_harassment, experienced_sexual_abuse, experienced_glass_ceiling,
  experienced_inequality_episode, stripe_customer_id, stripe_subscription_status,
  other_associations, cv_document_url, profile_image_url, created_at, migrated_at
) VALUES `;

  const values = batch.map(member => {
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
      escapeSqlString(member.other_professions),
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
      escapeSqlString(member.country),
      escapeSqlString(member.social_media),
      escapeSqlString(member.education_level),
      escapeSqlString(member.studies_completed),
      escapeSqlString(member.educational_institution),
      member.is_student || 'false',
      escapeSqlString(member.membership_type),
      escapeSqlString(member.board_position),
      member.is_active !== false ? 'true' : 'false',
      member.accepts_newsletter || 'false',
      member.accepts_job_offers || 'false',
      member.gdpr_accepted !== false ? 'true' : 'false',
      escapeSqlString(member.privacy_level || 'public'),
      escapeSqlString(member.personal_situation),
      member.has_children || 'false',
      member.work_life_balance !== false ? 'true' : 'false',
      member.experienced_gender_discrimination || 'false',
      member.experienced_salary_discrimination || 'false',
      member.experienced_sexual_harassment || 'false',
      member.experienced_sexual_abuse || 'false',
      member.experienced_glass_ceiling || 'false',
      member.experienced_inequality_episode || 'false',
      escapeSqlString(member.stripe_customer_id),
      escapeSqlString(member.stripe_subscription_status || 'unknown'),
      escapeSqlString(member.other_associations),
      escapeSqlString(member.cv_document_url),
      escapeSqlString(member.profile_image_url),
      member.created_at ? `'${member.created_at}'` : 'NOW()',
      `'${member.migrated_at || new Date().toISOString()}'`
    ];
    
    return `(${fields.join(', ')})`;
  });

  sql += values.join(',\n') + ';\n';
}

// Add board members
const boardMembers = members.filter(m => m.board_position);
if (boardMembers.length > 0) {
  sql += `
-- Insert board members
INSERT INTO board_members (member_id, position, year_start, is_current)
SELECT id, board_position, EXTRACT(YEAR FROM created_at)::integer, true
FROM members 
WHERE board_position IS NOT NULL;
`;
}

// Re-enable RLS and restore policies
sql += `
-- Re-enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Restore basic policies
CREATE POLICY "Public can view public member info" ON members 
  FOR SELECT USING (privacy_level = 'public');

CREATE POLICY "Public can view board members" ON board_members 
  FOR SELECT USING (true);

-- Update statistics
SELECT 'Import Complete: ' || COUNT(*) || ' members imported' FROM members;
SELECT 'Board Members: ' || COUNT(*) || ' board positions' FROM board_members;
`;

// Write SQL file
const sqlPath = path.join(__dirname, 'exports', 'direct-import.sql');
fs.writeFileSync(sqlPath, sql);

console.log('✅ SQL import file created:', sqlPath);
console.log('');
console.log('🔧 To import data:');
console.log('1. Go to your Supabase Dashboard → SQL Editor');
console.log('2. Copy and paste the contents of direct-import.sql'); 
console.log('3. Click "Run" to execute');
console.log('');
console.log('📊 Statistics:');
console.log(`   - Total members: ${members.length}`);
console.log(`   - Board members: ${boardMembers.length}`);
console.log(`   - Members with Stripe: ${members.filter(m => m.stripe_customer_id).length}`);