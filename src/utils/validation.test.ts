import { describe, it, expect } from 'vitest';
import { contactFormSchema, membershipFormSchema } from './validation';

// ─── contactFormSchema ────────────────────────────────────────────────────────

describe('contactFormSchema', () => {
  const VALID = {
    name: 'Ana García',
    email: 'ana@example.com',
    subject: 'Consulta sobre membresía',
    message: 'Me gustaría saber más sobre los beneficios de ser socia de MIA.',
  };

  it('accepts valid data', () => {
    expect(contactFormSchema.safeParse(VALID).success).toBe(true);
  });

  it('accepts an optional turnstileToken', () => {
    const result = contactFormSchema.safeParse({ ...VALID, turnstileToken: 'token123' });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    expect(contactFormSchema.safeParse({ ...VALID, name: 'A' }).success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    expect(contactFormSchema.safeParse({ ...VALID, name: 'A'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(contactFormSchema.safeParse({ ...VALID, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects subject shorter than 5 characters', () => {
    expect(contactFormSchema.safeParse({ ...VALID, subject: 'Hi' }).success).toBe(false);
  });

  it('rejects subject longer than 200 characters', () => {
    expect(contactFormSchema.safeParse({ ...VALID, subject: 'A'.repeat(201) }).success).toBe(false);
  });

  it('rejects message shorter than 10 characters', () => {
    expect(contactFormSchema.safeParse({ ...VALID, message: 'Hola' }).success).toBe(false);
  });

  it('rejects message longer than 1000 characters', () => {
    expect(contactFormSchema.safeParse({ ...VALID, message: 'A'.repeat(1001) }).success).toBe(false);
  });
});

// ─── membershipFormSchema ─────────────────────────────────────────────────────

describe('membershipFormSchema', () => {
  const VALID = {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@example.com',
    membershipType: 'pleno-derecho',
    acceptTerms: true,
    acceptNewsletter: false,
  };

  it('accepts valid data', () => {
    expect(membershipFormSchema.safeParse(VALID).success).toBe(true);
  });

  it('rejects when acceptTerms is false', () => {
    expect(membershipFormSchema.safeParse({ ...VALID, acceptTerms: false }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(membershipFormSchema.safeParse({ ...VALID, email: 'invalid' }).success).toBe(false);
  });

  it('rejects firstName shorter than 2 characters', () => {
    expect(membershipFormSchema.safeParse({ ...VALID, firstName: 'A' }).success).toBe(false);
  });

  it('rejects empty membershipType', () => {
    expect(membershipFormSchema.safeParse({ ...VALID, membershipType: '' }).success).toBe(false);
  });

  it('accepts a valid Spanish phone number', () => {
    const result = membershipFormSchema.safeParse({ ...VALID, phone: '666123456' });
    expect(result.success).toBe(true);
  });

  it('accepts missing phone (optional)', () => {
    const { phone: _, ...withoutPhone } = { ...VALID, phone: undefined } as typeof VALID & { phone?: string };
    void _;
    expect(membershipFormSchema.safeParse(withoutPhone).success).toBe(true);
  });

  it('accepts empty phone string', () => {
    expect(membershipFormSchema.safeParse({ ...VALID, phone: '' }).success).toBe(true);
  });
});
