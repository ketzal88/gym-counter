# Integración del Modo Offline

## Infraestructura Completada

✅ **Offline Storage** (`src/services/offlineStorage.ts`):
- IndexedDB setup con idb wrapper
- 4 object stores: workouts, userState, planVariant, pendingSync
- Functions: `saveWorkoutOffline()`, `syncPendingData()`, `getPendingSyncCount()`
- Automatic retry logic (hasta 5 intentos)
- Cleanup de workouts antiguos (>30 días)

✅ **useOfflineSync Hook** (`src/hooks/useOfflineSync.ts`):
- Detección automática de online/offline
- Contador de items pendientes
- Sync automático al volver online
- Sync periódico cada 5 minutos si hay pendientes
- Estado de sincronización (isSyncing, lastSyncTime)

✅ **Offline Page** (`/offline`):
- Página fallback cuando no hay conexión
- Lista de funciones disponibles offline
- Botón de reintentar conexión
- Indicador de estado en tiempo real

## Cómo Funciona

### 1. Detección de Conectividad

El hook `useOfflineSync` escucha eventos del navegador:

```typescript
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);
```

### 2. Guardar Datos Offline

Cuando el usuario completa un workout sin conexión:

```typescript
import { saveWorkoutOffline } from '@/services/offlineStorage';

// En lugar de addWorkoutLog directo
if (!navigator.onLine) {
  await saveWorkoutOffline(workoutData);
} else {
  await addWorkoutLog(workoutData);
}
```

### 3. Sincronización Automática

Cuando vuelve la conexión, `useOfflineSync` triggerea automáticamente:

```typescript
const handleOnline = async () => {
  setIsOnline(true);
  setTimeout(async () => {
    await sync(); // Sincroniza todos los datos pendientes
  }, 1000);
};
```

### 4. Queue de Sincronización

Los datos se guardan en `pendingSync` object store:

```typescript
{
  id: 1,
  type: 'workout',
  data: { ...workoutData },
  timestamp: 1234567890,
  retries: 0
}
```

Cuando se sincroniza exitosamente, se elimina de la queue.

## Integración en RoutineTracker

### Paso 1: Importar hook y service

```typescript
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { saveWorkoutOffline } from '@/services/offlineStorage';
```

### Paso 2: Usar el hook

```typescript
const { isOnline, pendingCount, isSyncing, lastSyncTime } = useOfflineSync();
```

### Paso 3: Modificar función de guardar workout

```typescript
const handleCompleteWorkout = async () => {
  const workoutData = {
    id: `workout_${Date.now()}`,
    userId,
    timestamp: new Date(),
    exercises: completedExercises,
    // ...
  };

  try {
    if (isOnline) {
      // Online: guardar directo en Firestore
      await addWorkoutLog(workoutData);
      addToast('¡Workout guardado!', 'success');
    } else {
      // Offline: guardar en IndexedDB
      await saveWorkoutOffline(workoutData);
      addToast('Guardado offline. Se sincronizará cuando vuelvas a tener conexión.', 'info');
    }
  } catch (error) {
    console.error('Error guardando workout:', error);
    addToast('Error guardando workout', 'error');
  }
};
```

### Paso 4: Mostrar banner de estado offline

```typescript
{!isOnline && (
  <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-bold">
    📴 Modo Offline - Tus datos se sincronizarán cuando vuelvas a tener conexión
    {pendingCount > 0 && ` (${pendingCount} pendientes)`}
  </div>
)}

{isSyncing && (
  <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-bold animate-pulse">
    🔄 Sincronizando datos...
  </div>
)}
```

## Service Worker (Opcional - Avanzado)

Para cachear assets estáticos (JS, CSS, imágenes), puedes añadir un Service Worker custom.

### Crear `public/sw.js`:

```javascript
const CACHE_NAME = 'gymcounter-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match('/offline');
        });
      })
  );
});
```

### Registrar en `app/layout.tsx`:

```typescript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => console.log('Service Worker registered'))
      .catch((error) => console.log('Service Worker registration failed:', error));
  }
}, []);
```

## Testing

### Test 1: Guardar Workout Offline

1. Abre DevTools → Network tab
2. Set Throttling → Offline
3. Completa un workout
4. Verifica en DevTools → Application → IndexedDB → gymcounter-db
5. Deberías ver el workout en `workouts` y en `pendingSync`

### Test 2: Sincronización Automática

1. Mantén DevTools → Network → Offline
2. Completa varios workouts
3. Set Throttling → Online
4. Espera ~1 segundo
5. Verifica en Firestore que los workouts se sincronizaron
6. Verifica en IndexedDB que `pendingSync` está vacío

### Test 3: Persistencia de Datos

1. Offline mode, completa workout
2. Cierra el navegador completamente
3. Abre el navegador de nuevo, sigue offline
4. Ve a DevTools → IndexedDB
5. Los datos deberían seguir ahí
6. Set Online, deberían sincronizarse

## Notas

- IndexedDB persiste incluso si cierras el navegador
- Los datos se sincronizan automáticamente sin intervención del usuario
- El contador de pendientes se muestra en el banner
- Videos de YouTube NO funcionan offline (requieren conexión)
- Los workouts offline se marcan con timestamp local

## Mejoras Futuras

- [ ] Cache de plan variants para acceso offline completo
- [ ] Pre-cache de thumbnails de videos
- [ ] Background Sync API para sync más robusto
- [ ] Notification API para avisar cuando se sincroniza
- [ ] Offline-first architecture (siempre guardar local primero)
