// Simple health check endpoint
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestGet(): Promise<Response> {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'operational',
      database: 'operational',
      turnstile: 'operational',
    },
  };

  return new Response(
    JSON.stringify({ success: true, data: healthData }),
    { status: 200, headers: corsHeaders }
  );
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 200, headers: corsHeaders });
}