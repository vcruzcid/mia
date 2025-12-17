// Cloudflare Pages Function for completing member registration after Stripe checkout
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface CompletionRequest {
  stripeSessionId: string;
  stripeCustomerId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  membershipType: string;
  // Additional member data
  mainProfession?: string;
  company?: string;
  yearsExperience?: number;
  autonomousCommunity?: string;
  acceptsNewsletter?: boolean;
}

type CanonicalMembershipType = 'pleno_derecho' | 'estudiante' | 'colaborador';

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: CompletionRequest = await request.json();

    // Initialize Supabase client
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const email = (body.email || '').trim().toLowerCase();
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing email' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const membershipType: CanonicalMembershipType = normalizeMembershipType(body.membershipType);

    // Find member by stripe_customer_id or email
    const byCustomer = await supabase
      .from('member_membership')
      .select('member_id')
      .eq('stripe_customer_id', body.stripeCustomerId)
      .maybeSingle();

    const byEmail = byCustomer.data?.member_id
      ? null
      : await supabase
          .from('member_private')
          .select('member_id')
          .ilike('email', email)
          .maybeSingle();

    let memberId: string | null = byCustomer.data?.member_id || byEmail?.data?.member_id || null;

    if (!memberId) {
      const created = await supabase
        .from('members')
        .insert({ is_active: false })
        .select('id')
        .single();
      if (created.error) throw created.error;
      memberId = created.data.id;

      const profileInsert = await supabase.from('member_profile').insert({
        member_id: memberId,
        first_name: body.firstName || '',
        last_name: body.lastName || '',
        main_profession: body.mainProfession || null,
        company: body.company || null,
        years_experience: body.yearsExperience ?? null,
        autonomous_community: body.autonomousCommunity || null,
        accepts_newsletter: body.acceptsNewsletter ?? false,
        privacy_level: 'public',
        profile_completion: calculateProfileCompletion(body)
      });
      if (profileInsert.error) throw profileInsert.error;

      const privateInsert = await supabase.from('member_private').insert({
        member_id: memberId,
        email,
        phone: body.phone || null
      });
      if (privateInsert.error) throw privateInsert.error;
    } else {
      // Update profile/private with any info provided
      const profileUpdate = await supabase
        .from('member_profile')
        .update({
          first_name: body.firstName || '',
          last_name: body.lastName || '',
          main_profession: body.mainProfession || null,
          company: body.company || null,
          years_experience: body.yearsExperience ?? null,
          autonomous_community: body.autonomousCommunity || null,
          accepts_newsletter: body.acceptsNewsletter ?? false,
          profile_completion: calculateProfileCompletion(body)
        })
        .eq('member_id', memberId);
      if (profileUpdate.error) throw profileUpdate.error;

      const privateUpdate = await supabase
        .from('member_private')
        .update({
          phone: body.phone || null
        })
        .eq('member_id', memberId);
      if (privateUpdate.error) throw privateUpdate.error;
    }

    // Upsert membership info
    const membershipUpsert = await supabase
      .from('member_membership')
      .upsert({
        member_id: memberId,
        membership_type: membershipType,
        stripe_customer_id: body.stripeCustomerId || null,
        last_verified_at: new Date().toISOString()
      }, { onConflict: 'member_id' });
    if (membershipUpsert.error) throw membershipUpsert.error;

    // Log completion activity
    await supabase.from('member_activity').insert({
      member_id: memberId,
      activity_type: 'registration_completed',
      activity_data: {
        stripe_session_id: body.stripeSessionId,
        stripe_customer_id: body.stripeCustomerId,
        completed_via: 'complete-registration'
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Member registration completed successfully',
        memberId,
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error completing registration:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error completing registration',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Calculate profile completion percentage based on required fields
 */
function calculateProfileCompletion(memberData: CompletionRequest): number {
  const requiredFields = [
    'firstName',
    'lastName', 
    'email',
    'phone',
    'mainProfession',
    'autonomousCommunity'
  ];
  
  const completedFields = requiredFields.filter(field => {
    const value = memberData[field as keyof CompletionRequest];
    return value && String(value).trim() !== '';
  });
  
  return Math.round((completedFields.length / requiredFields.length) * 100);
}

function normalizeMembershipType(input: string): CanonicalMembershipType {
  const v = (input || '').trim().toLowerCase();
  if (
    v === 'pleno-derecho' ||
    v === 'pleno_derecho' ||
    v === 'socia-pleno-derecho' ||
    v === 'socia_pleno_derecho' ||
    v === 'socia-de-pleno-derecho' ||
    v === 'socia_de_pleno_derecho' ||
    v === 'profesional'
  ) return 'pleno_derecho';
  if (v === 'estudiante' || v === 'socia-estudiante' || v === 'socia_estudiante') return 'estudiante';
  if (v === 'colaborador' || v === 'colaboradora' || v === 'socio-colaborador' || v === 'socio_colaborador') return 'colaborador';
  return 'colaborador';
}