# GymCounter - Documentación Técnica del Proyecto

GymCounter es una aplicación progresiva (PWA Ready) diseñada para el seguimiento de la consistencia en el entrenamiento físico, gestión de récords personales y mediciones corporales.

## 🏗️ Arquitectura del Sistema

- **Frontend**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Backend / DB**: Firebase Firestore (NoSQL)
- **Autenticación**: Firebase Auth (Google + Email/Password)
- **Hosting**: Vercel

## 📊 Modelo de Datos (Firestore)

La aplicación utiliza las siguientes colecciones en Firestore:

### 1. `users` (Perfiles Públicos)
Almacena la información básica de los usuarios para permitir la visibilidad compartida (ranking).
- `uid`: ID único del usuario (de Firebase Auth).
- `displayName`: Nombre mostrado.
- `email`: Correo electrónico.
- `photoURL`: URL del avatar de Google.
- `lastLogin`: Marca de tiempo del último inicio de sesión.

### 2. `visits` (Registro de Asistencias)
- `userId`: Referencia al `uid` del propietario.
- `date`: Fecha en formato ISO String (ej. `2024-01-20T...`).
- `timestamp`: Objeto `Timestamp` de Firestore para ordenamiento eficiente.

### 3. `measurements` (Mediciones Corporales)
- `userId`: Referencia al `uid` del propietario.
- `date`: Fecha en formato ISO String.
- `muscle`: % de masa muscular (número).
- `fat`: % de grasa corporal (número).
- `timestamp`: Objeto `Timestamp` para consultas cronológicas.

### 4. `maxWeights` (Récords Personales)
- `userId`: Referencia al `uid`.
- `exercise`: Identificador del ejercicio (`Squat`, `Bench Press`, `Deadlift`, `Overhead Press`).
- `weight`: Peso máximo levantado (kg).
- `reps`: Repeticiones realizadas.
- `timestamp`: Objeto `Timestamp`.

### 5. `workouts` (Registro de Entrenamiento)
Almacena el detalle de cada sesión del Protocolo Militar.
- `userId`: Referencia al `uid`.
- `protocolDay`: Día del ciclo (1, 2, ...).
- `protocolDayType`: Tipo de día (ej. Upper Strength).
- `exercises`: Array de objetos con el detalle por serie.
- `finisherCompleted`: Booleano.
- `unlockResult`: Resultado de incrementos de carga (si aplica).
- `timestamp`: Objeto `Timestamp`.

### 6. `userTrainingState` (Estado del Protocolo)
Mantiene el progreso actual del usuario en el protocolo.
- `currentDay`: Día actual del ciclo.
- `liftState`: Cargas actuales para los levantamientos principales (bench, squat, deadlift, ohp).
- `completedProtocolSessions`: Contador total de sesiones.

## 🔐 Seguridad y Reglas

La seguridad está basada en **Firebase Rules**. La política general es:
- **Lectura Pública de Perfiles**: Todos los usuarios autenticados pueden ver la colección `users` y `visits` (esto permite el scoreboard de equipo).
- **Escritura Restringida**: Solo el dueño de un documento puede crearlo, editarlo o borrarlo.
- **Privacidad Estricta**: Las colecciones `measurements`, `maxWeights`, `workouts` y `userTrainingState` son accesibles **únicamente** por su propietario.

## 🎨 Componentes Principales

- `UnifiedDashboard.tsx`: El cerebro de la aplicación. Gestiona el estado de navegación y la lógica de negocio principal.
- `RoutineTracker.tsx`: Motor del **Protocolo Militar**. Genera entrenamientos diarios basados en `protocolEngine.ts`, gestiona el progreso de cargas y desbloquea niveles.
- `RecentVisitsManager.tsx`: Herramienta para corregir asistencias de los últimos 30 días.
- `MaxWeightsSection.tsx`: Gestión visual de PRs (Personal Records) con indicadores de tendencia.
- `TotalVisitsChart.tsx`: Visualización comparativa anual usando Recharts.
- `BottomNav.tsx`: Navegación táctil optimizada para móviles.

## 🔄 Flujo de Autenticación (`AuthContext.tsx`)

El `AuthContext` maneja el estado global del usuario. 
1. Escucha cambios en `onAuthStateChanged`.
2. Al iniciar sesión, verifica si el perfil en la colección `users` existe; si no, lo crea o lo actualiza (merge) con los datos más recientes de `displayName` y `photoURL`.

## 🛠️ Mantenimiento

### Limpieza de Código
Se han eliminado todos los vestigios de la migración anterior desde Google Sheets. La aplicación es ahora puramente dependiente de Firebase.

### Despliegue
Cualquier cambio en la rama principal dispara un build automático en Vercel. Asegurarse de que las variables de entorno de Firebase coincidan entre el entorno local y Vercel.
