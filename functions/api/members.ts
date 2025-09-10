// Cloudflare Pages Function for member data
import { createClient } from '@supabase/supabase-js';
import type { MembersRequest, MembersResponse } from '../../src/types/api';
import type { Member } from '../../src/types';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Helper function to normalize strings for searching
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim();
}

// Filter members based on search parameters
function filterMembers(members: Member[], params: MembersRequest): Member[] {
  let filtered = [...members];

  // Search filter
  if (params.search) {
    const searchTerm = normalizeString(params.search);
    filtered = filtered.filter(member => {
      const fullName = normalizeString(`${member.firstName} ${member.lastName}`);
      const company = normalizeString(member.company || '');
      const location = normalizeString(`${member.location.city} ${member.location.region}`);
      const specializations = member.specializations.map(s => normalizeString(s)).join(' ');
      
      return (
        fullName.includes(searchTerm) ||
        company.includes(searchTerm) ||
        location.includes(searchTerm) ||
        specializations.includes(searchTerm)
      );
    });
  }

  // Member type filter
  if (params.memberTypes?.length) {
    filtered = filtered.filter(member => 
      params.memberTypes!.includes(member.memberType)
    );
  }

  // Specializations filter
  if (params.specializations?.length) {
    filtered = filtered.filter(member =>
      params.specializations!.some(spec =>
        member.specializations.includes(spec)
      )
    );
  }

  // Location filter
  if (params.locations?.length) {
    filtered = filtered.filter(member =>
      params.locations!.some(location =>
        member.location.city === location ||
        member.location.region === location
      )
    );
  }

  // Availability status filter
  if (params.availabilityStatus?.length) {
    filtered = filtered.filter(member =>
      params.availabilityStatus!.includes(member.availabilityStatus)
    );
  }

  // Social media filter
  if (params.hasSocialMedia !== undefined) {
    filtered = filtered.filter(member => {
      const hasSocial = Object.keys(member.socialMedia).length > 0;
      return params.hasSocialMedia === hasSocial;
    });
  }

  // Active status filter
  if (params.isActive !== undefined) {
    filtered = filtered.filter(member => member.isActive === params.isActive);
  }

  return filtered;
}

// Generate filter metadata from Supabase data
function generateFilterMetadata(members: any[]): MembersResponse['filters'] {
  const locations = new Set<string>();
  const specializations = new Set<string>();
  const memberTypeCounts: Record<string, number> = {
    'Full': 0,
    'Student': 0,
    'Collaborator': 0,
  };

  members.forEach(member => {
    // Collect locations (using country and province from Supabase)
    if (member.country) locations.add(member.country);
    if (member.province) locations.add(member.province);

    // Collect specializations (main_profession and other_professions)
    if (member.main_profession) specializations.add(member.main_profession);
    if (member.other_professions && Array.isArray(member.other_professions)) {
      member.other_professions.forEach((prof: string) => specializations.add(prof));
    }

    // Note: memberTypeCounts would need to be calculated from actual membership_type data
    // For now, we'll leave it as zeros since we don't have that data structure yet
  });

  return {
    availableLocations: Array.from(locations).sort(),
    availableSpecializations: Array.from(specializations).sort(),
    memberTypeCounts,
  };
}

// Main handler
export async function onRequestGet(context: { request: Request; env: any }): Promise<Response> {
  const { request, env } = context;

  // Initialize Supabase client with environment variables
  const supabase = createClient(
    env.VITE_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const params: MembersRequest = {
      search: url.searchParams.get('search') || undefined,
      memberTypes: url.searchParams.get('memberTypes')?.split(',').filter(Boolean) || undefined,
      specializations: url.searchParams.get('specializations')?.split(',').filter(Boolean) || undefined,
      locations: url.searchParams.get('locations')?.split(',').filter(Boolean) || undefined,
      availabilityStatus: url.searchParams.get('availabilityStatus')?.split(',').filter(Boolean) || undefined,
      hasSocialMedia: url.searchParams.get('hasSocialMedia') === 'true' ? true : 
                     url.searchParams.get('hasSocialMedia') === 'false' ? false : undefined,
      isActive: url.searchParams.get('isActive') === 'true' ? true : 
               url.searchParams.get('isActive') === 'false' ? false : undefined,
      limit: parseInt(url.searchParams.get('limit') || '50'),
      offset: parseInt(url.searchParams.get('offset') || '0'),
    };

    // Query members from Supabase using the public_members view
    const { data: members, error: membersError } = await supabase
      .from('public_members')
      .select('*')
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error fetching members data',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('public_members')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching members count:', countError);
    }

    // Get filter metadata from all public members
    const { data: allMembers, error: filterError } = await supabase
      .from('public_members')
      .select('main_profession, other_professions, country, province');

    if (filterError) {
      console.error('Error fetching filter data:', filterError);
    }

    // Generate filter metadata
    const filters = generateFilterMetadata(allMembers || []);

    const response: MembersResponse = {
      members: members || [],
      total: totalCount || 0,
      limit,
      offset,
      filters,
    };

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Members API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error fetching members data',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}