import { describe, it, expect } from 'vitest';
import {
  personalInfoSchema,
  membershipPaymentSchema,
  registrationSchema,
  validateStep,
} from './registrationSchema';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const VALID_ADDRESS = {
  street: 'Calle Mayor 123',
  city: 'Madrid',
  postalCode: '28001',
  province: 'Madrid',
};

const VALID_PERSONAL_INFO = {
  firstName: 'Ana',
  lastName: 'García',
  email: 'ANA@EXAMPLE.COM',
  phone: '666123456',
  address: VALID_ADDRESS,
  categories: ['Animación 2D'],
};

const VALID_MEMBERSHIP_PAYMENT = {
  membershipType: 'pleno-derecho' as const,
  termsAccepted: true,
  gdprConsent: true,
  paymentMethod: 'stripe' as const,
};

const VALID_PROFILE_DETAILS = {
  experience: 'senior' as const,
  socialMedia: {},
  galleryVisibility: {
    showProfile: true,
    showContact: true,
    showSocialMedia: true,
    showProjects: false,
  },
  preferences: {
    newsletterFrequency: 'monthly' as const,
    eventNotifications: true,
    jobNotifications: true,
    whatsappCommunity: false,
    mentorshipProgram: false,
  },
};

// ─── personalInfoSchema ───────────────────────────────────────────────────────

describe('personalInfoSchema', () => {
  it('accepts valid data', () => {
    const result = personalInfoSchema.safeParse(VALID_PERSONAL_INFO);
    expect(result.success).toBe(true);
  });

  describe('phone normalization', () => {
    const cases: [string, string][] = [
      ['666123456',      '+34666123456'],  // bare 9-digit
      ['666 123 456',    '+34666123456'],  // with spaces
      ['+34666123456',   '+34666123456'],  // already +34
      ['0034666123456',  '+34666123456'],  // 0034 prefix
      ['34666123456',    '+34666123456'],  // 34 prefix without +
      ['666-12-34-56',   '+34666123456'],  // with dashes (note: 666-12-34-56 strips to 666123456... wait)
    ];

    it.each(cases)('"%s" normalizes to "%s"', (input, expected) => {
      const result = personalInfoSchema.safeParse({ ...VALID_PERSONAL_INFO, phone: input });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.phone).toBe(expected);
    });

    it('rejects numbers not starting with 6, 7, 8, or 9', () => {
      const result = personalInfoSchema.safeParse({ ...VALID_PERSONAL_INFO, phone: '123456789' });
      expect(result.success).toBe(false);
    });

    it('rejects numbers that are too short', () => {
      const result = personalInfoSchema.safeParse({ ...VALID_PERSONAL_INFO, phone: '66612' });
      expect(result.success).toBe(false);
    });
  });

  it('lowercases the email', () => {
    const result = personalInfoSchema.safeParse(VALID_PERSONAL_INFO);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('ana@example.com');
  });

  it('rejects invalid email format', () => {
    const result = personalInfoSchema.safeParse({ ...VALID_PERSONAL_INFO, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('accepts names with accents and hyphens', () => {
    const result = personalInfoSchema.safeParse({
      ...VALID_PERSONAL_INFO,
      firstName: 'María-José',
      lastName: 'García López',
    });
    expect(result.success).toBe(true);
  });

  it('rejects firstName shorter than 2 characters', () => {
    const result = personalInfoSchema.safeParse({ ...VALID_PERSONAL_INFO, firstName: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects firstName with numbers', () => {
    const result = personalInfoSchema.safeParse({ ...VALID_PERSONAL_INFO, firstName: 'Ana3' });
    expect(result.success).toBe(false);
  });

  describe('address', () => {
    it('rejects postal codes shorter than 5 digits', () => {
      const result = personalInfoSchema.safeParse({
        ...VALID_PERSONAL_INFO,
        address: { ...VALID_ADDRESS, postalCode: '2800' },
      });
      expect(result.success).toBe(false);
    });

    it('rejects postal codes with letters', () => {
      const result = personalInfoSchema.safeParse({
        ...VALID_PERSONAL_INFO,
        address: { ...VALID_ADDRESS, postalCode: '2800A' },
      });
      expect(result.success).toBe(false);
    });

    it('rejects street shorter than 5 characters', () => {
      const result = personalInfoSchema.safeParse({
        ...VALID_PERSONAL_INFO,
        address: { ...VALID_ADDRESS, street: 'C/ A' },
      });
      expect(result.success).toBe(false);
    });

    it('defaults country to España', () => {
      const result = personalInfoSchema.safeParse(VALID_PERSONAL_INFO);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.address.country).toBe('España');
    });
  });

  describe('categories', () => {
    it('rejects empty array', () => {
      const result = personalInfoSchema.safeParse({ ...VALID_PERSONAL_INFO, categories: [] });
      expect(result.success).toBe(false);
    });

    it('rejects categories not in the allowed list', () => {
      const result = personalInfoSchema.safeParse({
        ...VALID_PERSONAL_INFO,
        categories: ['Categoría inventada'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects more than 10 categories', () => {
      const result = personalInfoSchema.safeParse({
        ...VALID_PERSONAL_INFO,
        categories: Array(11).fill('Animación 2D'),
      });
      expect(result.success).toBe(false);
    });
  });
});

// ─── membershipPaymentSchema ──────────────────────────────────────────────────

describe('membershipPaymentSchema', () => {
  it('accepts valid data', () => {
    const result = membershipPaymentSchema.safeParse(VALID_MEMBERSHIP_PAYMENT);
    expect(result.success).toBe(true);
  });

  it.each(['pleno-derecho', 'estudiante', 'colaborador', 'newsletter'] as const)(
    'accepts membershipType "%s"',
    (type) => {
      const result = membershipPaymentSchema.safeParse({ ...VALID_MEMBERSHIP_PAYMENT, membershipType: type });
      expect(result.success).toBe(true);
    },
  );

  it('rejects an unknown membershipType', () => {
    const result = membershipPaymentSchema.safeParse({
      ...VALID_MEMBERSHIP_PAYMENT,
      membershipType: 'premium',
    });
    expect(result.success).toBe(false);
  });

  it('rejects termsAccepted: false', () => {
    const result = membershipPaymentSchema.safeParse({ ...VALID_MEMBERSHIP_PAYMENT, termsAccepted: false });
    expect(result.success).toBe(false);
  });

  it('rejects gdprConsent: false', () => {
    const result = membershipPaymentSchema.safeParse({ ...VALID_MEMBERSHIP_PAYMENT, gdprConsent: false });
    expect(result.success).toBe(false);
  });

  it('defaults marketingConsent to false', () => {
    const { marketingConsent: _, ...withoutMarketing } = VALID_MEMBERSHIP_PAYMENT as typeof VALID_MEMBERSHIP_PAYMENT & { marketingConsent?: boolean };
    void _;
    const result = membershipPaymentSchema.safeParse(withoutMarketing);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.marketingConsent).toBe(false);
  });
});

// ─── registrationSchema — cross-field rules ───────────────────────────────────

describe('registrationSchema cross-field validation', () => {
  const VALID_ALL = { ...VALID_PERSONAL_INFO, ...VALID_MEMBERSHIP_PAYMENT, ...VALID_PROFILE_DETAILS };

  it('accepts a complete valid registration', () => {
    const result = registrationSchema.safeParse(VALID_ALL);
    expect(result.success).toBe(true);
  });

  it('rejects estudiante without a university', () => {
    const result = registrationSchema.safeParse({
      ...VALID_ALL,
      membershipType: 'estudiante',
      university: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path.join('.'));
      expect(paths).toContain('university');
    }
  });

  it('accepts estudiante with a university', () => {
    const result = registrationSchema.safeParse({
      ...VALID_ALL,
      membershipType: 'estudiante',
      university: 'Universidad Complutense de Madrid',
    });
    expect(result.success).toBe(true);
  });

  it('rejects pleno-derecho without a paymentMethod', () => {
    const { paymentMethod: _, ...withoutPayment } = VALID_ALL as typeof VALID_ALL & { paymentMethod?: string };
    void _;
    const result = registrationSchema.safeParse({ ...withoutPayment, membershipType: 'pleno-derecho' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path.join('.'));
      expect(paths).toContain('paymentMethod');
    }
  });

  it('accepts newsletter without a paymentMethod', () => {
    const { paymentMethod: _, ...withoutPayment } = VALID_ALL as typeof VALID_ALL & { paymentMethod?: string };
    void _;
    const result = registrationSchema.safeParse({ ...withoutPayment, membershipType: 'newsletter' });
    expect(result.success).toBe(true);
  });
});

// ─── validateStep ─────────────────────────────────────────────────────────────

describe('validateStep', () => {
  it('step 1: returns success for valid personal info', () => {
    const result = validateStep(1, VALID_PERSONAL_INFO);
    expect(result.success).toBe(true);
  });

  it('step 1: returns errors for invalid personal info', () => {
    const result = validateStep(1, { firstName: 'A' });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('step 2: returns success for valid membership data', () => {
    const result = validateStep(2, VALID_MEMBERSHIP_PAYMENT);
    expect(result.success).toBe(true);
  });

  it('step 2: returns errors when terms are not accepted', () => {
    const result = validateStep(2, { ...VALID_MEMBERSHIP_PAYMENT, termsAccepted: false });
    expect(result.success).toBe(false);
  });
});
