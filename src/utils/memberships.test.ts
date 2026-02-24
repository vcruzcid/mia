import { describe, it, expect } from 'vitest';
import { membershipTypes, getMembershipByType } from './memberships';

describe('membershipTypes', () => {
  it('contains exactly 3 membership tiers', () => {
    expect(membershipTypes).toHaveLength(3);
  });

  it.each(membershipTypes)('$name has all required fields', (membership) => {
    expect(membership.id).toBeTruthy();
    expect(membership.name).toBeTruthy();
    expect(membership.description).toBeTruthy();
    expect(typeof membership.price).toBe('number');
    expect(membership.price).toBeGreaterThan(0);
    expect(Array.isArray(membership.benefits)).toBe(true);
    expect(membership.benefits.length).toBeGreaterThan(0);
  });

  it('pleno-derecho costs €60 per year', () => {
    const m = membershipTypes.find(m => m.id === 'pleno-derecho');
    expect(m?.price).toBe(60);
  });

  it('estudiante costs €30 per year', () => {
    const m = membershipTypes.find(m => m.id === 'estudiante');
    expect(m?.price).toBe(30);
  });

  it('all ids are unique', () => {
    const ids = membershipTypes.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getMembershipByType', () => {
  it('returns the membership for a valid id', () => {
    const m = getMembershipByType('pleno-derecho');
    expect(m).toBeDefined();
    expect(m?.id).toBe('pleno-derecho');
  });

  it('returns undefined for an unknown id', () => {
    expect(getMembershipByType('unknown')).toBeUndefined();
  });

  it('finds every membership by its own id', () => {
    for (const membership of membershipTypes) {
      expect(getMembershipByType(membership.id)?.id).toBe(membership.id);
    }
  });
});
