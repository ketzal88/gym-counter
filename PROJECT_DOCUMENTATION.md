# GymCounter - Documentacion Tecnica del Proyecto

GymCounter es una aplicacion progresiva (PWA Ready) disenada para el seguimiento de la consistencia en el entrenamiento fisico, gestion de records personales y mediciones corporales.

## Arquitectura del Sistema

- **Frontend**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Backend / DB**: Firebase Firestore (NoSQL)
- **Autenticacion**: Firebase Auth (Google + Email/Password)
- **Hosting**: Vercel
- **Pagos**: Stripe (checkout, portal de cliente, webhooks)
- **Gamificacion**: Sistema de badges con niveles y puntos
- **Offline**: IndexedDB via `idb` para soporte offline
- **i18n**: Espanol e Ingles (`src/locales/`)

## Modelo de Datos (Firestore)

La aplicacion utiliza las siguientes colecciones en Firestore:

### 1. `users` (Perfiles)
Almacena la informacion basica de los usuarios y estado de suscripcion.
- `uid`: ID unico del usuario (de Firebase Auth).
- `displayName`: Nombre mostrado.
- `email`: Correo electronico.
- `photoURL`: URL del avatar de Google.
- `lastLogin`: Marca de tiempo del ultimo inicio de sesion.
- `stripeCustomerId`: ID del cliente en Stripe.
- `subscriptionStatus`: Estado (`trial`, `active`, `cancelled`).
- `subscriptionTier`: Plan (`monthly`, `annual`).
- `stripeSubscriptionId`: ID de la suscripcion en Stripe.
- `subscriptionStartDate`, `subscriptionEndDate`: Periodo de facturacion.
- `subscriptionCancelAtPeriodEnd`: Si cancela al final del periodo.

### 2. `visits` (Registro de Asistencias)
- `userId`: Referencia al `uid` del propietario.
- `date`: Fecha en formato ISO String.
- `timestamp`: Objeto `Timestamp` de Firestore.

### 3. `measurements` (Mediciones Corporales)
- `userId`, `date`, `muscle`, `fat`, `timestamp`.

### 4. `maxWeights` (Records Personales)
- `userId`, `exercise`, `weight`, `reps`, `timestamp`.

### 5. `workouts` (Registro de Entrenamiento)
Detalle de cada sesion del Protocolo Militar.
- `userId`, `protocolDay`, `protocolDayType`, `exercises`, `finisherCompleted`, `unlockResult`, `timestamp`.

### 6. `userTrainingState` (Estado del Protocolo)
- `currentDay`, `liftState`, `completedProtocolSessions`.

### 7. `userBadges` (Gamificacion)
- `userId`, `badges[]` (id, unlockedAt, seen), `totalPoints`, `level`, `lastBadgeUnlocked`.

### 8. `subscriptionEvents` (Eventos de Suscripcion)
- `userId`, `eventType`, `timestamp`, `data`, `stripeEventId`.

## Seguridad y Reglas

La seguridad esta basada en **Firebase Rules**:
- **Lectura Publica de Perfiles**: Usuarios autenticados pueden ver `users` y `visits` (scoreboard).
- **Escritura Restringida**: Solo el dueno puede crear/editar/borrar sus documentos.
- **Privacidad Estricta**: `measurements`, `maxWeights`, `workouts`, `userTrainingState` solo accesibles por su propietario.

## Componentes Principales

- `UnifiedDashboard.tsx`: Cerebro de la app. Gestiona navegacion y logica de negocio.
- `RoutineTracker.tsx`: Motor del Protocolo Militar. Genera entrenamientos diarios.
- `RecentVisitsManager.tsx`: Correccion de asistencias ultimos 30 dias.
- `MaxWeightsSection.tsx`: Gestion visual de PRs con indicadores de tendencia.
- `SubscriptionCard.tsx`: Muestra estado de suscripcion y opciones de upgrade.
- `BadgesGallery.tsx` / `BadgePreview.tsx`: Sistema de gamificacion visual.
- `BodyCompositionChart.tsx`, `LiftProgressionChart.tsx`, `WeeklyVolumeChart.tsx`: Graficos con Recharts.
- `BottomNav.tsx`: Navegacion tactil optimizada para moviles.

## Flujo de Autenticacion (`AuthContext.tsx`)

El `AuthContext` maneja el estado global del usuario:
1. Escucha cambios en `onAuthStateChanged`.
2. Al iniciar sesion, verifica/crea perfil en `users`.
3. Soporta: Google Sign-In, Email/Password Login, Email/Password Register.

### Paginas de Auth
- `/auth/signin` - Inicio de sesion (email + Google).
- `/auth/signup` - Registro de cuenta nueva (email + Google).

## Monetizacion (Stripe)

### Flujo de Suscripcion
1. Usuario elige plan en `/paywall` o `SubscriptionCard`.
2. `stripeService.ts` llama a `/api/stripe/create-checkout-session`.
3. Server crea sesion de Stripe Checkout y retorna URL.
4. Cliente redirige a Stripe para el pago.
5. Webhook `/api/webhooks/stripe` procesa eventos y actualiza Firestore.

### Rutas API de Stripe
- `POST /api/stripe/create-checkout-session` - Crea sesion de checkout.
- `POST /api/stripe/create-portal-session` - Portal de gestion de cliente.
- `POST /api/webhooks/stripe` - Recibe eventos de Stripe (subscription.created, updated, deleted, payment_failed, trial_will_end).

### Variables de Entorno Stripe
- `STRIPE_SECRET_KEY` - Server-side.
- `STRIPE_WEBHOOK_SECRET` - Para verificar webhooks.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side.
- `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`, `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID` - Price IDs.
- `NEXT_PUBLIC_APP_URL` - URL base para redirects.

## Firebase Admin SDK

Inicializacion lazy via Proxy en `src/lib/firebase-admin.ts` para evitar fallos en build time cuando las variables de entorno no estan disponibles.

### Variables de Entorno Firebase Admin
- `FIREBASE_CLIENT_EMAIL` - Email del service account.
- `FIREBASE_PRIVATE_KEY` - Private key del service account (con `\n` literales).
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Project ID (compartido con client).

## Soporte Offline (`src/services/offlineStorage.ts`)

Usa IndexedDB (via `idb`) con 4 stores:
- `workouts`: Cache local de entrenamientos.
- `userState`: Estado del usuario offline.
- `planVariant`: Variante de plan cacheada.
- `pendingSync`: Cola de sincronizacion pendiente.

Sincroniza automaticamente cuando se recupera la conexion.

## Gamificacion (`src/services/badgeService.ts`)

Sistema de badges evaluados segun estadisticas del usuario:
- Visitas totales, rachas, dia del protocolo, protocolo completado.
- Hitos de levantamiento, volumen total, hora del dia, dia de la semana.
- Definiciones en `src/data/badgeDefinitions.ts`.

## Paginas Admin

- `/admin/users` - Gestion de usuarios (ver, editar suscripciones, datos).
- `/admin/recover-progress` - Recuperar progreso de usuarios.

## Onboarding

Flujo de 3 pasos al registrarse:
- `/onboarding/profile` - Datos basicos (sexo, peso, experiencia).
- `/onboarding/goals` - Objetivos de fitness.
- `/onboarding/plan` - Seleccion de plan de entrenamiento.

## Internacionalizacion

- `src/locales/es.ts` - Espanol.
- `src/locales/en.ts` - Ingles.
- `LanguageContext.tsx` gestiona el idioma activo.

## Despliegue

- Cualquier push a `main` dispara build automatico en Vercel.
- Variables de entorno deben estar configuradas tanto local (`.env.local`) como en Vercel.
- El build ejecuta ESLint + TypeScript type checking. Para verificar localmente: `npx tsc --noEmit && npx next lint`.
