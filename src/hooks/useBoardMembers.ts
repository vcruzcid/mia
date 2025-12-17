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

  // Sort by numeric start year (most recent first). Supports single-year "2017".
  return Array.from(periods).sort((a, b) => getPeriodStartYear(b) - getPeriodStartYear(a));
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
  const filtered = members.filter(member => {
    const memberPeriod = formatBoardPeriod(member.board_term_start, member.board_term_end);
    return memberPeriod === period;
  });

  // Sort by board position priority (requested order), then by name as stable tiebreaker.
  return filtered.sort((a, b) => {
    const rankDiff = getPositionRank(a.board_position) - getPositionRank(b.board_position);
    if (rankDiff !== 0) return rankDiff;

    const aName = `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim();
    const bName = `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim();
    return aName.localeCompare(bName, 'es', { sensitivity: 'base' });
  });
}

/**
 * Determine the current period label from the current board members.
 * If no "current" members are present (e.g. missing dates), fall back to the most recent period.
 */
export function getCurrentPeriodLabel(members: CurrentBoardMember[]): string | null {
  const currentMembers = getCurrentBoardMembers(members);
  if (currentMembers.length > 0) {
    // Pick the most common period among current members (guards against partial data)
    const counts = new Map<string, number>();
    for (const m of currentMembers) {
      const p = formatBoardPeriod(m.board_term_start, m.board_term_end);
      if (!p) continue;
      counts.set(p, (counts.get(p) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestCount = -1;
    let bestStartYear = -1;
    for (const [p, c] of counts) {
      const startYear = getPeriodStartYear(p);
      // Deterministic tie-breakers:
      // 1) higher count wins
      // 2) if tied, most recent start year wins (e.g. 2025-2027 over 2023-2025)
      // 3) if still tied (shouldn't happen), lexicographic order for stability
      if (
        c > bestCount ||
        (c === bestCount && startYear > bestStartYear) ||
        (c === bestCount && startYear === bestStartYear && best !== null && p > best)
      ) {
        best = p;
        bestCount = c;
        bestStartYear = startYear;
      }
    }
    if (best) return best;
  }

  const periods = getAvailablePeriods(members);
  return periods[0] ?? null;
}

/**
 * Helper function to format board period
 */
function formatBoardPeriod(start?: string | null, end?: string | null): string | null {
  const startYear = extractYear(start);
  if (!startYear) return null;

  // Business rule: periods are 2 years except 2017 (single-year).
  if (startYear === 2017) return '2017';

  // Display period as "election year → next election year" (e.g. 2025-2027).
  // We intentionally don't trust `end` because data has been inconsistent historically.
  return `${startYear}-${startYear + 2}`;
}

function extractYear(value?: string | null): number | null {
  if (!value) return null;
  if (value === 'Present') return new Date().getFullYear();

  const match = value.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function getPeriodStartYear(period: string): number {
  const start = period.includes('-') ? period.split('-')[0] : period;
  const n = Number(start);
  return Number.isFinite(n) ? n : 0;
}

function getPositionRank(position?: string | null): number {
  switch (position) {
    case 'Presidenta':
      return 1;
    case 'Vice-Presidenta':
      return 2;
    case 'Secretaria':
      return 3;
    case 'Tesorera':
      return 4;
    default:
      return 99;
  }
}

