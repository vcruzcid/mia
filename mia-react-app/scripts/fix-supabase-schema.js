#!/usr/bin/env node

/**
 * Fix Supabase Schema and Data Script
 * Updates the schema and migrates data to match new requirements
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

async function fixSupabaseSchema() {
  console.log('🔧 Fixing Supabase schema and data...');
  
  try {
    // 1. Add missing columns
    console.log('➕ Adding missing columns...');
    
    const schemaFixes = [
      // Add city column
      `ALTER TABLE members ADD COLUMN IF NOT EXISTS city TEXT;`,
      
      // Add consolidated_professions column
      `ALTER TABLE members ADD COLUMN IF NOT EXISTS consolidated_professions TEXT[];`,
      
      // Rename existing profession fields if they exist
      `DO $$ 
       BEGIN
         IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'main_profession') THEN
           -- Migrate main_profession and other_professions to consolidated_professions
           UPDATE members 
           SET consolidated_professions = 
             CASE 
               WHEN main_profession IS NOT NULL AND other_professions IS NOT NULL 
               THEN array_append(other_professions, main_profession)
               WHEN main_profession IS NOT NULL 
               THEN ARRAY[main_profession]
               WHEN other_professions IS NOT NULL 
               THEN other_professions
               ELSE NULL
             END
           WHERE consolidated_professions IS NULL;
         END IF;
       END $$;`,
       
      // Add professional_level column (rename from professional_role)
      `ALTER TABLE members ADD COLUMN IF NOT EXISTS professional_level TEXT;`,
      
      // Update professional_level from professional_role if exists
      `DO $$
       BEGIN
         IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'professional_role') THEN
           UPDATE members SET professional_level = professional_role WHERE professional_level IS NULL;
         END IF;
       END $$;`,
    ];
    
    for (const sql of schemaFixes) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log('⚠️ Schema fix query:', sql.substring(0, 50) + '...');
        console.log('⚠️ Result:', error.message);
      }
    }
    
    // 2. Create member_files table if it doesn't exist
    console.log('📁 Creating member_files table...');
    
    const createMemberFilesSQL = `
      CREATE TABLE IF NOT EXISTS member_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        file_type TEXT NOT NULL CHECK (file_type IN ('profile_image', 'resume')),
        original_filename TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        supabase_storage_url TEXT,
        file_size INTEGER,
        mime_type TEXT,
        is_optimized BOOLEAN DEFAULT false,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        migrated_from_wordpress BOOLEAN DEFAULT false,
        wordpress_url TEXT,
        
        UNIQUE(member_id, file_type)
      );
      
      -- Add indexes
      CREATE INDEX IF NOT EXISTS idx_member_files_member_id ON member_files(member_id);
      CREATE INDEX IF NOT EXISTS idx_member_files_type ON member_files(file_type);
      
      -- Enable RLS
      ALTER TABLE member_files ENABLE ROW LEVEL SECURITY;
      
      -- RLS policies
      CREATE POLICY IF NOT EXISTS "Profile images are public" ON member_files
        FOR SELECT 
        USING (
          file_type = 'profile_image' 
          AND EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = member_files.member_id 
            AND members.is_active = true 
            AND members.privacy_level = 'public'
          )
        );
        
      CREATE POLICY IF NOT EXISTS "Members can manage own files" ON member_files
        FOR ALL 
        USING (
          member_id IN (
            SELECT id FROM members 
            WHERE email = auth.jwt()->>'email'
          )
        );
    `;
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createMemberFilesSQL });
    if (tableError) {
      console.log('⚠️ Member files table creation:', tableError.message);
    } else {
      console.log('✅ Member files table ready');
    }
    
    // 3. Fix membership types
    console.log('🔄 Updating membership types...');
    
    const membershipTypeMapping = {
      'admin': 'admin', // Keep admin as is
      'profesional': 'socia-pleno-derecho',
      'member': 'colaborador',
      'estudiante': 'estudiante', // In case it exists
      'colaborador': 'colaborador', // Already correct
      'socia-pleno-derecho': 'socia-pleno-derecho' // Already correct
    };
    
    for (const [oldType, newType] of Object.entries(membershipTypeMapping)) {
      const { error: updateError } = await supabase
        .from('members')
        .update({ membership_type: newType })
        .eq('membership_type', oldType);
      
      if (updateError) {
        console.log(`⚠️ Error updating ${oldType} to ${newType}:`, updateError.message);
      }
    }
    
    // 4. Check updated data
    const { data: updatedMembers, error: fetchError } = await supabase
      .from('members')
      .select('membership_type')
      .limit(1000);
    
    if (!fetchError) {
      const typeCount = {};
      updatedMembers.forEach(m => {
        typeCount[m.membership_type] = (typeCount[m.membership_type] || 0) + 1;
      });
      console.log('✅ Updated membership types:', typeCount);
    }
    
    console.log('🎉 Schema fixes completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    return false;
  }
}

// Alternative approach using direct SQL if RPC doesn't work
async function fixSchemaDirectSQL() {
  console.log('🔧 Applying schema fixes with direct SQL approach...');
  
  // For now, let's just check what we can do with the current setup
  // First, let's see what columns exist
  const { data: columns, error: colError } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'members');
    
  if (colError) {
    console.log('⚠️ Cannot access schema info:', colError.message);
  } else {
    console.log('📋 Current columns:', columns?.map(c => c.column_name) || 'Unable to fetch');
  }
  
  return false;
}

// Run the fix
async function main() {
  console.log('🚀 Starting Supabase schema fixes...');
  
  const success = await fixSupabaseSchema();
  
  if (!success) {
    console.log('⚠️ Primary method failed, trying alternative...');
    await fixSchemaDirectSQL();
  }
  
  console.log('✅ Schema fix process completed');
}

main().catch(console.error);