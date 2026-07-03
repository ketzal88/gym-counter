# Modelo de entrenamiento "Recuperación posparto" (diástasis-safe)

Fecha: 2026-07-03 · Estado: aprobado por el usuario ("mandale con todo").

## Objetivo
Sumar un nuevo `GoalType` (`postpartum`) al motor de planes, fiel al documento de
entrenamiento posparto: 12 semanas, 3 fases reales que cambian la rutina, base diaria de
reconexión, autotest de diástasis, y guía de seguridad (reglas, señales de alarma, caminatas,
lactancia).

## Decisiones tomadas (brainstorming)
- **Alcance**: experiencia completa posparto (rutinas + reglas + autotest + fases + guía).
- **Fases**: reales, cambian la rutina, plan de 12 semanas.
- **Autotest**: paso en onboarding + card de re-test en dashboard (guarda último resultado).
- **Base diaria**: card fija en dashboard, checklist diario, se resetea cada día.

## Modelo de fases (el "día" del motor = contador de sesiones, no día calendario)

| Fase | Sesiones | ~Semanas @3/sem | Contenido |
|---|---|---|---|
| 1 · Reconexión | 1–9 | 1–3 | Solo Rutina A (core profundo + suelo pélvico, sin peso) |
| 2 · Carga liviana | 10–24 | 4–8 | Ciclo A/B/C con mancuernas livianas |
| 3 · Progresión | 25–36 | 9–12 | Ciclo A/B/C, cargas/rango mayores |

- `totalDays: 36`, `cycleLength: 3`, **sin deload** (progresión propia), **sin `mainLift`**
  (no hay 1RM de barra → `evaluateUnlock` devuelve null).
- Fase 1 fuerza Rutina A siempre; Fase 2/3 rotan A/B/C con `getDayType(day, 3)`.

## Rutinas (templates)
- **Rutina A** — Respiración+TvA, báscula pélvica, heel slides, dead bug 1 pierna, puente de
  glúteos, bird dog, plancha lateral de rodillas. (bodyweight)
- **Rutina B** — Sentadilla goblet, peso muerto rumano, zancadas, puente con carga, dead bug,
  bird dog. (dumbbell + bodyweight)
- **Rutina C** — Remo inclinado, press hombro sentada, floor press, farmer carry, plancha
  lateral. (dumbbell + bodyweight)
- **Warmup** `WARMUP_POSTPARTUM`: respiración 360°, activación transverso, báscula pélvica.

## Superficies nuevas (UI, solo plan posparto)
1. `DailyBaseCard` — checklist diario (4 ejercicios de base), estado en localStorage por fecha.
2. `DiastasisTestCard` — instructivo autotest + registro (`diastasisResult`, `diastasisTestedAt`).
3. `PostpartumGuideCard` — colapsable: 5 reglas, ejercicios a evitar, señales de alarma,
   caminatas, lactancia/descenso de peso.
4. Banner de fase en `RoutineTracker` (pre-workout) + recordatorio de la regla de oro.
5. Paso de autotest en `onboarding/plan` (captura `diastasisResult`).

## Datos (Firestore)
Campos opcionales en `userTrainingState` (lectura tolerante, `merge`/updateDoc):
- `diastasisResult?: 'mild' | 'moderate' | 'unknown'`
- `diastasisTestedAt?: string` (ISO)

Gating suave: si `moderate`, banner recomendando kinesiología de suelo pélvico antes de carga.

## Puntos de integración
`protocolEngine.ts` (GoalType, GOAL_CONFIG, templates, warmup, day-labels, phase resolver,
branch en `generateWorkoutForGoal`, `resolveGoalFromVariantId`, `ProtocolWorkout.phase`),
`db.ts` (uniones + campos), `planVariantService.ts` (uniones + goalNames),
`onboarding/goals`, `ChangePlanCard`, `onboarding/plan`, `UnifiedDashboard` (+ `/180` dinámico),
`RoutineTracker` (`/180` dinámico + banner), `locales/{es,en}.ts`, `scripts/seedPlanVariants.ts`,
tests en `protocolEngine.test.ts`.

## Naming / estética
- ES: "Recuperación posparto" — "Core, suelo pélvico y fuerza progresiva, seguro para diástasis."
- EN: "Postpartum recovery" — "Core, pelvic floor & progressive strength — diastasis-safe."
- Icono `Baby`, color teal.
