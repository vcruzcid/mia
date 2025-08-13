#!/usr/bin/env node

/**
 * Setup Supabase Storage Bucket
 * Creates the member-files storage bucket if it doesn't exist
 */

import { createClient } from '@supabase/supabase-js';
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

async function setupStorageBucket() {
  console.log('🗂️  Setting up Supabase storage bucket...');
  
  try {
    // 1. Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return false;
    }
    
    console.log('📋 Existing buckets:', buckets.map(b => b.name));
    
    const bucketExists = buckets.some(bucket => bucket.name === 'member-files');
    
    if (bucketExists) {
      console.log('✅ member-files bucket already exists');
    } else {
      console.log('➕ Creating member-files bucket...');
      
      // 2. Create the bucket
      const { data: createData, error: createError } = await supabase.storage.createBucket('member-files', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        return false;
      }
      
      console.log('✅ member-files bucket created successfully');
    }
    
    // 3. Test upload a small file (use allowed MIME type)
    console.log('🧪 Testing bucket access...');
    
    const testContent = Buffer.from('test image data');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('member-files')
      .upload('test/test.jpg', testContent, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      return false;
    }
    
    console.log('✅ Upload test successful');
    
    // 4. Get public URL to verify
    const { data: urlData } = supabase.storage
      .from('member-files')
      .getPublicUrl('test/test.jpg');
    
    console.log('🔗 Test file URL:', urlData.publicUrl);
    
    // 5. Clean up test file
    await supabase.storage.from('member-files').remove(['test/test.jpg']);
    console.log('🧹 Test file cleaned up');
    
    return true;
    
  } catch (error) {
    console.error('💥 Storage setup failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up Supabase storage...');
  const success = await setupStorageBucket();
  
  if (success) {
    console.log('🎉 Storage setup completed successfully!');
  } else {
    console.log('❌ Storage setup failed');
  }
}

main().catch(console.error);