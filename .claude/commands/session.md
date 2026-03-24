Read CLAUDE.md. Then run the following checks and report results before doing anything else:

1. **Branch check** — run `git branch --show-current`. 
   - If on `main` or `dev`: stop and warn. Do not work directly on these branches.
   - If on a feature branch: confirm it was branched from `dev` (check with `git log --oneline main..HEAD`).

2. **Build check** — run `npm run build`.
   - If it fails: report the errors. Do not proceed until fixed or I say to continue.

3. **Uncommitted work** — run `git status`.
   - List any modified or untracked files.

4. **Last 3 commits** — run `git log --oneline -3`.

5. **Ready summary** — one sentence: what branch we are on and whether the build is green.

Then stop and wait for my instruction.