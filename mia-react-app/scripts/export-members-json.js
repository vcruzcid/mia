#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to execute SQL and get JSON results
function executeSQLQuery(query) {
  const command = `docker-compose exec -T db mysql -u wordpress -pwordpress -e "${query}" wordpress --batch --raw`;
  try {
    const result = execSync(command, { 
      cwd: '/Users/vcruzcid/Documents/Code/gitLab.Repo.nosync/mia-wordpress',
      encoding: 'utf-8' 
    });
    const lines = result.trim().split('\n');
    const headers = lines[0].split('\t');
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] === 'NULL' ? null : values[index];
      });
      return obj;
    });
  } catch (error) {
    console.error('SQL Error:', error.message);
    return [];
  }
}

console.log('🚀 Starting WordPress Members Export...');

// 1. Export member posts
console.log('📋 Exporting member posts...');
const memberPosts = executeSQLQuery(`
  SELECT 
    p.ID as post_id,
    p.post_title as display_name,
    p.post_content as biography_raw,
    p.post_status,
    p.post_date as created_at
  FROM wdfv_posts p 
  WHERE p.post_type = 'socias' 
    AND p.post_status = 'publish'
  ORDER BY p.ID
`);

// 2. Export all member custom fields
console.log('🔧 Exporting member custom fields...');
const memberMeta = executeSQLQuery(`
  SELECT 
    pm.post_id,
    pm.meta_key,
    pm.meta_value
  FROM wdfv_postmeta pm
  INNER JOIN wdfv_posts p ON p.ID = pm.post_id
  WHERE p.post_type = 'socias' 
    AND p.post_status = 'publish'
    AND pm.meta_key LIKE 'wpcf-%'
  ORDER BY pm.post_id, pm.meta_key
`);

// 3. Export WordPress users
console.log('👤 Exporting WordPress users...');
const wpUsers = executeSQLQuery(`
  SELECT 
    u.ID as user_id,
    u.user_login,
    u.user_email,
    u.display_name,
    u.user_registered
  FROM wdfv_users u
  WHERE u.user_email != ''
  ORDER BY u.ID
`);

// 4. Export user metadata
console.log('📊 Exporting user metadata...');
const userMeta = executeSQLQuery(`
  SELECT 
    um.user_id,
    um.meta_key,
    um.meta_value
  FROM wdfv_usermeta um
  INNER JOIN wdfv_users u ON u.ID = um.user_id
  WHERE um.meta_key IN (
    'first_name', 'last_name', 'billing_first_name', 'billing_last_name',
    'billing_email', 'billing_phone', 'billing_company',
    'facebook', 'twitter', 'instagram', 'linkedin',
    '_stripe_customer_id', '_live_stripe_customer_id', '_test_stripe_customer_id'
  )
    AND u.user_email != ''
  ORDER BY um.user_id, um.meta_key
`);

// 5. Export taxonomies
console.log('🏷️ Exporting member taxonomies...');
const memberTaxonomies = executeSQLQuery(`
  SELECT 
    tr.object_id as post_id,
    tt.taxonomy,
    t.name as term_name,
    t.slug as term_slug
  FROM wdfv_term_relationships tr
  INNER JOIN wdfv_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
  INNER JOIN wdfv_terms t ON tt.term_id = t.term_id
  INNER JOIN wdfv_posts p ON tr.object_id = p.ID
  WHERE p.post_type = 'socias' 
    AND p.post_status = 'publish'
    AND tt.taxonomy IN ('profesion-principal', 'otra-profesion', 'tipos-de-socias', 'socia-directiva', 'pais-socia')
  ORDER BY tr.object_id, tt.taxonomy
`);

// Transform data into structured format
console.log('🔄 Transforming data...');

// Group member meta by post_id
const memberMetaByPost = {};
memberMeta.forEach(meta => {
  if (!meta || !meta.meta_key || !meta.post_id) return; // Skip invalid entries
  
  if (!memberMetaByPost[meta.post_id]) {
    memberMetaByPost[meta.post_id] = {};
  }
  // Remove 'wpcf-' prefix for cleaner field names
  const fieldName = meta.meta_key.replace('wpcf-', '');
  memberMetaByPost[meta.post_id][fieldName] = meta.meta_value;
});

// Group user meta by user_id
const userMetaByUser = {};
userMeta.forEach(meta => {
  if (!userMetaByUser[meta.user_id]) {
    userMetaByUser[meta.user_id] = {};
  }
  userMetaByUser[meta.user_id][meta.meta_key] = meta.meta_value;
});

// Group taxonomies by post_id
const taxonomiesByPost = {};
memberTaxonomies.forEach(tax => {
  if (!taxonomiesByPost[tax.post_id]) {
    taxonomiesByPost[tax.post_id] = {};
  }
  if (!taxonomiesByPost[tax.post_id][tax.taxonomy]) {
    taxonomiesByPost[tax.post_id][tax.taxonomy] = [];
  }
  taxonomiesByPost[tax.post_id][tax.taxonomy].push({
    name: tax.term_name,
    slug: tax.term_slug
  });
});

// Combine all data
const completeMembers = memberPosts.map(post => {
  const postId = post.post_id;
  const meta = memberMetaByPost[postId] || {};
  const taxonomies = taxonomiesByPost[postId] || {};
  
  // Find matching WordPress user by email
  const memberEmail = meta['email-socia'];
  const matchingUser = wpUsers.find(user => user.user_email === memberEmail);
  const userMetaData = matchingUser ? userMetaByUser[matchingUser.user_id] || {} : {};
  
  return {
    ...post,
    wordpress_user_id: matchingUser?.user_id || null,
    custom_fields: meta,
    taxonomies,
    user_metadata: userMetaData
  };
});

// Save the structured data
const exportsDir = '/Users/vcruzcid/Documents/Code/gitLab.Repo.nosync/mia/mia-react-app/scripts/exports';
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

const exportData = {
  export_timestamp: new Date().toISOString(),
  total_members: completeMembers.length,
  total_wp_users: wpUsers.length,
  members: completeMembers,
  wp_users: wpUsers,
  raw_data: {
    member_posts: memberPosts,
    member_meta: memberMeta,
    user_meta: userMeta,
    taxonomies: memberTaxonomies
  }
};

fs.writeFileSync(
  path.join(exportsDir, 'wordpress-members-complete.json'),
  JSON.stringify(exportData, null, 2)
);

console.log('✅ Export completed!');
console.log(`📊 Statistics:`);
console.log(`   - Total Members: ${completeMembers.length}`);
console.log(`   - WordPress Users: ${wpUsers.length}`);
console.log(`   - Members with WP accounts: ${completeMembers.filter(m => m.wordpress_user_id).length}`);
console.log(`   - Exported to: ${path.join(exportsDir, 'wordpress-members-complete.json')}`);

// Save a sample for inspection
fs.writeFileSync(
  path.join(exportsDir, 'members-sample.json'),
  JSON.stringify(completeMembers.slice(0, 5), null, 2)
);

console.log(`📋 Sample saved to: ${path.join(exportsDir, 'members-sample.json')}`);