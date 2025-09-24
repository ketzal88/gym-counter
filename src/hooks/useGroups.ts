import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Group } from '@/data/types';

// Cache global para grupos
let groupsCache: { data: Group[]; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 segundos

export function useGroups() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (forceRefresh = false) => {
    if (!session?.user?.email) {
      setGroups([]);
      setLoading(false);
      return;
    }

    // Verificar cache si no es refresh forzado
    if (!forceRefresh && groupsCache && (Date.now() - groupsCache.timestamp) < CACHE_DURATION) {
      setGroups(groupsCache.data);
      setLoading(false);
      return;
    }

    // Evitar llamadas duplicadas
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/groups', {
        cache: 'no-store', // Evitar cache del navegador
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const groupsData = data.groups || [];
        
        // Actualizar cache
        groupsCache = {
          data: groupsData,
          timestamp: Date.now()
        };
        
        setGroups(groupsData);
      } else {
        throw new Error('Error al cargar grupos');
      }
    } catch (err) {
      console.error('Error cargando grupos:', err);
      setError('Error al cargar grupos');
      
      // Si hay error pero tenemos cache, usar cache
      if (groupsCache) {
        setGroups(groupsCache.data);
      }
    } finally {
      setLoading(false);
    }
  }, [session, loading]);

  const refreshGroups = useCallback(() => {
    return fetchGroups(true);
  }, [fetchGroups]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    refreshGroups,
    fetchGroups: () => fetchGroups(true) // Siempre forzar refresh cuando se llama externamente
  };
}

// Función para invalidar el cache cuando sea necesario
export function invalidateGroupsCache() {
  groupsCache = null;
}
