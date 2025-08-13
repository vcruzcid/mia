#!/usr/bin/env node

/**
 * Extract WordPress Files and Update Supabase
 * Downloads profile images and resumes from WordPress and uploads to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const WORDPRESS_DB_CONFIG = {
  host: '192.168.1.220',
  port: 3306,
  user: 'wordpress',
  password: 'wordpress',
  database: 'wordpress'
};

const WORDPRESS_FILES_PATH = '/Users/vcruzcid/Documents/Code/NAVIC.nosync/mia/mia-wordpress/public_html';

async function extractWordPressFiles() {
  console.log('🔍 Extracting WordPress files and updating Supabase...');
  
  const connection = await mysql.createConnection(WORDPRESS_DB_CONFIG);
  
  try {
    // 1. Get all Supabase members with their WordPress reference
    console.log('📊 Fetching Supabase members...');
    const { data: supabaseMembers, error: membersError } = await supabase
      .from('members')
      .select('id, wp_post_id, first_name, last_name, email, profile_image_url, cv_document_url')
      .not('wp_post_id', 'is', null);
    
    if (membersError) {
      console.error('❌ Error fetching Supabase members:', membersError.message);
      return;
    }
    
    console.log(`📋 Found ${supabaseMembers.length} members with WordPress references`);
    
    // 2. Get WordPress file metadata for these members
    const wpPostIds = supabaseMembers.map(m => m.wp_post_id).filter(Boolean);
    if (wpPostIds.length === 0) {
      console.log('❌ No WordPress post IDs found in Supabase members');
      return;
    }
    
    console.log('📊 Extracting WordPress file metadata...');
    const placeholders = wpPostIds.map(() => '?').join(',');
    
    // Get profile images (featured images)
    const [profileImages] = await connection.execute(`
      SELECT 
        p.ID as post_id,
        pm.meta_value as image_id,
        a.guid as image_url,
        a.post_title as image_title,
        a.post_mime_type as mime_type
      FROM wdfv_posts p
      LEFT JOIN wdfv_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
      LEFT JOIN wdfv_posts a ON pm.meta_value = a.ID
      WHERE p.ID IN (${placeholders})
      AND pm.meta_value IS NOT NULL
      AND a.guid IS NOT NULL
    `, wpPostIds);
    
    // Get custom file metadata (CVs, etc.)
    const [customFiles] = await connection.execute(`
      SELECT 
        post_id,
        meta_key,
        meta_value
      FROM wdfv_postmeta
      WHERE post_id IN (${placeholders})
      AND (
        meta_key LIKE '%cv%' OR 
        meta_key LIKE '%curriculum%' OR
        meta_key LIKE '%resume%' OR
        meta_key LIKE '%documento%' OR
        meta_key LIKE '%archivo%'
      )
      AND meta_value IS NOT NULL
      AND meta_value != ''
    `, wpPostIds);
    
    console.log(`🖼️  Found ${profileImages.length} profile images`);
    console.log(`📄 Found ${customFiles.length} custom file references`);
    
    // 3. Create file mapping
    const fileMap = new Map();
    
    // Add profile images
    profileImages.forEach(img => {
      if (!fileMap.has(img.post_id)) {
        fileMap.set(img.post_id, {});
      }
      fileMap.get(img.post_id).profile_image = {
        url: img.image_url,
        filename: img.image_title || 'profile-image.jpg',
        mime_type: img.mime_type || 'image/jpeg'
      };
    });
    
    // Add custom files (CVs)
    customFiles.forEach(file => {
      if (!fileMap.has(file.post_id)) {
        fileMap.set(file.post_id, {});
      }
      
      if (file.meta_value.includes('http') || file.meta_value.includes('.pdf') || file.meta_value.includes('.doc')) {
        fileMap.get(file.post_id).resume = {
          url: file.meta_value.startsWith('http') ? file.meta_value : `http://192.168.1.220:8088/${file.meta_value}`,
          filename: path.basename(file.meta_value) || 'curriculum.pdf',
          mime_type: file.meta_value.includes('.pdf') ? 'application/pdf' : 'application/msword'
        };
      }
    });
    
    console.log(`📁 Created file mapping for ${fileMap.size} members`);
    
    // 4. Process each member
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const member of supabaseMembers) {
      if (!member.wp_post_id) continue;
      
      const files = fileMap.get(parseInt(member.wp_post_id));
      if (!files) continue;
      
      processedCount++;
      console.log(`\n👤 Processing: ${member.first_name} ${member.last_name} (${processedCount}/${fileMap.size})`);
      
      const updates = {};
      let memberSuccess = true;
      
      // Process profile image
      if (files.profile_image && !member.profile_image_url) {
        const imageResult = await downloadAndUploadFile(
          files.profile_image,
          member.id,
          'profile_image'
        );
        if (imageResult) {
          updates.profile_image_url = imageResult.public_url;
          console.log(`  ✅ Profile image uploaded`);
        } else {
          console.log(`  ❌ Profile image failed`);
          memberSuccess = false;
        }
      }
      
      // Process resume
      if (files.resume && !member.cv_document_url) {
        const resumeResult = await downloadAndUploadFile(
          files.resume,
          member.id,
          'resume'
        );
        if (resumeResult) {
          updates.cv_document_url = resumeResult.public_url;
          console.log(`  ✅ Resume uploaded`);
        } else {
          console.log(`  ❌ Resume failed`);
          memberSuccess = false;
        }
      }
      
      // Update member record if we have new files
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('members')
          .update(updates)
          .eq('id', member.id);
        
        if (updateError) {
          console.log(`  ❌ Database update failed:`, updateError.message);
          memberSuccess = false;
        } else {
          console.log(`  ✅ Member updated with ${Object.keys(updates).length} files`);
        }
      }
      
      if (memberSuccess) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Add a small delay to avoid overwhelming the servers
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n🎉 File extraction completed!');
    console.log(`✅ Successfully processed: ${successCount} members`);
    console.log(`❌ Errors: ${errorCount} members`);
    console.log(`📊 Total processed: ${processedCount} members`);
    
  } catch (error) {
    console.error('💥 File extraction failed:', error.message);
  } finally {
    await connection.end();
  }
}

async function downloadAndUploadFile(fileInfo, memberId, fileType) {
  try {
    const fileUrl = fileInfo.url;
    const fileName = fileInfo.filename;
    
    console.log(`    📥 Processing: ${fileName}`);
    
    // Parse the file URL and create correct local path
    let filePath;
    if (fileUrl.includes('192.168.1.220:8088')) {
      // Full URL - extract the wp-content path
      const urlParts = fileUrl.split('192.168.1.220:8088/');
      if (urlParts.length > 1) {
        filePath = path.join(WORDPRESS_FILES_PATH, urlParts[1]);
      } else {
        console.log(`    ❌ Cannot parse URL: ${fileUrl}`);
        return null;
      }
    } else if (fileUrl.includes('wp-content')) {
      // Relative URL starting with wp-content
      if (fileUrl.startsWith('/')) {
        filePath = path.join(WORDPRESS_FILES_PATH, fileUrl.substring(1));
      } else {
        filePath = path.join(WORDPRESS_FILES_PATH, fileUrl);
      }
    } else if (fileUrl.startsWith('http')) {
      // External URL - skip for now
      console.log(`    ⚠️  External URL, skipping: ${fileUrl}`);
      return null;
    } else {
      // Relative path
      filePath = path.join(WORDPRESS_FILES_PATH, fileUrl);
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      console.log(`    ❌ File not found`);
      return null;
    }
    
    // Read file
    const fileData = await fs.readFile(filePath);
    console.log(`    📊 File size: ${Math.round(fileData.length / 1024)}KB`);
    
    // Generate storage path
    const fileExt = path.extname(fileName) || (fileType === 'profile_image' ? '.jpg' : '.pdf');
    const timestamp = Date.now();
    const storagePath = `${fileType}s/${memberId}/${timestamp}${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('member-files')
      .upload(storagePath, fileData, {
        cacheControl: '3600',
        upsert: true,
        contentType: fileType === 'profile_image' ? 'image/jpeg' : fileInfo.mime_type || 'application/pdf'
      });
    
    if (uploadError) {
      console.log(`    ❌ Upload failed:`, uploadError.message);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('member-files')
      .getPublicUrl(storagePath);
    
    console.log(`    ✅ Uploaded to: ${storagePath}`);
    
    return {
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      file_size: fileData.length,
      original_filename: fileName
    };
    
  } catch (error) {
    console.log(`    ❌ Error:`, error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting WordPress file extraction...');
  await extractWordPressFiles();
}

main().catch(console.error);