# Integración del Sistema de Badges

## Infraestructura Completada

✅ **Badge Definitions** (`src/data/badgeDefinitions.ts`):
- 20 badges organizados en 5 categorías
- Sistema de rareza (common, rare, epic, legendary)
- Sistema de nivelación basado en puntos
- Helper functions para colores y cálculos

✅ **Badge Service** (`src/services/badgeService.ts`):
- `evaluateBadges(userId)` - Evalúa condiciones y desbloquea badges
- `getUserBadges(userId)` - Obtiene badges del usuario
- `markBadgeAsSeen(userId, badgeId)` - Marca badge como visto
- Tracking de stats (workouts, streaks, volume, etc.)

✅ **Components**:
- `BadgeNotification.tsx` - Modal con confetti cuando se desbloquea
- `BadgesGallery.tsx` - Galería completa con progreso de nivel
- `BadgePreview.tsx` - Mini preview para header/nav

## Categorías de Badges

### 🔥 Attendance (Asistencia)
- Primer Día (1 workout)
- Semana Completa (7 días consecutivos)
- Mes Imparable (30 días en un mes)
- Racha de Acero (60 días consecutivos)
- Élite (180 días consecutivos)

### 🏋️ Strength (Fuerza)
- 100 Club - Bench (100 kg bench press)
- 150 Club - Squat (150 kg squat)
- 200 Club - Deadlift (200 kg deadlift)
- Pull-up Pro (12+ pull-ups)

### 🌟 Milestones (Hitos)
- Primer Ciclo (día 12)
- Cuatro Ciclos (día 48)
- Mitad del Camino (día 90)
- Protocolo Completo (día 180)

### ⏰ Consistency (Consistencia)
- Madrugador (10 workouts antes 8am)
- Búho Nocturno (10 workouts después 8pm)
- Guerrero de Lunes (todos los lunes del mes)

### 💥 Volume (Volumen)
- 10K Club (10,000 kg total)
- 50K Beast (50,000 kg total)
- 100K Legend (100,000 kg total)

## Integración en RoutineTracker

### Paso 1: Importar servicio

```typescript
import { evaluateBadges } from '@/services/badgeService';
import BadgeNotification from './BadgeNotification';
import { Badge } from '@/services/badgeService';
```

### Paso 2: Añadir estado

```typescript
const [newBadges, setNewBadges] = useState<Badge[]>([]);
const [showingBadgeIndex, setShowingBadgeIndex] = useState<number>(-1);
```

### Paso 3: Evaluar después de completar workout

En la función que guarda el workout (ej: `handleCompleteWorkout`), después de `addWorkoutLog`:

```typescript
// Guardar workout
await addWorkoutLog(workoutData);

// Evaluar badges
const unlockedBadges = await evaluateBadges(userId);

if (unlockedBadges.length > 0) {
  setNewBadges(unlockedBadges);
  setShowingBadgeIndex(0); // Mostrar el primero
}
```

### Paso 4: Renderizar notificaciones

Al final del JSX, antes del return:

```typescript
{/* Badge Notifications */}
{showingBadgeIndex >= 0 && showingBadgeIndex < newBadges.length && (
  <BadgeNotification
    badge={newBadges[showingBadgeIndex]}
    onClose={() => {
      // Si hay más badges, mostrar el siguiente
      if (showingBadgeIndex < newBadges.length - 1) {
        setShowingBadgeIndex(showingBadgeIndex + 1);
      } else {
        // Ya no hay más
        setShowingBadgeIndex(-1);
        setNewBadges([]);
      }
    }}
  />
)}
```

## Añadir Página de Badges

### Crear `/badges/page.tsx`

```typescript
import AuthGuard from '../components/AuthGuard';
import BadgesGallery from '../components/BadgesGallery';
import { useAuth } from '@/context/AuthContext';

export default function BadgesPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-8">
            Mis Logros
          </h1>
          {user && <BadgesGallery userId={user.uid} />}
        </div>
      </div>
    </AuthGuard>
  );
}
```

## Añadir Badge Preview al Header

En el header/navigation principal:

```typescript
import BadgePreview from './BadgePreview';

// En el JSX del header
{user && <BadgePreview userId={user.uid} />}
```

## Firestore Setup

Asegúrate de añadir la regla en `firestore.rules`:

```javascript
// User badges (read for owner, write via backend)
match /userBadges/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Only badgeService can update badges
}
```

## Testing

1. Completa tu primer workout → Debería desbloquear "Primer Día"
2. Entrena 7 días seguidos → Debería desbloquear "Semana Completa"
3. Alcanza un peso milestone (ej: 100kg bench) → Debería desbloquear badge de fuerza
4. Navega a `/badges` → Debería ver galería con todos los badges
5. Verifica el confetti animation al desbloquear

## Añadir Más Badges

Para añadir nuevos badges, edita `src/data/badgeDefinitions.ts`:

```typescript
{
  id: 'nuevo_badge',
  name: 'Nombre del Badge',
  description: 'Descripción',
  icon: '🎯',
  category: 'attendance', // o strength, milestone, consistency, volume
  points: 50,
  condition: {
    type: 'visits_total', // o visits_streak, protocol_day, etc.
    count: 10 // parámetros según el tipo
  },
  rarity: 'rare' // o common, epic, legendary
}
```

## Notas

- Los badges se evalúan cada vez que se completa un workout
- Si se desbloquean múltiples badges a la vez, se muestran secuencialmente
- Los badges no vistos aparecen con indicador rojo en BadgePreview
- El sistema de nivelación es automático basado en puntos totales
