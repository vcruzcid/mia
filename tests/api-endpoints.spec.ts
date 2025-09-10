import { test, expect } from '@playwright/test';

const BASE_URL = 'https://dev.animacionesmia.com';

test.describe('API Endpoints Testing', () => {
  test('Members API should return data from Supabase', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Check response structure
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('members');
    expect(data.data).toHaveProperty('total');
    expect(data.data).toHaveProperty('limit');
    expect(data.data).toHaveProperty('offset');
    expect(data.data).toHaveProperty('filters');
    
    // Check filters structure
    expect(data.data.filters).toHaveProperty('availableLocations');
    expect(data.data.filters).toHaveProperty('availableSpecializations');
    expect(data.data.filters).toHaveProperty('memberTypeCounts');
    
    // Log the response for debugging
    console.log('Members API Response:', JSON.stringify(data, null, 2));
    
    // If there are members, check their structure
    if (data.data.members.length > 0) {
      const member = data.data.members[0];
      console.log('Sample member:', JSON.stringify(member, null, 2));
      
      // Check that member has expected fields from Supabase
      expect(member).toHaveProperty('id');
      expect(member).toHaveProperty('first_name');
      expect(member).toHaveProperty('last_name');
      expect(member).toHaveProperty('email');
    }
  });

  test('Members API should support pagination', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members?limit=5&offset=0`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    expect(data.data.limit).toBe(5);
    expect(data.data.offset).toBe(0);
    expect(data.data.members.length).toBeLessThanOrEqual(5);
    
    console.log('Pagination test - Total members:', data.data.total);
    console.log('Pagination test - Returned members:', data.data.members.length);
  });

  test('Directiva API should return empty data structure', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/directiva/2025`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Check response structure
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('year', 2025);
    expect(data.data).toHaveProperty('members');
    expect(data.data).toHaveProperty('positions');
    expect(data.data).toHaveProperty('availableYears');
    
    // Should return empty arrays as requested
    expect(Array.isArray(data.data.members)).toBe(true);
    expect(Array.isArray(data.data.positions)).toBe(true);
    expect(Array.isArray(data.data.availableYears)).toBe(true);
    
    console.log('Directiva API Response:', JSON.stringify(data, null, 2));
  });

  test('Directiva API should handle different years', async ({ request }) => {
    const years = [2024, 2025, 2023];
    
    for (const year of years) {
      const response = await request.get(`${BASE_URL}/api/directiva/${year}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.data.year).toBe(year);
      
      console.log(`Directiva API for year ${year}:`, JSON.stringify(data, null, 2));
    }
  });

  test('API endpoints should handle CORS preflight requests', async ({ request }) => {
    const endpoints = ['/api/members', '/api/directiva/2025'];
    
    for (const endpoint of endpoints) {
      const response = await request.options(`${BASE_URL}${endpoint}`);
      
      expect(response.status()).toBe(200);
      expect(response.headers()['access-control-allow-origin']).toBe('*');
      expect(response.headers()['access-control-allow-methods']).toContain('GET');
    }
  });

  test('API endpoints should return proper error for invalid requests', async ({ request }) => {
    // Test invalid year for directiva
    const response = await request.get(`${BASE_URL}/api/directiva/invalid`);
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
    
    console.log('Error response:', JSON.stringify(data, null, 2));
  });
});

test.describe('Database Data Validation', () => {
  test('Should have consistent data structure from Supabase', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members`);
    const data = await response.json();
    
    if (data.data.members.length > 0) {
      // Check that all members have consistent structure
      data.data.members.forEach((member: any, index: number) => {
        console.log(`Member ${index + 1}:`, {
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          profession: member.main_profession,
          country: member.country,
          province: member.province
        });
        
        // Validate required fields
        expect(member.id).toBeDefined();
        expect(member.first_name).toBeDefined();
        expect(member.last_name).toBeDefined();
        expect(member.email).toBeDefined();
      });
    } else {
      console.log('No members found in database - this is expected if database is empty');
    }
  });

  test('Should have valid filter metadata', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members`);
    const data = await response.json();
    
    const filters = data.data.filters;
    
    // Check that filter arrays are valid
    expect(Array.isArray(filters.availableLocations)).toBe(true);
    expect(Array.isArray(filters.availableSpecializations)).toBe(true);
    expect(typeof filters.memberTypeCounts).toBe('object');
    
    console.log('Available locations:', filters.availableLocations);
    console.log('Available specializations:', filters.availableSpecializations);
    console.log('Member type counts:', filters.memberTypeCounts);
  });
});
