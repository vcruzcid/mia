---
name: registration-flow
description: Use this agent for ANY changes to the registration page, membership
  selection logic, Zod validation schemas, or the WildApricot payment redirect flow.
  Also handles the WA applyForMembership API call when implementing WA gateway.
---

You are responsible for the MIA registration flow.

---

## Current State (Refactor Required)

- `src/pages/RegistrationPage.tsx` — exists, needs refactor to remove Stripe links + discount logic
- `src/schemas/registrationSchema.ts` — needs `VALID_DISCOUNT_CODES` and `calculateDiscountedPrice` removed
- `src/config/site.config.ts` — `stripe` payment links block to be removed after WA gateway migration
- `src/utils/memberships.ts` — membership type definitions (keep, reuse)

**Target flow (WildApricot native gateway):**
1. User selects membership type (pleno-derecho / estudiante / colaborador)
2. Accepts TOS + GDPR
3. Clicks pay → Worker calls WA Non-Admin API `rpc/{accountId}/applyForMembership`
4. WA returns a payment URL → frontend redirects member to WA hosted checkout
5. WA handles payment, membership activation, welcome email automatically
6. No discount code field on MIA site — members enter WA discount codes on WA checkout page

---

## Schemas (extend only, do not duplicate)

Location: `src/schemas/registrationSchema.ts`

- `personalInfoSchema` — Step 1: name, email, phone (+34 format), address, categories
- `membershipPaymentSchema` — Step 2: membership type, TOS, GDPR (**remove discountCode field**)
- `profileDetailsSchema` — Step 3: bio, company, social media, gallery visibility
- `registrationSchema` — combined schema with cross-step refinements

---

## Membership Types

Defined in `src/utils/memberships.ts`. Three paid types:
- `pleno-derecho` — full member
- `estudiante` — student (requires `university` field)
- `colaborador` — collaborator

University is required when `membershipType === 'estudiante'` — enforced in `registrationSchema`.

---

## WA Membership Application API (when instructed to implement)

Worker endpoint `functions/api/apply-membership.ts`:
```typescript
// POST rpc/{accountId}/applyForMembership  (Non-Admin API — member token, not API key)
// Body: { membershipLevelId: number }
// Returns: { PaymentUrl: string } → redirect member to this URL
// WA hosts the checkout page — member pays there, WA activates membership automatically
```
Coordinate with `wildapricot-api` agent for token handling.

---

## TypeScript Rules

- Strict mode enabled — `npm run build` must pass
- Types for form data: use `RegistrationFormData` from `registrationSchema.ts`
- Do not create new type files — use `src/types/index.ts` and `src/types/api.ts`

---

## Form Patterns

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema, PersonalInfoFormData } from '@/schemas/registrationSchema';

const form = useForm<PersonalInfoFormData>({
  resolver: zodResolver(personalInfoSchema),
  defaultValues: { ... },
});
```

Validation errors: display inline below each field, in Spanish.

---

## Git scope for this agent: `registration`

Examples:
- `refactor(registration): remove Stripe links and discount code logic`
- `feat(registration): integrate WA applyForMembership API call`
- `fix(registration): correct postal code validation for non-Spain addresses`