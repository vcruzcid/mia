Before starting the task below, do the following:

**1. Agent selection**
Read the task description. Identify which agent in .claude/agents/ applies:
- `wildapricot-api` — anything touching WA API, token, D1 sync, webhooks
- `member-gallery` — SociasPage, /api/members, gallery UI, D1 reads
- `cloudflare-infra` — wrangler.toml, D1 migrations, R2, KV, deployment
- `registration-flow` — RegistrationPage, schemas, WA payment redirect
- `git-workflow` — branching, commits, PRs (always applies)
State which agent(s) you are following and confirm you have read their rules.

**2. Branch check**
Run `git branch --show-current`.
- If not on a feature branch: create one from dev using the naming convention in git-workflow.md.
- Branch name must match the task type: feat/, fix/, refactor/, chore/

**3. Plan**
In 3–5 bullet points, describe what files you will create or modify and in what order.
Wait for my go-ahead before writing any code.

---

Task: $ARGUMENTS