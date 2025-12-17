import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';
import { getMemberByEmail } from '../members/member.service';
import { isActiveMember } from '../members/member.service';
import type { Member } from '../../types/supabase';

/**
 * Send magic link to email (only for existing active members)
 */
export async function sendMagicLink(email: string): Promise<void> {
  // Verify email belongs to an existing member
  const member = await getMemberByEmail(email);
  
  if (!member) {
    throw new Error('Este email no está registrado como socia');
  }

  // Verify member has active subscription
  if (!isActiveMember(member)) {
    throw new Error('Tu membresía no está activa. Por favor, renueva tu suscripción');
  }

  // Send magic link
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      shouldCreateUser: false
    }
  });

  if (error) {
    throw new Error(error.message || 'Error al enviar enlace mágico');
  }
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(tokenHash: string): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email'
  });

  if (error) {
    throw new Error(error.message || 'Error al verificar enlace mágico');
  }

  if (!data.session) {
    throw new Error('Este enlace ha expirado. Por favor, solicita uno nuevo');
  }

  return data.session;
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current member (combines auth user with member data)
 */
export async function getCurrentMember(): Promise<Member | null> {
  const user = await getCurrentUser();
  if (!user?.email) return null;
  return await getMemberByEmail(user.email);
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || 'Error al cerrar sesión');
  }
}

/**
 * Update last login timestamp for member
 */
export async function updateLastLogin(email: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('members')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      console.error('Error updating last login:', error);
    }
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}


