#!/usr/bin/env node

/**
 * WordPress to Supabase Migration Script
 * 
 * This script transforms the exported WordPress member data into the Supabase schema format
 * and handles the migration process including:
 * 1. Data transformation and cleaning
 * 2. Stripe customer ID extraction and formatting
 * 3. Social media JSON structure creation
 * 4. Category relationship mapping
 * 5. Data validation and error handling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Starting WordPress to Supabase Migration...');

// Load the exported WordPress data
function loadWordPressData() {
  const exportPath = path.join(__dirname, 'exports', 'wordpress-members-complete.json');
  
  if (!fs.existsSync(exportPath)) {
    console.error('❌ WordPress export file not found:', exportPath);
    console.log('   Please run: node scripts/export-members-json.js first');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
  console.log(`📊 Loaded ${data.members.length} members from WordPress export`);
  
  return data;
}

// Clean and parse date fields
function parseDate(dateValue) {
  if (!dateValue || dateValue === '' || dateValue === '0') return null;
  
  // Handle Unix timestamps (negative for dates before 1970)
  if (typeof dateValue === 'string' && /^-?\d+$/.test(dateValue)) {
    const timestamp = parseInt(dateValue);
    // Convert to milliseconds if it's a Unix timestamp
    const date = new Date(timestamp * 1000);
    if (date.getFullYear() > 1900 && date.getFullYear() < 2100) {
      return date.toISOString().split('T')[0];
    }
  }
  
  // Handle regular date strings
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
      return date.toISOString().split('T')[0];
    }
  }
  
  return null;
}

// Extract and format Stripe customer ID
function extractStripeCustomerId(userMetadata) {
  const stripeField = userMetadata._live_stripe_customer_id || userMetadata._stripe_customer_id;
  
  if (!stripeField) return null;
  
  // Handle serialized PHP array format: a:3:{s:2:"id";s:18:"cus_L4UxWEJB0rZbPR";...}
  if (typeof stripeField === 'string' && stripeField.includes('cus_')) {
    const match = stripeField.match(/s:\d+:"(cus_[^"]+)"/);
    if (match) {
      return match[1];
    }
    
    // Also try direct extraction if it's just the ID
    const directMatch = stripeField.match(/(cus_[A-Za-z0-9]+)/);
    if (directMatch) {
      return directMatch[1];
    }
  }
  
  return null;
}

// Build social media JSON object
function buildSocialMediaJson(customFields, userMetadata = {}) {
  const socialMedia = {};
  
  // Mapping of fields to social media platforms
  const socialMappings = {
    linkedin: customFields.linkedin || userMetadata.linkedin,
    instagram: customFields.instagram || userMetadata.instagram,
    twitter: customFields.twitter || userMetadata.twitter,
    facebook: customFields.facebook || userMetadata.facebook,
    website: customFields.web,
    youtube: customFields.youtube,
    vimeo: customFields.vimeo,
    artstation: customFields.artstation
  };
  
  // Only include non-empty values
  Object.entries(socialMappings).forEach(([platform, url]) => {
    if (url && url.trim() !== '' && url !== '#') {
      // Clean up URLs - ensure they start with http/https for external links
      let cleanUrl = url.trim();
      if (platform !== 'twitter' || platform !== 'instagram') {
        // For platforms that might have @ symbols, clean them up
        if (cleanUrl.startsWith('@')) {
          cleanUrl = cleanUrl.substring(1);
        }
      }
      
      // Add protocol if missing for full URLs
      if (cleanUrl.includes('.') && !cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      socialMedia[platform] = cleanUrl;
    }
  });
  
  return Object.keys(socialMedia).length > 0 ? socialMedia : null;
}

// Parse serialized PHP arrays (for associations)
function parsePhpSerializedArray(serialized) {
  if (!serialized || typeof serialized !== 'string') return [];
  
  // Simple parser for the specific format we see in the data
  // Format: a:1:{s:64:"key";a:1:{i:0;s:13:"value";}}
  const matches = serialized.match(/s:\d+:"([^"]+)"/g);
  if (matches) {
    return matches.map(match => {
      const valueMatch = match.match(/s:\d+:"([^"]+)"/);
      return valueMatch ? valueMatch[1] : null;
    }).filter(Boolean);
  }
  
  return [];
}

// Transform a single member from WordPress to Supabase format
function transformMember(wpMember, index) {
  const { custom_fields, user_metadata, taxonomies } = wpMember;
  
  // Extract Stripe customer ID
  const stripeCustomerId = extractStripeCustomerId(user_metadata);
  
  // Build social media JSON
  const socialMedia = buildSocialMediaJson(custom_fields, user_metadata);
  
  // Parse other professions array
  const otherProfessions = [];
  if (taxonomies['otra-profesion']) {
    otherProfessions.push(...taxonomies['otra-profesion'].map(p => p.name));
  }
  
  // Parse other associations
  const otherAssociations = parsePhpSerializedArray(custom_fields['perteneces-otras-asociaciones-socias']);
  
  // Determine membership type from taxonomies
  let membershipType = 'member';
  if (taxonomies['tipos-de-socias']) {
    const typeSlug = taxonomies['tipos-de-socias'][0]?.slug;
    if (typeSlug) {
      membershipType = typeSlug;
    }
  }
  
  // Check if board member
  const isBoardMember = taxonomies['socia-directiva'] && taxonomies['socia-directiva'].length > 0;
  const boardPosition = isBoardMember ? taxonomies['socia-directiva'][0]?.name : null;
  
  return {
    // WordPress reference
    wp_post_id: parseInt(wpMember.post_id),
    wp_user_id: wpMember.wordpress_user_id ? parseInt(wpMember.wordpress_user_id) : null,
    
    // Basic info
    member_number: custom_fields['numero-socia'] ? parseInt(custom_fields['numero-socia']) : null,
    first_name: custom_fields['nombre-socia'] || wpMember.display_name.split(' ')[0] || 'Unknown',
    last_name: custom_fields['apellidos-socia'] || wpMember.display_name.split(' ').slice(1).join(' ') || 'Unknown',
    display_name: wpMember.display_name,
    email: custom_fields['email-socia'] || `member${index}@temp.com`, // Fallback email
    phone: custom_fields['telefono-socia'] || null,
    birth_date: parseDate(custom_fields['fecha-nacimiento-socia']),
    
    // Professional info
    main_profession: custom_fields['profesion-principal'] || (taxonomies['profesion-principal'] ? taxonomies['profesion-principal'][0]?.name : null),
    other_professions: otherProfessions.length > 0 ? otherProfessions : null,
    company: custom_fields['empresa-socia'] || user_metadata.billing_company || null,
    years_experience: custom_fields['anos-experiencia-socia'] ? parseInt(custom_fields['anos-experiencia-socia']) : null,
    biography: custom_fields['biografia-socia'] || null,
    professional_role: custom_fields['rol-profesional-socias'] || null,
    employment_status: custom_fields['situacion-laboral-socia'] || null,
    salary_range: custom_fields['rango-salarial-socia'] ? parseInt(custom_fields['rango-salarial-socia']) : null,
    
    // Location
    address: custom_fields['direccion-postal-socia'] || null,
    postal_code: custom_fields['codigo-postal'] || null,
    province: custom_fields['provincia-socia'] || null,
    autonomous_community: custom_fields['comunidad-autonoma-socia'] || null,
    country: 'España',
    
    // Social media
    social_media: socialMedia,
    
    // Education
    education_level: custom_fields['nivel-estudios-socia'] || null,
    studies_completed: custom_fields['estudios-cursados-socia'] || null,
    educational_institution: custom_fields['centro-estudios-socia'] || null,
    is_student: custom_fields['estudiante-socia'] === 'si',
    
    // Member classification
    membership_type: membershipType,
    is_board_member: isBoardMember,
    board_position: boardPosition,
    is_active: true,
    
    // Privacy & preferences
    accepts_newsletter: custom_fields['newsletter-ofertas-empleo-socias'] === 'si',
    accepts_job_offers: custom_fields['newsletter-ofertas-empleo-socias'] === 'si',
    gdpr_accepted: custom_fields['politica-privacidad-socias'] === 'Si',
    privacy_level: 'public', // Default to public for existing members
    
    // Personal information
    personal_situation: custom_fields['situacion-personal'] || null,
    has_children: custom_fields['tienes-hijos'] === 'si',
    work_life_balance: custom_fields['conciliacion-familiar'] === 'si',
    
    // Industry issues awareness
    experienced_gender_discrimination: custom_fields['discriminacion-genero'] === 'si',
    experienced_salary_discrimination: custom_fields['distincion-salarial'] === 'si',
    experienced_sexual_harassment: custom_fields['agresion-sexual'] === 'si',
    experienced_sexual_abuse: custom_fields['abuso-sexual'] === 'si',
    experienced_glass_ceiling: custom_fields['techo-cristal'] === 'si',
    experienced_inequality_episode: custom_fields['episodio-desigualdad'] === 'si',
    
    // Stripe integration
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_status: stripeCustomerId ? 'unknown' : null,
    
    // Associations
    other_associations: otherAssociations.length > 0 ? otherAssociations : null,
    
    // Files
    cv_document_url: custom_fields['curriculum-vitae-socia'] || null,
    profile_image_url: null, // Will be populated later if needed
    
    // Timestamps
    created_at: wpMember.created_at,
    migrated_at: new Date().toISOString()
  };
}

// Transform categories for a member
function transformMemberCategories(wpMember, memberId) {
  const categories = [];
  const { taxonomies } = wpMember;
  
  // Map taxonomies to categories
  const taxonomyMappings = {
    'profesion-principal': 'profession',
    'otra-profesion': 'other_profession',
    'tipos-de-socias': 'member_type',
    'socia-directiva': 'board_role',
    'pais-socia': 'country'
  };
  
  Object.entries(taxonomyMappings).forEach(([wpTaxonomy, categoryType]) => {
    if (taxonomies[wpTaxonomy]) {
      taxonomies[wpTaxonomy].forEach((term, index) => {
        categories.push({
          member_id: memberId,
          category_type: categoryType,
          category_name: term.name,
          category_slug: term.slug,
          is_primary: index === 0 // First one is primary
        });
      });
    }
  });
  
  return categories;
}

// Main transformation function
function transformWordPressData(wpData) {
  console.log('🔄 Transforming WordPress data to Supabase format...');
  
  const transformedMembers = [];
  const transformedCategories = [];
  const errors = [];
  
  wpData.members.forEach((wpMember, index) => {
    try {
      // Transform member
      const member = transformMember(wpMember, index);
      transformedMembers.push(member);
      
      // Generate a temporary ID for categories (will be replaced with actual UUID)
      const tempId = `temp_${index}`;
      
      // Transform categories
      const categories = transformMemberCategories(wpMember, tempId);
      transformedCategories.push(...categories);
      
    } catch (error) {
      console.error(`❌ Error transforming member ${wpMember.post_id}:`, error.message);
      errors.push({
        wp_post_id: wpMember.post_id,
        display_name: wpMember.display_name,
        error: error.message
      });
    }
  });
  
  return {
    members: transformedMembers,
    categories: transformedCategories,
    errors,
    stats: {
      total_wp_members: wpData.members.length,
      transformed_members: transformedMembers.length,
      errors: errors.length,
      members_with_stripe: transformedMembers.filter(m => m.stripe_customer_id).length,
      board_members: transformedMembers.filter(m => m.is_board_member).length,
      active_members: transformedMembers.filter(m => m.is_active).length
    }
  };
}

// Save transformed data
function saveTransformedData(transformedData) {
  const outputDir = path.join(__dirname, 'exports');
  
  // Save members data for Supabase import
  fs.writeFileSync(
    path.join(outputDir, 'supabase-members.json'),
    JSON.stringify(transformedData.members, null, 2)
  );
  
  // Save categories data
  fs.writeFileSync(
    path.join(outputDir, 'supabase-categories.json'),
    JSON.stringify(transformedData.categories, null, 2)
  );
  
  // Save transformation report
  const report = {
    timestamp: new Date().toISOString(),
    stats: transformedData.stats,
    errors: transformedData.errors,
    sample_member: transformedData.members[0] // First member as example
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'migration-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  return outputDir;
}

// Generate SQL insert statements for easy import
function generateSQLInserts(transformedData) {
  console.log('📝 Generating SQL insert statements...');
  
  let sql = '-- MIA Members Migration SQL\n';
  sql += '-- Generated on: ' + new Date().toISOString() + '\n\n';
  
  // Members inserts
  sql += '-- Insert members\n';
  transformedData.members.forEach(member => {
    const values = [
      member.wp_post_id || 'NULL',
      member.wp_user_id || 'NULL',
      member.member_number || 'NULL',
      `'${member.first_name.replace(/'/g, "''")}'`,
      `'${member.last_name.replace(/'/g, "''")}'`,
      member.display_name ? `'${member.display_name.replace(/'/g, "''")}'` : 'NULL',
      `'${member.email}'`,
      member.phone ? `'${member.phone}'` : 'NULL',
      member.birth_date ? `'${member.birth_date}'` : 'NULL',
      member.main_profession ? `'${member.main_profession.replace(/'/g, "''")}'` : 'NULL',
      member.company ? `'${member.company.replace(/'/g, "''")}'` : 'NULL',
      member.years_experience || 'NULL',
      member.biography ? `'${member.biography.replace(/'/g, "''").substring(0, 1000)}'` : 'NULL',
      member.professional_role ? `'${member.professional_role}'` : 'NULL',
      member.employment_status ? `'${member.employment_status}'` : 'NULL',
      member.salary_range || 'NULL',
      member.address ? `'${member.address.replace(/'/g, "''")}'` : 'NULL',
      member.postal_code ? `'${member.postal_code}'` : 'NULL',
      member.province ? `'${member.province}'` : 'NULL',
      member.autonomous_community ? `'${member.autonomous_community}'` : 'NULL',
      `'${member.country}'`,
      member.social_media ? `'${JSON.stringify(member.social_media).replace(/'/g, "''")}'::jsonb` : 'NULL',
      member.education_level ? `'${member.education_level}'` : 'NULL',
      member.studies_completed ? `'${member.studies_completed.replace(/'/g, "''")}'` : 'NULL',
      member.educational_institution ? `'${member.educational_institution.replace(/'/g, "''")}'` : 'NULL',
      member.is_student,
      member.membership_type ? `'${member.membership_type}'` : 'NULL',
      member.is_board_member,
      member.board_position ? `'${member.board_position.replace(/'/g, "''")}'` : 'NULL',
      member.is_active,
      member.accepts_newsletter,
      member.accepts_job_offers,
      member.gdpr_accepted,
      `'${member.privacy_level}'`,
      member.stripe_customer_id ? `'${member.stripe_customer_id}'` : 'NULL',
      `'${member.created_at}'`,
      `'${member.migrated_at}'`
    ].join(', ');
    
    sql += `INSERT INTO members (wp_post_id, wp_user_id, member_number, first_name, last_name, display_name, email, phone, birth_date, main_profession, company, years_experience, biography, professional_role, employment_status, salary_range, address, postal_code, province, autonomous_community, country, social_media, education_level, studies_completed, educational_institution, is_student, membership_type, is_board_member, board_position, is_active, accepts_newsletter, accepts_job_offers, gdpr_accepted, privacy_level, stripe_customer_id, created_at, migrated_at) VALUES (${values});\n`;
  });
  
  return sql;
}

// Main migration function
async function runMigration() {
  try {
    // Load WordPress data
    const wpData = loadWordPressData();
    
    // Transform data
    const transformedData = transformWordPressData(wpData);
    
    // Save transformed data
    const outputDir = saveTransformedData(transformedData);
    
    // Generate SQL inserts
    const sqlInserts = generateSQLInserts(transformedData);
    fs.writeFileSync(path.join(outputDir, 'members-insert.sql'), sqlInserts);
    
    // Print results
    console.log('\n✅ Migration transformation completed!');
    console.log('\n📊 Statistics:');
    console.log(`   - WordPress Members: ${transformedData.stats.total_wp_members}`);
    console.log(`   - Transformed Members: ${transformedData.stats.transformed_members}`);
    console.log(`   - Errors: ${transformedData.stats.errors}`);
    console.log(`   - Members with Stripe: ${transformedData.stats.members_with_stripe}`);
    console.log(`   - Board Members: ${transformedData.stats.board_members}`);
    console.log(`   - Active Members: ${transformedData.stats.active_members}`);
    
    console.log('\n📁 Generated files:');
    console.log(`   - ${path.join(outputDir, 'supabase-members.json')}`);
    console.log(`   - ${path.join(outputDir, 'supabase-categories.json')}`);
    console.log(`   - ${path.join(outputDir, 'migration-report.json')}`);
    console.log(`   - ${path.join(outputDir, 'members-insert.sql')}`);
    
    if (transformedData.errors.length > 0) {
      console.log('\n⚠️  Errors occurred during transformation:');
      transformedData.errors.forEach(error => {
        console.log(`   - ${error.display_name} (${error.wp_post_id}): ${error.error}`);
      });
    }
    
    console.log('\n🔄 Next steps:');
    console.log('   1. Review the migration-report.json for any issues');
    console.log('   2. Set up your Supabase project credentials');
    console.log('   3. Apply the schema.sql to your Supabase database');
    console.log('   4. Import the transformed data to Supabase');
    console.log('   5. Run Stripe integration to match customers');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
runMigration();