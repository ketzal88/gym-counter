# GymCounter

PWA de seguimiento de gimnasio + motor de protocolos de entrenamiento (180 días, ciclos con
deload). Single-end-user con trial + suscripción Stripe. Español/English.

## Stack
- **Next.js 15.2** (App Router, Turbopack) · **React 19** · **TypeScript** (strict)
- **Firebase 12** (Web SDK, cliente) + **firebase-admin 13** (servidor/webhooks)
- **Stripe 20** (checkout, portal, webhooks) · **Tailwind 4** · **recharts** · **lucide-react**
- **PWA/offline** vía `idb` (IndexedDB) + service worker · **vitest** para tests

## Comandos
```bash
npm run dev          # next dev --turbopack
npm run build        # next build
npm run type-check   # tsc --noEmit
npm run lint         # next lint
npm run test         # vitest run
```
Slash commands del proyecto: `/ci-simulate` (corre los 4 checks), `/commit-checkpoint`
(CI local + commit seguro), `/env-check` (paridad de env vars, sin imprimir valores).

## Estructura
- `src/app/` — rutas: `dashboard`, `onboarding/{profile,goals,plan}`, `auth/{signin,signup}`,
  `paywall`, `subscription/manage`, `offline`, `admin/{users,recover-progress}`.
- `src/app/api/` — `notify`, `stripe/{create-checkout-session,create-portal-session}`,
  `webhooks/stripe`.
- `src/app/components/` — UI (UnifiedDashboard, RoutineTracker, ProtocolOverview, ChangePlanCard, charts/…).
- `src/services/` — `db.ts` (Firestore + tipos), `protocolEngine.ts` (motor de planes),
  `planVariantService.ts`, `badgeService.ts`, `stripeService.ts`, `offlineStorage.ts`.
- `src/lib/` — `firebase.ts`, `firebase-admin.ts`, `slack.ts`, `notifyClient.ts`.
- `src/context/` — `AuthContext`, `LanguageContext`, `SubscriptionContext`.
- `src/locales/` — `en.ts`, `es.ts`. `src/hooks/`, `src/data/`, `src/__tests__/`.

## Motor de planes (`src/services/protocolEngine.ts`)
- Un plan = un `GoalType` con `TEMPLATES_*` (días del ciclo), `DAY_LABELS_*` y una entrada en
  `GOAL_CONFIG` (`cycleLength`, `warmup`, `totalDays`). Goals: `military_v1` (12d), `toned_abs`,
  `glute_building`, `fat_burn` (6d), `greek_god` (3d, calistenia).
- El `assignedVariant` del usuario (ej. `greek_god_advanced_3day`) → `GoalType` vía
  `resolveGoalFromVariantId()`. **El motor resuelve todo desde código, no desde Firestore.**
- Cambio de plan: `ChangePlanCard` (pestaña Configuración) resetea al Día 1 preservando cargas.

## Firestore
Collections, doc-IDs, ownership e idempotencia del webhook Stripe: ver
@.claude/rules/firestore-conventions.md
Reglas en `firestore.rules` (admin = `gabrielucc@gmail.com`), índices en `firestore.indexes.json`.

## i18n
Strings en `src/locales/{en,es}.ts`. `type TranslationDict = typeof es` (en `LanguageContext.tsx`):
**agregá toda key nueva a AMBOS diccionarios** — una key presente en un solo locale no da
type-error y muestra la key cruda al otro idioma.

## Convenciones
- Componentes con hooks de React → necesitan `'use client'` arriba (si no, falla el build de Vercel).
- Campos opcionales de Firestore: reads con fallback, writes con `merge:true` (ver la rule).
- Variables de entorno: fuente de verdad `.env.local.example`. NUNCA imprimir valores ni commitear
  `.env*` / `*.pem` (un hook PreToolUse escanea secretos en cada `git commit`).

## Docs de referencia (raíz)
`PROJECT_DOCUMENTATION.md`, `STRIPE_SETUP.md`, `BADGES_INTEGRATION.md`,
`OFFLINE_MODE_INTEGRATION.md`, `YOUTUBE_VIDEOS_INTEGRATION.md`, `VERCEL_SETUP.md`.

## Git
- Commitear/pushear solo cuando el usuario lo pide. Si estás en `main`, ramificar primero.
- Trailer de commits: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Nunca `--no-verify` ni `--amend` sin pedido explícito.
