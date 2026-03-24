# PR #83 Bug Fixes Design

Date: 2026-03-18
Branch: codex/member-code-portal-email

## Summary

Five targeted bug fixes across three files identified during code review of PR #83
("Add member code support to onboarding and portal").

---

## Fix 1 — `persistAssignment` catch block swallows all errors

**File:** `functions/_lib/member-code.ts`

**Problem:** The bare `catch {}` at line 91 catches every exception, not just UNIQUE constraint
violations. Non-constraint errors (D1 outage, schema mismatch) are silently swallowed. The original
exception is discarded. If `findAssignment` also returns null, a generic error is thrown with no
root cause.

**Fix:** Add `import { warn } from './_lib/logger'` (adjust relative path) to `member-code.ts`
which currently has no logger imports. Change `catch` to `catch (err)` to capture the original
error. Add `warn('member_code.conflict_on_insert', err, { email, contactId })` before the
`findAssignment` fallback.

---

## Fix 2 — Silent country drop with no warn log in `profile.ts`

**File:** `functions/api/portal/profile.ts`

**Problem:** When a user submits a `country` label not found in `COUNTRY_IDS`, `countryValue`
becomes `undefined` and the field is silently skipped from the PUT to WildApricot. The `warn`
import was removed in this PR and the previous `warn('portal.profile.invalid_country', ...)` call
was not replaced with an equivalent.

**Fix:** Re-add `warn` to the logger import. Add `warn('portal.profile.unknown_country',
{ country: countryLabel, contactId: session.contactId })` in the branch where `countryLabel` is
set but `countryId` is `undefined`.

---

## Fix 3 — `FieldName: 'Pais'` missing accent

**File:** `functions/api/portal/profile.ts` line 196

**Problem:** Regression from prior code which used `'País'`. Every other field in the same array
uses correctly accented Spanish. `SystemCode` is authoritative for WA routing so this is not
functionally breaking, but it is inconsistent with all other entries.

**Fix:** Change `'Pais'` → `'País'`.

---

## Fix 4 — Redundant `getContactById` on POST path (Option A)

**File:** `functions/_lib/wa-contacts.ts`

**Problem:** After creating a new contact (POST), the code immediately calls `getContactById` to
read back `memberCode`. For a newly created contact this field is always empty — no code has been
assigned yet. The call always returns `memberCode: ''`, making it pure overhead. It also adds a
third WA API call before `ensureMemberCode` makes its own read, totalling 4 WA calls for one
registration.

**Fix:** Remove the `getContactById` call on the POST (create) path. Replace:
```typescript
const createdContact = await getContactById(baseUrl, headers, created.Id);
const memberCode = getMemberCode(createdContact);
log('wa.contact_created', { ... });
return { contactId: created.Id, renewalDate, memberCode };
```
with:
```typescript
log('wa.contact_created', { ... });
return { contactId: created.Id, renewalDate, memberCode: '' };
```
Keep `getContactById` on the PUT (update) path where it is load-bearing.

Result for new members: 3 WA calls (search + create + ensureMemberCode's read). Was 4.

---

## Fix 5 — `findAssignment` OR logic: no decision on ambiguous match

**File:** `functions/_lib/member-code.ts`

**Verdict after deeper analysis:** The `WHERE email = ? OR contact_id = ?` query is intentional
idempotency — if a member re-registers with a new WA contact ID, they should receive the same
member code. The OR semantics correctly handle this case. No change needed.

This issue was scored 75 in the review but on closer inspection the behavior is correct by design.
Removing it from scope.

---

## Files Changed

| File | Change |
|------|--------|
| `functions/_lib/member-code.ts` | Fix 1: warn in catch block |
| `functions/api/portal/profile.ts` | Fix 2: warn on unknown country; Fix 3: accent typo |
| `functions/_lib/wa-contacts.ts` | Fix 4: remove redundant getContactById on POST path |

## Out of Scope

- Issue 5 (`findAssignment` OR logic) — intentional by design, no fix
- Issue 1 (no logging in member-code.ts) — scored 50, not a direct CLAUDE.md violation for lib files
- Issue 6 (migration naming) — false positive, `0001_members.sql` does not exist in repo
- Issue 7 (`MEMBER_CODE_NEXT_START` comment) — scored 25, out of scope
- Issue 8 (sequence gap on race) — scored 50, inherent D1 limitation, acceptable trade-off
