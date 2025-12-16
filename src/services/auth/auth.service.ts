import { supabase } from '../supabase.client';
import { getMemberByEmail } from '../members/member.service';
import { isActiveMember } from '../members/member.service';
import type { Member } from '../../types/supabase';

// Sign in with magic link (only for existing active members)
export async function signInWithMagicLink(email: string): Promise<void> {
  // First verify the email belongs to an existing member
  const member = await getMemberByEmail(email);
  
  if (!member) {
    throw new Error('Email address not found. You must be a member to access the portal. Please subscribe to become a member first.');
  }

  // Check if member has active subscription
  const hasAccess = isActiveMember(member);
  
  if (!hasAccess) {
    throw new Error('Your membership subscription is not active. Please renew your subscription to access the portal.');
  }

  // Send magic link only to verified active members
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      shouldCreateUser: false // Prevent creating new auth users
    }
  });

  if (error) throw error;
}

// Sign out
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get current member (combines auth user with member data)
export async function getCurrentMember(): Promise<Member | null> {
  const user = await getCurrentUser();
  if (!user?.email) return null;

  return await getMemberByEmail(user.email);
}

// Update last login timestamp
export async function updateLastLogin(email: string): Promise<void> {
  try {
    await supabase
      .from('members')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

