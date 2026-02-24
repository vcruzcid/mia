import { describe, it, expect } from 'vitest';
import { getPositionStyle } from './directivaUtils';

describe('getPositionStyle', () => {
  it('returns a specific gradient for Presidenta', () => {
    expect(getPositionStyle('Presidenta')).toBe('from-red-600 to-red-700');
  });

  it('returns a specific gradient for Vice-Presidenta', () => {
    expect(getPositionStyle('Vice-Presidenta')).toBe('from-red-500 to-red-600');
  });

  it('returns a specific gradient for Secretaria', () => {
    expect(getPositionStyle('Secretaria')).toBe('from-red-700 to-red-800');
  });

  it('returns the default gradient for an unknown position', () => {
    expect(getPositionStyle('Desconocida')).toBe('from-red-500 to-red-600');
  });

  it('returns a non-empty string for every defined position', () => {
    const positions = [
      'Presidenta',
      'Vice-Presidenta',
      'Secretaria',
      'Tesorera',
      'Vocal Formacion',
      'Vocal Comunicacion',
      'Vocal Mianima',
      'Vocal Financiacion',
      'Vocal Socias',
      'Vocal Asociaciones',
      'Vocal Festivales',
      'Vocal',
    ];
    for (const pos of positions) {
      expect(getPositionStyle(pos)).toMatch(/^from-/);
    }
  });
});
