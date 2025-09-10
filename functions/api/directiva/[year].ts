// Cloudflare Pages Function for directiva data by year
import { getMockDirectivaByYear, AVAILABLE_YEARS } from '../../../src/data/mockMembers';
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

    // Get directiva members for the specified year
    const directivaMembers = getMockDirectivaByYear(year);

    // Create positions array with sorted order
    const positionOrder = [
      'Presidenta',
      'Vicepresidenta', 
      'Secretaria',
      'Tesorera',
      'Vocal de Formación',
      'Vocal de Comunicación',
      'Vocal de Eventos',
      'Vocal de Mentorías'
    ];

    const positions = positionOrder.map(position => {
      const member = directivaMembers.find(m => m.position === position);
      return {
        position,
        member: member!
      };
    }).filter(p => p.member); // Filter out any missing positions

    // Generate response
    const response: DirectivaResponse = {
      year,
      members: directivaMembers,
      positions,
      availableYears: AVAILABLE_YEARS,
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