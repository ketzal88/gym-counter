# Firestore Conventions

Rules for reading and writing Firestore in gymcounter. Authoritative collection list
lives in `firestore.rules`; types live in `src/services/db.ts`.

## Collections & doc-ID schemes (don't invent new ones)

**Keyed by the user's `uid`** (one doc per user):
- `users/{uid}` — profile, onboarding, subscription, `assignedPlan`, `locale`.
- `userTrainingState/{uid}` — `currentDay`, `liftState`, `assignedVariant`, `planVersion`.
- `userBadges/{uid}` — gamification.

**Semantic ID:**
- `planVariants/{goal}_{level}_{days}day` — e.g. `greek_god_advanced_3day`. Read-only to
  clients; the app resolves plans from `GOAL_CONFIG` in code, NOT from this collection.

**Auto-ID, with a `userId` field on each doc** (append-only logs):
- `visits/{autoId}`, `workouts/{autoId}`, `measurements/{autoId}`, `maxWeights/{autoId}`,
  `subscriptionEvents/{autoId}`.

## Ownership & who writes what
- Every user-scoped doc is gated in `firestore.rules` by `request.auth.uid`. A query that
  isn't ownership-satisfiable will be denied — match the rule, don't fight it.
- **Client Web SDK** (`src/services/db.ts`) writes: `users` (own, `merge:true`), `visits`,
  `workouts`, `measurements`, `maxWeights`, `userTrainingState`.
- **Admin SDK** (`src/lib/firebase-admin.ts`, used by `src/app/api/webhooks/stripe/route.ts`)
  bypasses rules and writes `users` + `subscriptionEvents`.
- `userBadges` and `subscriptionEvents` are `write:false` for clients — server-side only.

## Stripe webhook idempotency (important)
Stripe retries deliveries, so the webhook handler MUST be idempotent. Today it does a blind
`subscriptionEvents.add({ ..., stripeEventId: event.id })` with no dedup — a retry creates a
duplicate event and re-runs mutations + Slack notifications.
- Dedup on `event.id`: write the event as `subscriptionEvents/{event.id}` (or a sibling
  `processedStripeEvents/{event.id}`) with a **create + already-exists guard**, and return
  200 early if it already exists.
- Always verify the signature (`stripe.webhooks.constructEvent`) BEFORE any DB work (already done).

## Adding an optional field to an existing doc type
A new optional field does NOT exist on already-written docs. Therefore:
1. **Reads must tolerate `undefined`:** `const x = doc.field ?? fallback;` (never `doc.field.foo`).
2. **Render conditionally in the UI:** `{doc.field && <Card data={doc.field} />}`.
3. **Writes use `merge:true`** (or only set the field at creation) — never overwrite the whole doc.
4. **The TS interface marks it optional (`?`).**
5. **Don't backfill eagerly** — let data arrive organically unless a feature needs it now.
6. Use `FieldValue.delete()` to remove a field — never write `null` as a "delete" sentinel.

Checklist before adding a field:
- [ ] Optional (`?`) in the `src/services/db.ts` interface
- [ ] Every read has a fallback or conditional render
- [ ] Writes use `merge:true` (or set only at doc creation)
- [ ] UI doesn't assume existing docs already have it

## Indexes
Composite indexes live in `firestore.indexes.json`. When you add a new `where` + `orderBy`
combo, add the index BEFORE shipping — otherwise the query fails silently with a console link.
Deploy: `firebase deploy --only firestore:indexes`. Deploy rules: `firebase deploy --only firestore:rules`.

## Batched writes
- Use `writeBatch` for multi-doc writes; chunk at **500 ops max per batch** (Firestore hard limit).
