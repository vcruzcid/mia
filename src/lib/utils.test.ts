import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', undefined, null, false, '', 'bar')).toBe('foo bar');
  });

  it('handles conditional object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('resolves tailwind conflicts — last class wins', () => {
    // twMerge keeps the last conflicting utility
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles mixed strings and conditionals', () => {
    const isActive = true;
    expect(cn('base', { active: isActive }, 'extra')).toBe('base active extra');
  });

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('');
  });
});
