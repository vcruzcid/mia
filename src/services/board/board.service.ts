import { supabase } from '../supabase.client';
import type { CurrentBoardMember } from '../../types/supabase';

// Get current board members
export async function getBoardMembers(): Promise<CurrentBoardMember[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('is_board_member', true)
      .not('email', 'like', '%admin%')
      .order('board_term_start', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching board members:', error);
    return [];
  }
}

// Get board members for a specific period
export async function getBoardMembersForPeriod(termStart: string, termEnd: string): Promise<CurrentBoardMember[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('is_board_member', true)
      .gte('board_term_start', termStart)
      .lte('board_term_end', termEnd)
      .order('board_position', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching board members for period:', error);
    return [];
  }
}

