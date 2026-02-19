/**
 * Smoke tests — verify the test environment is wired up correctly.
 * Real component tests live alongside their components as *.test.tsx files.
 */

import { describe, it, expect } from 'vitest';

describe('test environment', () => {
  it('runs', () => {
    expect(true).toBe(true);
  });

  it('has jsdom globals', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
