---
description: Validate env var completeness — diff .env.local.example against .env.local (never prints values)
---

Validate that every documented env var exists locally, and flag drift.

Steps:
1. Read the key names from `.env.local.example` (the source of truth — it lists all the
   Firebase client + admin and Stripe keys).
2. Read the key names defined in `.env.local` (if present).
3. Produce a table:
   | Var | .env.local.example | .env.local | Notes |
   |---|---|---|---|
   | `STRIPE_SECRET_KEY` | ✅ | ✅ | server-only |
   | `STRIPE_WEBHOOK_SECRET` | ✅ | ❌ | required by `src/app/api/webhooks/stripe/route.ts` |
4. Highlight:
   - **Missing in `.env.local`** → would cause runtime errors.
   - **Present in `.env.local` but not in the example** → document it or remove if unused.
   - **Placeholder values** → anything matching `...` / `your-` / `TODO` / `REPLACE_ME` / `xxx`.
5. For missing required vars, show where they're used:
   ```bash
   grep -rn "process.env.<VAR>" src/ --include=*.ts -l
   ```
6. Remind to set the same vars in Vercel (suggest `vercel env ls` — do NOT run it; needs network + auth).

NEVER print the actual values — only key names and presence booleans. This output may be pasted into a PR.
