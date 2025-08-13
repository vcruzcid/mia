#!/usr/bin/env node

/**
 * WordPress to Supabase Member Migration Script
 * Extracts all member data, profile pictures, and resumes from WordPress
 * and populates the online Supabase database
 */

const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const WORDPRESS_DB_CONFIG = {
  host: '192.168.1.220',
  port: 3306,
  user: 'wordpress',
  password: 'wordpress',
  database: 'wordpress'
};

const WORDPRESS_FILES_PATH = '/Users/vcruzcid/Documents/Code/NAVIC.nosync/mia/mia-wordpress/public_html';

// Load Supabase config from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// HTML decoding function
function decodeHtml(html) {
  if (!html) return html;
  
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
    '&nbsp;': ' ',
    '&hellip;': '...',
    '&#8230;': '...',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ndash;': '–',
    '&mdash;': '—'
  };
  
  let decoded = html;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  // Remove HTML tags
  decoded = decoded.replace(/<[^>]*>/g, '');
  
  // Replace multiple whitespace with single space
  decoded = decoded.replace(/\s+/g, ' ').trim();
  
  return decoded;
}

// Get WordPress connection
async function getWordPressConnection() {
  console.log('🔌 Connecting to WordPress database...');
  const connection = await mysql.createConnection(WORDPRESS_DB_CONFIG);
  console.log('✅ WordPress database connected');
  return connection;
}

// Extract member data from WordPress
async function extractMemberData(connection) {
  console.log('📊 Extracting member data from WordPress...');
  
  // Get all member posts with metadata
  const [members] = await connection.execute(`
    SELECT 
      p.ID as wp_post_id,
      p.post_title,
      p.post_content,
      p.post_date,
      p.post_status,
      u.ID as user_id,
      u.user_email,
      u.user_registered
    FROM wp_posts p
    LEFT JOIN wp_users u ON p.post_author = u.ID
    WHERE p.post_type = 'miembro'
    AND p.post_status IN ('publish', 'private')
    ORDER BY p.post_date DESC
  `);
  
  console.log(`📋 Found ${members.length} members in WordPress`);
  
  // Get all metadata for these posts
  const memberIds = members.map(m => m.wp_post_id);
  if (memberIds.length === 0) return [];
  
  const placeholders = memberIds.map(() => '?').join(',');
  const [metadata] = await connection.execute(`
    SELECT post_id, meta_key, meta_value
    FROM wp_postmeta 
    WHERE post_id IN (${placeholders})
    AND meta_key NOT LIKE '_edit%'
    AND meta_key NOT LIKE '_wp_%'
    ORDER BY post_id, meta_key
  `, memberIds);
  
  // Group metadata by post_id
  const metaByPost = {};
  metadata.forEach(meta => {
    if (!metaByPost[meta.post_id]) {
      metaByPost[meta.post_id] = {};
    }
    metaByPost[meta.post_id][meta.meta_key] = meta.meta_value;
  });
  
  // Transform members with metadata
  const transformedMembers = members.map(member => {
    const meta = metaByPost[member.wp_post_id] || {};
    
    // Extract social media from meta fields
    const socialMedia = {};
    if (meta.linkedin) socialMedia.linkedin = meta.linkedin;
    if (meta.instagram) socialMedia.instagram = meta.instagram;
    if (meta.twitter) socialMedia.twitter = meta.twitter;
    if (meta.facebook) socialMedia.facebook = meta.facebook;
    if (meta.website) socialMedia.website = meta.website;
    if (meta.youtube) socialMedia.youtube = meta.youtube;
    if (meta.vimeo) socialMedia.vimeo = meta.vimeo;
    if (meta.artstation) socialMedia.artstation = meta.artstation;
    
    // Parse professions array
    let professions = [];
    if (meta.profesiones) {
      try {
        const parsed = JSON.parse(meta.profesiones);
        professions = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        professions = meta.profesiones.split(',').map(p => p.trim()).filter(Boolean);
      }
    }
    
    return {
      wp_post_id: member.wp_post_id,
      wp_user_id: member.user_id,
      first_name: decodeHtml(meta.nombre || ''),
      last_name: decodeHtml(meta.apellidos || ''),
      display_name: decodeHtml(member.post_title || ''),
      email: member.user_email || meta.email || '',
      phone: meta.telefono || '',
      birth_date: meta.fecha_nacimiento || null,
      
      // Professional info
      consolidated_professions: professions,
      company: decodeHtml(meta.empresa || ''),
      years_experience: parseInt(meta.anos_experiencia || '0') || null,
      biography: decodeHtml(member.post_content || ''),
      professional_level: meta.nivel_profesional || meta.rol_profesional || '',
      employment_status: meta.situacion_laboral || '',
      salary_range: parseInt(meta.rango_salarial || '0') || null,
      
      // Location
      address: decodeHtml(meta.direccion || ''),
      postal_code: meta.codigo_postal || '',
      city: decodeHtml(meta.ciudad || meta.localidad || ''),
      province: decodeHtml(meta.provincia || ''),
      autonomous_community: decodeHtml(meta.comunidad_autonoma || ''),
      country: 'España',
      
      // Social media
      social_media: Object.keys(socialMedia).length > 0 ? socialMedia : {},
      
      // Education
      education_level: meta.nivel_educativo || '',
      studies_completed: decodeHtml(meta.estudios_completados || ''),
      educational_institution: decodeHtml(meta.institucion_educativa || ''),
      is_student: meta.es_estudiante === 'yes' || meta.es_estudiante === '1',
      
      // Membership
      membership_type: meta.tipo_membresia || 'colaborador',
      is_board_member: meta.es_directiva === 'yes' || meta.es_directiva === '1',
      board_position: meta.cargo_directiva || '',
      is_active: member.post_status === 'publish',
      
      // Privacy
      accepts_newsletter: meta.acepta_newsletter !== 'no',
      accepts_job_offers: meta.acepta_ofertas_trabajo !== 'no',
      gdpr_accepted: true,
      privacy_level: member.post_status === 'publish' ? 'public' : 'members-only',
      
      // Personal
      personal_situation: meta.situacion_personal || '',
      has_children: meta.tiene_hijos === 'yes' || meta.tiene_hijos === '1',
      work_life_balance: meta.conciliacion_familiar === 'yes',
      
      // Files
      profile_image_meta: meta._thumbnail_id || meta.foto_perfil || '',
      cv_document_meta: meta.curriculum_vitae || meta.cv_url || '',
      
      // Other
      other_associations: meta.otras_asociaciones ? meta.otras_asociaciones.split(',').map(a => a.trim()).filter(Boolean) : [],
      
      // Timestamps
      created_at: member.post_date,
      migrated_at: new Date().toISOString()
    };
  });
  
  console.log(`✅ Transformed ${transformedMembers.length} members`);
  return transformedMembers;
}

// Get file URLs from WordPress
async function extractFileUrls(connection, members) {
  console.log('🖼️  Extracting file URLs...');
  
  const memberFiles = [];
  
  for (const member of members) {
    const files = {};
    
    // Get profile image
    if (member.profile_image_meta) {
      const [imageResult] = await connection.execute(`
        SELECT guid, post_title, post_mime_type
        FROM wp_posts
        WHERE ID = ? AND post_type = 'attachment'
      `, [member.profile_image_meta]);
      
      if (imageResult.length > 0) {
        files.profile_image = {
          url: imageResult[0].guid,
          filename: imageResult[0].post_title,
          mime_type: imageResult[0].post_mime_type
        };
      }
    }
    
    // Get CV document
    if (member.cv_document_meta) {
      if (member.cv_document_meta.startsWith('http')) {
        files.resume = {
          url: member.cv_document_meta,
          filename: 'curriculum.pdf',
          mime_type: 'application/pdf'
        };
      } else {
        const [cvResult] = await connection.execute(`
          SELECT guid, post_title, post_mime_type
          FROM wp_posts
          WHERE ID = ? AND post_type = 'attachment'
        `, [member.cv_document_meta]);
        
        if (cvResult.length > 0) {
          files.resume = {
            url: cvResult[0].guid,
            filename: cvResult[0].post_title,
            mime_type: cvResult[0].post_mime_type
          };
        }
      }
    }
    
    if (Object.keys(files).length > 0) {
      memberFiles.push({
        member: member,
        files: files
      });
    }
  }
  
  console.log(`📎 Found ${memberFiles.length} members with files`);
  return memberFiles;
}

// Download and upload file to Supabase
async function downloadAndUploadFile(fileUrl, fileName, memberId, fileType) {
  try {
    console.log(`📥 Processing ${fileType} for member ${memberId}: ${fileName}`);
    
    // Parse URL to determine protocol
    const url = new URL(fileUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    // Download file
    const fileData = await new Promise((resolve, reject) => {
      client.get(fileUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });
    
    // Generate storage path
    const fileExt = path.extname(fileName) || (fileType === 'profile_image' ? '.jpg' : '.pdf');
    const storagePath = `${fileType}s/${memberId}/${Date.now()}${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('member-files')
      .upload(storagePath, fileData, {
        cacheControl: '3600',
        upsert: true,
        contentType: fileType === 'profile_image' ? 'image/jpeg' : 'application/pdf'
      });
    
    if (uploadError) {
      console.error(`❌ Upload failed for ${fileName}:`, uploadError.message);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('member-files')
      .getPublicUrl(storagePath);
    
    console.log(`✅ Uploaded ${fileName} to ${storagePath}`);
    
    return {
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      file_size: fileData.length,
      original_filename: fileName
    };
    
  } catch (error) {
    console.error(`❌ Error processing file ${fileName}:`, error.message);
    return null;
  }
}

// Insert member into Supabase
async function insertMemberIntoSupabase(member, fileUploads = {}) {
  try {
    // Prepare member data
    const memberData = {
      wp_post_id: member.wp_post_id,
      wp_user_id: member.wp_user_id,
      first_name: member.first_name,
      last_name: member.last_name,
      display_name: member.display_name,
      email: member.email,
      phone: member.phone,
      birth_date: member.birth_date,
      
      consolidated_professions: member.consolidated_professions,
      company: member.company,
      years_experience: member.years_experience,
      biography: member.biography,
      professional_level: member.professional_level,
      employment_status: member.employment_status,
      salary_range: member.salary_range,
      
      address: member.address,
      postal_code: member.postal_code,
      city: member.city,
      province: member.province,
      autonomous_community: member.autonomous_community,
      country: member.country,
      
      social_media: member.social_media,
      
      education_level: member.education_level,
      studies_completed: member.studies_completed,
      educational_institution: member.educational_institution,
      is_student: member.is_student,
      
      membership_type: member.membership_type,
      is_board_member: member.is_board_member,
      board_position: member.board_position,
      is_active: member.is_active,
      
      accepts_newsletter: member.accepts_newsletter,
      accepts_job_offers: member.accepts_job_offers,
      gdpr_accepted: member.gdpr_accepted,
      privacy_level: member.privacy_level,
      
      personal_situation: member.personal_situation,
      has_children: member.has_children,
      work_life_balance: member.work_life_balance,
      
      other_associations: member.other_associations,
      
      // File URLs
      profile_image_url: fileUploads.profile_image?.public_url || null,
      cv_document_url: fileUploads.resume?.public_url || null,
      
      created_at: member.created_at,
      migrated_at: member.migrated_at
    };
    
    // Insert member
    const { data: insertedMember, error: memberError } = await supabase
      .from('members')
      .insert(memberData)
      .select()
      .single();
    
    if (memberError) {
      console.error(`❌ Error inserting member ${member.email}:`, memberError.message);
      return null;
    }
    
    // Insert file records
    for (const [fileType, fileData] of Object.entries(fileUploads)) {
      if (!fileData) continue;
      
      const { error: fileError } = await supabase
        .from('member_files')
        .insert({
          member_id: insertedMember.id,
          file_type: fileType,
          original_filename: fileData.original_filename,
          storage_path: fileData.storage_path,
          supabase_storage_url: fileData.public_url,
          file_size: fileData.file_size,
          uploaded_at: new Date().toISOString(),
          migrated_from_wordpress: true
        });
      
      if (fileError) {
        console.error(`❌ Error inserting file record:`, fileError.message);
      }
    }
    
    console.log(`✅ Inserted member: ${member.first_name} ${member.last_name} (${member.email})`);
    return insertedMember;
    
  } catch (error) {
    console.error(`❌ Error processing member ${member.email}:`, error.message);
    return null;
  }
}

// Main migration function
async function main() {
  console.log('🚀 Starting WordPress to Supabase migration...');
  console.log('📊 Target Supabase:', process.env.VITE_SUPABASE_URL);
  
  const connection = await getWordPressConnection();
  
  try {
    // Extract member data
    const members = await extractMemberData(connection);
    if (members.length === 0) {
      console.log('❌ No members found in WordPress');
      return;
    }
    
    // Extract file URLs
    const memberFiles = await extractFileUrls(connection, members);
    const fileMap = new Map(memberFiles.map(mf => [mf.member.wp_post_id, mf.files]));
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing member data...');
    await supabase.from('member_files').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each member
    for (const member of members) {
      const files = fileMap.get(member.wp_post_id) || {};
      const fileUploads = {};
      
      // Download and upload files
      for (const [fileType, fileInfo] of Object.entries(files)) {
        const uploadResult = await downloadAndUploadFile(
          fileInfo.url,
          fileInfo.filename,
          member.wp_post_id, // Use wp_post_id as temp member ID
          fileType
        );
        if (uploadResult) {
          fileUploads[fileType] = uploadResult;
        }
      }
      
      // Insert member with files
      const result = await insertMemberIntoSupabase(member, fileUploads);
      if (result) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${successCount} members`);
    console.log(`❌ Errors: ${errorCount} members`);
    
    // Verify migration
    const { data: finalCount } = await supabase
      .from('members')
      .select('count')
      .single();
    
    console.log(`📊 Total members in Supabase: ${finalCount?.count || 'unknown'}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await connection.end();
    console.log('🔌 WordPress connection closed');
  }
}

// Run migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };