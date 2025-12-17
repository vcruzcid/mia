import { describe, expect, it } from 'vitest';
import { getCurrentPeriodLabel } from './useBoardMembers';
import type { CurrentBoardMember } from '../types/supabase';

function m(overrides: Partial<CurrentBoardMember>): CurrentBoardMember {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    email: overrides.email ?? 'x@example.com',
    first_name: overrides.first_name ?? 'A',
    last_name: overrides.last_name ?? 'B',
    address: (overrides as any).address ?? 'x',
    city: (overrides as any).city ?? 'x',
    country: (overrides as any).country ?? 'Spain',
    membership_type: overrides.membership_type ?? 'pleno_derecho',
    stripe_customer_id: (overrides as any).stripe_customer_id ?? 'cus_test',
    board_position: overrides.board_position ?? 'Vocal',
    board_term_start: overrides.board_term_start ?? '2025-01-01',
    board_term_end: overrides.board_term_end ?? null,
    ...overrides,
  } as CurrentBoardMember;
}

describe('getCurrentPeriodLabel', () => {
  it('is deterministic when counts tie (newer start year wins)', () => {
    const a = m({ id: 'a', board_term_start: '2023-01-01', board_term_end: null });
    const b = m({ id: 'b', board_term_start: '2025-01-01', board_term_end: null });

    // Same counts (1 each) but different insertion order; should always pick 2025-2027.
    expect(getCurrentPeriodLabel([a, b])).toBe('2025-2027');
    expect(getCurrentPeriodLabel([b, a])).toBe('2025-2027');
  });
});


