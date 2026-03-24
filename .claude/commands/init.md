Read CLAUDE.md completely.

Then audit the repo and report the following — format each section as a concise table:

**1. Routes**
List all routes defined in src/App.tsx with their component and status (working / placeholder / missing).

**2. Cloudflare bindings gap**
Compare wrangler.toml against CLAUDE.md. List what is configured vs what is missing (D1, R2, KV, Email).

**3. Functions gap**
List files in functions/api/ and mark each as: exists | missing | needs-refactor based on CLAUDE.md spec.

**4. Agents**
Confirm all 5 agents exist in .claude/agents/: git-workflow, wildapricot-api, member-gallery, cloudflare-infra, registration-flow.

**5. Conflicts with CLAUDE.md decisions**
Check for and flag any of the following still present in the codebase:
- Stripe Payment Links in use (siteConfig.stripe or RegistrationPage redirects)
- VALID_DISCOUNT_CODES or calculateDiscountedPrice in registrationSchema.ts
- Supabase imports or references anywhere
- Any WildApricot API integration (expected: not started)

**6. Git state**
Show: current branch, last 5 commits (one-line format), any uncommitted changes.

Do not make any changes. Wait for instructions.