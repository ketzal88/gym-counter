import { useState, useEffect, useCallback } from 'react';
import { syncPendingData, getPendingSyncCount } from '@/services/offlineStorage';

/**
 * Hook para gestionar sincronización offline
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Actualizar contador de pendientes
  const updatePendingCount = useCallback(async () => {
    const count = await getPendingSyncCount();
    setPendingCount(count);
  }, []);

  // Sincronizar datos pendientes
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    console.log('🔄 Iniciando sincronización...');

    try {
      const result = await syncPendingData();
      console.log('✅ Sincronización completada:', result);

      setLastSyncTime(new Date());
      await updatePendingCount();

      return result;
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      return { success: 0, failed: 0 };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount]);

  // Listener de conectividad
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Conexión restaurada');
      setIsOnline(true);

      // Esperar un poco antes de sincronizar (dar tiempo a que la conexión sea estable)
      setTimeout(async () => {
        await sync();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('📴 Sin conexión');
      setIsOnline(false);
    };

    // Añadir listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Actualizar contador inicial
    updatePendingCount();

    // Sincronizar periódicamente si hay items pendientes (cada 5 minutos)
    const syncInterval = setInterval(() => {
      if (isOnline && pendingCount > 0 && !isSyncing) {
        sync();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [sync, updatePendingCount, isOnline, pendingCount, isSyncing]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    sync,
    updatePendingCount,
  };
}
