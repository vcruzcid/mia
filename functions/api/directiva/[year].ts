// Cloudflare Pages Function for directiva data by year
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { DirectivaResponse } from '../../../src/types/api';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Main handler
export async function onRequestGet(context: { 
  request: Request;
  params: { year: string };
  env: any;
}): Promise<Response> {
  const { request, params, env } = context;

  // Initialize Supabase client with environment variables
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Parse and validate year parameter
    const yearParam = params.year;
    const year = parseInt(yearParam);

    if (isNaN(year) || year < 2017 || year > new Date().getFullYear() + 1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Año inválido. Debe ser un número entre 2017 y ' + (new Date().getFullYear() + 1),
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // TODO: Implement directiva data structure and query
    // For now, return empty response as directiva data is not yet defined
    console.log(`Directiva data requested for year: ${year} - returning empty response`);
    
    const response: DirectivaResponse = {
      year,
      members: [],
      positions: [],
      availableYears: [2024, 2025], // Default years - will be updated when directiva data is implemented
    };

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Directiva API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error fetching directiva data',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}