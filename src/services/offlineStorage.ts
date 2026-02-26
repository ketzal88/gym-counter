import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { addWorkoutLog, WorkoutLog } from './db';

/**
 * IndexedDB Schema para GymCounter
 */
interface GymCounterDB extends DBSchema {
  workouts: {
    key: string;
    value: WorkoutLog;
    indexes: { 'by-date': string };
  };
  userState: {
    key: string;
    value: Record<string, unknown>; // UserTrainingState
  };
  planVariant: {
    key: string;
    value: Record<string, unknown>; // PlanVariant
  };
  pendingSync: {
    key: number; // auto-increment
    value: {
      id?: number;
      type: 'workout' | 'visit' | 'measurement' | 'maxWeight';
      data: WorkoutLog | Record<string, unknown>;
      timestamp: number;
      retries: number;
    };
    indexes: { 'by-type': string };
  };
}

let dbPromise: Promise<IDBPDatabase<GymCounterDB>> | null = null;

/**
 * Inicializa IndexedDB
 */
function initDB(): Promise<IDBPDatabase<GymCounterDB>> {
  if (dbPromise) return dbPromise;

  dbPromise = openDB<GymCounterDB>('gymcounter-db', 1, {
    upgrade(db) {
      // Workouts store
      if (!db.objectStoreNames.contains('workouts')) {
        const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
        workoutStore.createIndex('by-date', 'timestamp');
      }

      // User state store
      if (!db.objectStoreNames.contains('userState')) {
        db.createObjectStore('userState', { keyPath: 'userId' });
      }

      // Plan variant store
      if (!db.objectStoreNames.contains('planVariant')) {
        db.createObjectStore('planVariant', { keyPath: 'id' });
      }

      // Pending sync queue
      if (!db.objectStoreNames.contains('pendingSync')) {
        const pendingStore = db.createObjectStore('pendingSync', {
          keyPath: 'id',
          autoIncrement: true
        });
        pendingStore.createIndex('by-type', 'type');
      }
    },
  });

  return dbPromise;
}

/**
 * Guarda un workout localmente (offline)
 */
export async function saveWorkoutOffline(workout: WorkoutLog): Promise<void> {
  try {
    const db = await initDB();

    // Guardar workout
    await db.put('workouts', workout);

    // Agregar a cola de sincronización
    await db.add('pendingSync', {
      type: 'workout',
      data: workout,
      timestamp: Date.now(),
      retries: 0,
    });

    console.log('✅ Workout guardado offline:', workout.id);
  } catch (error) {
    console.error('❌ Error guardando workout offline:', error);
    throw error;
  }
}

/**
 * Obtiene todos los workouts guardados localmente
 */
export async function getOfflineWorkouts(userId: string): Promise<WorkoutLog[]> {
  try {
    const db = await initDB();
    const allWorkouts = await db.getAll('workouts');

    // Filtrar por userId
    return allWorkouts.filter(w => w.userId === userId);
  } catch (error) {
    console.error('Error obteniendo workouts offline:', error);
    return [];
  }
}

/**
 * Sincroniza datos pendientes con Firestore
 */
export async function syncPendingData(): Promise<{ success: number; failed: number }> {
  try {
    const db = await initDB();
    const pending = await db.getAll('pendingSync');

    let success = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        // Intentar subir a Firestore
        if (item.type === 'workout') {
          await addWorkoutLog(item.data as Omit<WorkoutLog, 'timestamp' | 'id'>);
          console.log('✅ Workout sincronizado:', item.data.id);
        }
        // Añadir más tipos según necesidad (visit, measurement, etc.)

        // Eliminar de cola si exitoso
        if (item.id) {
          await db.delete('pendingSync', item.id);
        }
        success++;
      } catch (error) {
        console.error('❌ Error sincronizando item:', item.id, error);

        // Incrementar contador de reintentos
        if (item.id) {
          const updatedItem = { ...item, retries: item.retries + 1 };

          // Si ya se reintentó muchas veces, eliminar
          if (updatedItem.retries >= 5) {
            await db.delete('pendingSync', item.id);
            console.warn('⚠️ Item eliminado después de 5 reintentos:', item.id);
          } else {
            await db.put('pendingSync', updatedItem);
          }
        }
        failed++;
      }
    }

    console.log(`📊 Sync completo: ${success} exitosos, ${failed} fallidos`);
    return { success, failed };
  } catch (error) {
    console.error('Error sincronizando datos:', error);
    return { success: 0, failed: 0 };
  }
}

/**
 * Obtiene el número de items pendientes de sincronización
 */
export async function getPendingSyncCount(): Promise<number> {
  try {
    const db = await initDB();
    const pending = await db.getAll('pendingSync');
    return pending.length;
  } catch (error) {
    console.error('Error obteniendo pending count:', error);
    return 0;
  }
}

/**
 * Limpia workouts antiguos del almacenamiento local
 * (mantener solo los últimos 30 días)
 */
export async function cleanupOldWorkouts(): Promise<void> {
  try {
    const db = await initDB();
    const allWorkouts = await db.getAll('workouts');

    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    for (const workout of allWorkouts) {
      const workoutDate = new Date(workout.timestamp).getTime();

      if (workoutDate < thirtyDaysAgo) {
        await db.delete('workouts', workout.id);
        console.log('🗑️ Workout antiguo eliminado:', workout.id);
      }
    }
  } catch (error) {
    console.error('Error limpiando workouts antiguos:', error);
  }
}

/**
 * Guarda el estado del usuario localmente
 */
export async function saveUserStateOffline(userId: string, state: Record<string, unknown>): Promise<void> {
  try {
    const db = await initDB();
    await db.put('userState', { userId, ...state });
  } catch (error) {
    console.error('Error guardando user state offline:', error);
  }
}

/**
 * Obtiene el estado del usuario desde almacenamiento local
 */
export async function getUserStateOffline(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const db = await initDB();
    return (await db.get('userState', userId)) ?? null;
  } catch (error) {
    console.error('Error obteniendo user state offline:', error);
    return null;
  }
}

/**
 * Guarda una variante de plan localmente
 */
export async function savePlanVariantOffline(variantId: string, variant: Record<string, unknown>): Promise<void> {
  try {
    const db = await initDB();
    await db.put('planVariant', { id: variantId, ...variant });
  } catch (error) {
    console.error('Error guardando plan variant offline:', error);
  }
}

/**
 * Obtiene una variante de plan desde almacenamiento local
 */
export async function getPlanVariantOffline(variantId: string): Promise<Record<string, unknown> | null> {
  try {
    const db = await initDB();
    return (await db.get('planVariant', variantId)) ?? null;
  } catch (error) {
    console.error('Error obteniendo plan variant offline:', error);
    return null;
  }
}
