---
description: Review staged changes, run full local CI (type-check + lint + test), then commit safely
---

Perform a safe commit checkpoint. Goal: commit only code that would pass CI.

Steps:
1. `git status` and `git diff --stat` to see what changed.
2. **ESLint auto-fix** (clears fixable lint before it reaches CI):
   ```bash
   npx next lint --fix 2>&1 | tail -20
   ```
   Note which files changed so they get staged.
3. `npm run type-check` (`tsc --noEmit`) — STOP on any TypeScript error.
4. `npm run lint` (`next lint`) — STOP on lint errors that did not auto-fix.
5. `npm run test` (`vitest run`) — STOP on any failing test.
6. Show a summary of the diff and propose a commit message. Scan `git log --oneline -10`
   to match the repo style (it uses `feat:` / `fix:` Conventional Commits).
7. **Wait for the user's confirmation before committing.**
8. On confirm:
   - If on the default branch (`main`), create a feature branch first (project policy).
   - Stage ONLY the specific files involved (never `git add -A`).
   - Commit with a HEREDOC body + trailer:
     `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
   - `git status` to verify.

Safety:
- Never `--amend` or `--no-verify` without explicit instruction.
- Never stage `.env*`, `*.pem`, or files matching `*secret*` / `*credential*`.
- The PreToolUse secret-scanner hook (`scripts/check-no-secrets.py`) also guards every
  `git commit`. If it blocks, move the value to `.env.local`, then make a NEW commit (don't amend).
