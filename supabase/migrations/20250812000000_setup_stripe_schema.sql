-- Setup Stripe Schema Migration
-- This migration sets up the Stripe Foreign Data Wrapper and removes manual Stripe tables

-- Enable wrappers extension for Foreign Data Wrapper
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;

-- Create dedicated stripe schema for all Stripe foreign tables
CREATE SCHEMA IF NOT EXISTS stripe;

-- Create the Stripe foreign data wrapper
CREATE FOREIGN DATA WRAPPER stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;

-- Create server connection to Stripe API
-- Note: Set STRIPE_SECRET_KEY in your Supabase project settings
CREATE SERVER stripe_server
  FOREIGN DATA WRAPPER stripe_wrapper
  OPTIONS (
    api_key_name 'STRIPE_SECRET_KEY',
    api_version '2024-11-20'
  );

-- Import all Stripe foreign tables into the stripe schema
-- This creates: customers, subscriptions, checkout_sessions, payment_intents, etc.
IMPORT FOREIGN SCHEMA stripe FROM SERVER stripe_server INTO stripe;

-- Remove the old manual Stripe tables from public schema
DROP TABLE IF EXISTS stripe_subscriptions;
DROP TABLE IF EXISTS stripe_customers;

-- Remove Stripe-related columns from members table that are now redundant
-- Keep stripe_customer_id as the link to stripe.customers
ALTER TABLE members DROP COLUMN IF EXISTS stripe_subscription_status;

-- Create a view for easy member-stripe data joins
CREATE OR REPLACE VIEW member_stripe_data AS
SELECT 
  m.id,
  m.first_name,
  m.last_name,
  m.email,
  m.membership_type,
  m.stripe_customer_id,
  sc.name as stripe_name,
  sc.email as stripe_email,
  sc.created as stripe_customer_created,
  ss.status as subscription_status,
  ss.current_period_start,
  ss.current_period_end,
  ss.id as subscription_id
FROM members m
LEFT JOIN stripe.customers sc ON m.stripe_customer_id = sc.id
LEFT JOIN stripe.subscriptions ss ON sc.id = ss.customer
WHERE m.is_active = true;

-- Function to complete member registration after Stripe checkout
CREATE OR REPLACE FUNCTION complete_member_registration(
  stripe_session_id TEXT,
  additional_data JSONB
)
RETURNS UUID AS $$
DECLARE
  member_id UUID;
  customer_email TEXT;
  customer_id TEXT;
BEGIN
  -- Get customer info from Stripe checkout session via FDW
  -- Note: This would require a function to query Stripe API or manual input
  -- For now, we'll assume the email and customer_id are provided in additional_data
  
  customer_email := additional_data->>'email';
  customer_id := additional_data->>'stripe_customer_id';
  
  -- Check if member already exists
  SELECT id INTO member_id FROM members WHERE email = customer_email;
  
  IF member_id IS NULL THEN
    -- Create new member
    INSERT INTO members (
      first_name,
      last_name,
      email,
      phone,
      membership_type,
      accepts_newsletter,
      gdpr_accepted,
      stripe_customer_id,
      is_active,
      -- Add other fields from additional_data
      main_profession,
      company,
      years_experience,
      autonomous_community
    ) VALUES (
      additional_data->>'first_name',
      additional_data->>'last_name',
      customer_email,
      additional_data->>'phone',
      additional_data->>'membership_type',
      (additional_data->>'accepts_newsletter')::boolean,
      true,
      customer_id,
      true,
      additional_data->>'main_profession',
      additional_data->>'company',
      (additional_data->>'years_experience')::integer,
      additional_data->>'autonomous_community'
    ) RETURNING id INTO member_id;
    
    -- Log registration activity
    INSERT INTO member_activity (member_id, activity_type, activity_data)
    VALUES (member_id, 'registration_completed', additional_data);
    
  ELSE
    -- Update existing member with Stripe customer ID and additional data
    UPDATE members 
    SET 
      stripe_customer_id = customer_id,
      phone = COALESCE(additional_data->>'phone', phone),
      main_profession = COALESCE(additional_data->>'main_profession', main_profession),
      company = COALESCE(additional_data->>'company', company),
      years_experience = COALESCE((additional_data->>'years_experience')::integer, years_experience),
      autonomous_community = COALESCE(additional_data->>'autonomous_community', autonomous_community)
    WHERE id = member_id;
    
    -- Log update activity
    INSERT INTO member_activity (member_id, activity_type, activity_data)
    VALUES (member_id, 'profile_completed', additional_data);
  END IF;
  
  RETURN member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;