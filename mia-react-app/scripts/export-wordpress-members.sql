-- Complete WordPress Members Export Script
-- This script exports all member data from WordPress for migration to Supabase

-- Export basic member posts
SELECT 
    'MEMBERS_POSTS' as export_type,
    p.ID as post_id,
    p.post_title as display_name,
    p.post_content as biography_raw,
    p.post_status,
    p.post_date as created_at
FROM wdfv_posts p 
WHERE p.post_type = 'socias' 
    AND p.post_status = 'publish'
ORDER BY p.ID;

-- Export all member custom fields
SELECT 
    'MEMBERS_META' as export_type,
    pm.post_id,
    pm.meta_key,
    pm.meta_value
FROM wdfv_postmeta pm
INNER JOIN wdfv_posts p ON p.ID = pm.post_id
WHERE p.post_type = 'socias' 
    AND p.post_status = 'publish'
    AND pm.meta_key LIKE 'wpcf-%'
ORDER BY pm.post_id, pm.meta_key;

-- Export WordPress user accounts (for email matching)
SELECT 
    'WP_USERS' as export_type,
    u.ID as user_id,
    u.user_login,
    u.user_email,
    u.display_name,
    u.user_registered
FROM wdfv_users u
WHERE u.user_email != ''
ORDER BY u.ID;

-- Export user metadata (for additional info)
SELECT 
    'USER_META' as export_type,
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
ORDER BY um.user_id, um.meta_key;

-- Export member taxonomies (categories/professions)
SELECT 
    'MEMBER_TAXONOMIES' as export_type,
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
ORDER BY tr.object_id, tt.taxonomy;