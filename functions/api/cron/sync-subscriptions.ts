/**
 * Cloudflare Cron Function: Batch Subscription Reconciliation
 * 
 * Runs every 6 hours to reconcile all member subscriptions with Stripe.
 * This catches any webhook failures or discrepancies.
 * 
 * Configure in wrangler.toml:
 * [triggers]
 * crons = ["0 */6 * * *"]
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface SyncReport {
  timestamp: string;
  total_members: number;
  verified: number;
  discrepancies_found: number;
  discrepancies_fixed: number;
  errors: number;
  error_details: Array<{member_email: string; error: string}>;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { env } = context;

  try {
    // Initialize clients
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20',
    });

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get all members with Stripe customer IDs
    const { data: members, error: fetchError } = await supabase
      .from('members')
      .select('id, email, stripe_customer_id, stripe_subscription_status')
      .not('stripe_customer_id', 'is', null)
      .not('stripe_customer_id', 'eq', '');

    if (fetchError) {
      throw new Error(`Failed to fetch members: ${fetchError.message}`);
    }

    const report: SyncReport = {
      timestamp: new Date().toISOString(),
      total_members: members?.length || 0,
      verified: 0,
      discrepancies_found: 0,
      discrepancies_fixed: 0,
      errors: 0,
      error_details: []
    };

    // Process in batches of 100 to respect rate limits
    const batchSize = 100;
    for (let i = 0; i < (members?.length || 0); i += batchSize) {
      const batch = members!.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(async (member) => {
          try {
            // Get subscription from Stripe
            const subscriptions = await stripe.subscriptions.list({
              customer: member.stripe_customer_id,
              status: 'all',
              limit: 1
            });

            const subscription = subscriptions.data[0];
            const stripeStatus = subscription?.status || 'inactive';
            const dbStatus = member.stripe_subscription_status;

            report.verified++;

            // Check for discrepancy
            if (stripeStatus !== dbStatus) {
              report.discrepancies_found++;
              
              console.log(`Discrepancy found for ${member.email}: DB=${dbStatus}, Stripe=${stripeStatus}`);

              // Log discrepancy
              await supabase.from('subscription_discrepancies').insert({
                member_id: member.id,
                stripe_customer_id: member.stripe_customer_id,
                db_status: dbStatus || 'unknown',
                stripe_status: stripeStatus,
                detected_at: new Date().toISOString()
              });

              // Fix discrepancy
              const { error: updateError } = await supabase
                .from('members')
                .update({
                  stripe_subscription_status: stripeStatus,
                  stripe_subscription_id: subscription?.id,
                  subscription_current_period_end: subscription?.current_period_end
                    ? new Date(subscription.current_period_end * 1000).toISOString()
                    : null,
                  cancel_at_period_end: subscription?.cancel_at_period_end || false,
                  last_verified_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_customer_id', member.stripe_customer_id);

              if (!updateError) {
                report.discrepancies_fixed++;
              }
            } else {
              // No discrepancy, just update last_verified_at
              await supabase
                .from('members')
                .update({ last_verified_at: new Date().toISOString() })
                .eq('stripe_customer_id', member.stripe_customer_id);
            }

          } catch (error) {
            report.errors++;
            report.error_details.push({
              member_email: member.email,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < (members?.length || 0)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Log report to console
    console.log('Subscription Sync Report:', JSON.stringify(report, null, 2));

    // Store report in database (optional - you can create a sync_reports table)
    await supabase.from('sync_reports').insert({
      report_data: report,
      created_at: new Date().toISOString()
    }).catch(err => console.log('Note: sync_reports table not found, report logged to console only'));

    return new Response(
      JSON.stringify({
        success: true,
        report
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Cron job error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

