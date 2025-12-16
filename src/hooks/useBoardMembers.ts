import { useQuery } from '@tanstack/react-query';
import { getBoardMembers } from '../services/board/board.service';
import type { CurrentBoardMember } from '../types/supabase';

/**
 * Hook to fetch current board members
 */
export function useBoardMembers() {
  return useQuery({
    queryKey: ['board', 'members'],
    queryFn: getBoardMembers,
    staleTime: 10 * 60 * 1000, // 10 minutes (board changes infrequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Helper functions for board member organization
 */

export function getBoardMembersByPeriod(
  members: CurrentBoardMember[]
): Record<string, CurrentBoardMember[]> {
  const byPeriod: Record<string, CurrentBoardMember[]> = {};

  members.forEach(member => {
    const period = formatBoardPeriod(member.board_term_start, member.board_term_end);
    if (period) {
      if (!byPeriod[period]) {
        byPeriod[period] = [];
      }
      byPeriod[period].push(member);
    }
  });

  return byPeriod;
}

export function getAvailablePeriods(members: CurrentBoardMember[]): string[] {
  const periods = new Set<string>();
  
  members.forEach(member => {
    const period = formatBoardPeriod(member.board_term_start, member.board_term_end);
    if (period) {
      periods.add(period);
    }
  });

  return Array.from(periods).sort().reverse(); // Most recent first
}

export function getCurrentBoardMembers(members: CurrentBoardMember[]): CurrentBoardMember[] {
  const now = new Date();
  return members.filter(member => {
    if (!member.board_term_start) return false;
    
    const start = new Date(member.board_term_start);
    const end = member.board_term_end ? new Date(member.board_term_end) : new Date('2099-12-31');
    
    return now >= start && now <= end;
  });
}

export function getBoardMembersForPeriod(
  members: CurrentBoardMember[],
  period: string
): CurrentBoardMember[] {
  return members.filter(member => {
    const memberPeriod = formatBoardPeriod(member.board_term_start, member.board_term_end);
    return memberPeriod === period;
  });
}

/**
 * Helper function to format board period
 */
function formatBoardPeriod(start?: string | null, end?: string | null): string | null {
  const startYear = extractYear(start);
  if (!startYear) return null;

  const endYear = extractYear(end);
  if (!endYear) return `${startYear}-Present`;

  return `${startYear}-${endYear}`;
}

function extractYear(value?: string | null): number | null {
  if (!value) return null;
  if (value === 'Present') return new Date().getFullYear();

  const match = value.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

