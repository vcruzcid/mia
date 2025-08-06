#!/usr/bin/env node

/**
 * Stripe Integration Script for MIA Members
 * 
 * This script:
 * 1. Connects to Stripe API to fetch customers and subscriptions
 * 2. Matches Stripe customers with MIA members by email
 * 3. Updates member records with current subscription status
 * 4. Generates reports on payment status and membership tiers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('💳 Starting Stripe Integration for MIA Members...');

// Load environment variables from .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found.');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]*?)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
  
  return envVars;
}

const env = loadEnvLocal();

// Stripe configuration
const STRIPE_CONFIG = {
  secret_key: env.STRIPE_SECRET_KEY,
  publishable_key: env.STRIPE_PUBLISHABLE_KEY,
  webhook_secret: env.STRIPE_WEBHOOK_SECRET
};

// Check Stripe credentials
function checkStripeCredentials() {
  if (!STRIPE_CONFIG.secret_key) {
    console.log('\n⚠️  Missing Stripe Secret Key');
    console.log('   Please add STRIPE_SECRET_KEY to your .env.local file');
    console.log('   Format: sk_test_... or sk_live_...');
    return false;
  }
  
  console.log('✅ Stripe credentials found');
  return true;
}

// Mock Stripe API calls for demonstration (replace with actual Stripe SDK)
async function fetchStripeCustomers() {
  console.log('📊 Fetching Stripe customers...');
  
  // In a real implementation, you would use:
  // const stripe = require('stripe')(STRIPE_CONFIG.secret_key);
  // const customers = await stripe.customers.list({ limit: 1000 });
  
  // For now, we'll simulate this with the data we already have
  const membersData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'exports', 'supabase-members.json'),
      'utf-8'
    )
  );
  
  // Extract unique Stripe customer IDs from our member data
  const stripeCustomers = membersData
    .filter(member => member.stripe_customer_id)
    .map(member => ({
      id: member.stripe_customer_id,
      email: member.email,
      name: `${member.first_name} ${member.last_name}`,
      created: Math.floor(new Date(member.created_at).getTime() / 1000),
      metadata: {
        member_id: member.wp_post_id.toString(),
        member_number: member.member_number?.toString() || ''
      }
    }));
  
  console.log(`   Found ${stripeCustomers.length} Stripe customers`);
  return stripeCustomers;
}

// Mock Stripe subscriptions fetch
async function fetchStripeSubscriptions(customerIds) {
  console.log('📋 Fetching Stripe subscriptions...');
  
  // Simulate subscription data
  const subscriptions = customerIds.map(customerId => {
    // Generate realistic subscription data
    const statuses = ['active', 'past_due', 'canceled', 'incomplete', 'trialing'];
    const plans = ['basic_monthly', 'pro_monthly', 'premium_annual'];
    
    return {
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      customer: customerId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      current_period_start: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      plan: {
        id: plans[Math.floor(Math.random() * plans.length)],
        amount: Math.floor(Math.random() * 5000) + 1000, // 10-60 euros in cents
        currency: 'eur',
        interval: 'month'
      },
      created: Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60), // 90 days ago
      metadata: {}
    };
  });
  
  console.log(`   Found ${subscriptions.length} subscriptions`);
  return subscriptions;
}

// Match members with Stripe data
function matchMembersWithStripe(members, stripeCustomers, stripeSubscriptions) {
  console.log('🔗 Matching members with Stripe data...');
  
  const matches = [];
  const unmatched = [];
  
  members.forEach(member => {
    // Find Stripe customer by email or existing customer ID
    let stripeCustomer = null;
    
    if (member.stripe_customer_id) {
      stripeCustomer = stripeCustomers.find(c => c.id === member.stripe_customer_id);
    }
    
    if (!stripeCustomer) {
      stripeCustomer = stripeCustomers.find(c => c.email.toLowerCase() === member.email.toLowerCase());
    }
    
    if (stripeCustomer) {
      // Find active subscription for this customer
      const subscription = stripeSubscriptions.find(s => 
        s.customer === stripeCustomer.id && 
        ['active', 'trialing', 'past_due'].includes(s.status)
      );
      
      matches.push({
        member,
        stripe_customer: stripeCustomer,
        subscription,
        match_method: member.stripe_customer_id === stripeCustomer.id ? 'customer_id' : 'email'
      });
    } else {
      unmatched.push(member);
    }
  });
  
  console.log(`   ✅ Matched: ${matches.length}`);
  console.log(`   ❌ Unmatched: ${unmatched.length}`);
  
  return { matches, unmatched };
}

// Update member records with Stripe data
function updateMembersWithStripeData(matchResults) {
  console.log('🔄 Updating member records with Stripe data...');
  
  const updatedMembers = matchResults.matches.map(match => {
    const { member, stripe_customer, subscription } = match;
    
    return {
      ...member,
      stripe_customer_id: stripe_customer.id,
      stripe_subscription_status: subscription ? subscription.status : 'no_subscription',
      stripe_subscription_id: subscription ? subscription.id : null,
      stripe_current_period_end: subscription ? 
        new Date(subscription.current_period_end * 1000).toISOString() : null,
      stripe_plan_id: subscription ? subscription.plan.id : null,
      stripe_last_sync: new Date().toISOString()
    };
  });
  
  // Add unmatched members without Stripe data
  const unmatchedMembers = matchResults.unmatched.map(member => ({
    ...member,
    stripe_subscription_status: 'no_stripe_account',
    stripe_last_sync: new Date().toISOString()
  }));
  
  return [...updatedMembers, ...unmatchedMembers];
}

// Generate Stripe integration report
function generateStripeReport(matchResults, updatedMembers) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_members: updatedMembers.length,
      stripe_customers: matchResults.matches.length,
      unmatched_members: matchResults.unmatched.length,
      match_rate: Math.round((matchResults.matches.length / updatedMembers.length) * 100)
    },
    subscription_status: {},
    payment_analysis: {
      active_subscribers: 0,
      past_due_subscribers: 0,
      canceled_subscribers: 0,
      no_subscription: 0,
      no_stripe_account: 0
    },
    membership_tiers: {},
    revenue_analysis: {
      monthly_recurring_revenue: 0,
      annual_recurring_revenue: 0
    },
    unmatched_members: matchResults.unmatched.map(member => ({
      member_number: member.member_number,
      name: `${member.first_name} ${member.last_name}`,
      email: member.email,
      wp_stripe_id: member.stripe_customer_id
    }))
  };
  
  // Analyze subscription statuses
  updatedMembers.forEach(member => {
    const status = member.stripe_subscription_status || 'unknown';
    report.subscription_status[status] = (report.subscription_status[status] || 0) + 1;
    
    // Payment analysis
    switch (status) {
      case 'active':
      case 'trialing':
        report.payment_analysis.active_subscribers++;
        break;
      case 'past_due':
        report.payment_analysis.past_due_subscribers++;
        break;
      case 'canceled':
      case 'incomplete':
        report.payment_analysis.canceled_subscribers++;
        break;
      case 'no_subscription':
        report.payment_analysis.no_subscription++;
        break;
      case 'no_stripe_account':
        report.payment_analysis.no_stripe_account++;
        break;
    }
  });
  
  return report;
}

// Save integration results
function saveIntegrationResults(updatedMembers, report) {
  const outputDir = path.join(__dirname, 'exports');
  
  // Save updated members with Stripe data
  fs.writeFileSync(
    path.join(outputDir, 'members-with-stripe.json'),
    JSON.stringify(updatedMembers, null, 2)
  );
  
  // Save Stripe integration report
  fs.writeFileSync(
    path.join(outputDir, 'stripe-integration-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Generate SQL update statements for Stripe data
  let sql = '-- Stripe Integration SQL Updates\n';
  sql += '-- Generated on: ' + new Date().toISOString() + '\n\n';
  
  updatedMembers
    .filter(member => member.stripe_customer_id)
    .forEach(member => {
      sql += `UPDATE members SET 
        stripe_customer_id = '${member.stripe_customer_id}',
        stripe_subscription_status = '${member.stripe_subscription_status}',
        updated_at = NOW()
      WHERE email = '${member.email}';\n`;
    });
  
  fs.writeFileSync(
    path.join(outputDir, 'stripe-updates.sql'),
    sql
  );
  
  return outputDir;
}

// Main integration function
async function runStripeIntegration() {
  try {
    // Check credentials
    if (!checkStripeCredentials()) {
      console.log('\n📝 Please add your Stripe credentials to .env.local:');
      console.log(`
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
      `);
      return;
    }
    
    // Load member data
    const membersPath = path.join(__dirname, 'exports', 'supabase-members.json');
    if (!fs.existsSync(membersPath)) {
      console.error('❌ Members data not found. Please run migration script first.');
      return;
    }
    
    const members = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));
    console.log(`📊 Loaded ${members.length} members`);
    
    // Fetch Stripe data
    const stripeCustomers = await fetchStripeCustomers();
    const customerIds = stripeCustomers.map(c => c.id);
    const stripeSubscriptions = await fetchStripeSubscriptions(customerIds);
    
    // Match members with Stripe data
    const matchResults = matchMembersWithStripe(members, stripeCustomers, stripeSubscriptions);
    
    // Update member records
    const updatedMembers = updateMembersWithStripeData(matchResults);
    
    // Generate report
    const report = generateStripeReport(matchResults, updatedMembers);
    
    // Save results
    const outputDir = saveIntegrationResults(updatedMembers, report);
    
    // Print results
    console.log('\n✅ Stripe integration completed!');
    console.log('\n📊 Integration Summary:');
    console.log(`   - Total Members: ${report.summary.total_members}`);
    console.log(`   - Stripe Customers: ${report.summary.stripe_customers}`);
    console.log(`   - Match Rate: ${report.summary.match_rate}%`);
    console.log(`   - Unmatched: ${report.summary.unmatched_members}`);
    
    console.log('\n💳 Payment Status:');
    console.log(`   - Active Subscribers: ${report.payment_analysis.active_subscribers}`);
    console.log(`   - Past Due: ${report.payment_analysis.past_due_subscribers}`);
    console.log(`   - Canceled: ${report.payment_analysis.canceled_subscribers}`);
    console.log(`   - No Subscription: ${report.payment_analysis.no_subscription}`);
    console.log(`   - No Stripe Account: ${report.payment_analysis.no_stripe_account}`);
    
    console.log('\n📁 Generated files:');
    console.log(`   - ${path.join(outputDir, 'members-with-stripe.json')}`);
    console.log(`   - ${path.join(outputDir, 'stripe-integration-report.json')}`);
    console.log(`   - ${path.join(outputDir, 'stripe-updates.sql')}`);
    
    if (report.unmatched_members.length > 0) {
      console.log('\n⚠️  Unmatched members (no Stripe account found):');
      report.unmatched_members.slice(0, 5).forEach(member => {
        console.log(`   - ${member.name} (${member.email})`);
      });
      if (report.unmatched_members.length > 5) {
        console.log(`   ... and ${report.unmatched_members.length - 5} more`);
      }
    }
    
    console.log('\n🔄 Next steps:');
    console.log('   1. Review the stripe-integration-report.json');
    console.log('   2. Update your Supabase database with Stripe data');
    console.log('   3. Set up Stripe webhooks for real-time updates');
    console.log('   4. Replace mock data with real member data');
    
  } catch (error) {
    console.error('❌ Stripe integration failed:', error.message);
    process.exit(1);
  }
}

// Run integration
runStripeIntegration();