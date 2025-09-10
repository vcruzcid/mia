// Cloudflare Pages Function for directiva data by year
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
}): Promise<Response> {
  const { request, params } = context;

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

    // TODO: Replace with Supabase query when real data is available
    // For now, return empty response since mock data was removed
    const response: DirectivaResponse = {
      year,
      members: [],
      positions: [],
      availableYears: [2024, 2025], // Default years
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