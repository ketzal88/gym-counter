import { useState, useEffect, useCallback } from 'react';
import { Group, User, GymVisit } from '@/data/types';
import { loadUsers } from '@/data/sheetsService';

interface MemberStats extends User {
  totalVisits: number;
  lastVisit?: Date;
  visitedToday: boolean;
}

// Cache global para datos de grupos
const groupDataCache = new Map<string, {
  data: { members: MemberStats[]; visits: GymVisit[] };
  timestamp: number;
}>();

const CACHE_DURATION = 60000; // 1 minuto

export function useGroupData(groups: Group[]) {
  const [groupData, setGroupData] = useState<Record<string, {
    members: MemberStats[];
    visits: GymVisit[];
  }>>({});
  const [loading, setLoading] = useState(true);

  const fetchGroupData = useCallback(async (forceRefresh = false) => {
    if (groups.length === 0) {
      setGroupData({});
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const newGroupData: Record<string, {
        members: MemberStats[];
        visits: GymVisit[];
      }> = {};
      
      // Procesar grupos en paralelo
      const groupPromises = groups.map(async (group) => {
        const cacheKey = group.id;
        const cached = groupDataCache.get(cacheKey);
        
        // Verificar cache si no es refresh forzado
        if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          return { groupId: group.id, data: cached.data };
        }

        try {
          const response = await fetch(`/api/groups/${group.id}/members?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            const result = {
              members: data.members || [],
              visits: data.visits || []
            };
            
            // Actualizar cache
            groupDataCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });
            
            return { groupId: group.id, data: result };
          }
        } catch (err) {
          console.error(`Error cargando datos del grupo ${group.name}:`, err);
          
          // Si hay error pero tenemos cache, usar cache
          if (cached) {
            return { groupId: group.id, data: cached.data };
          }
        }
        
        return { groupId: group.id, data: { members: [], visits: [] } };
      });

      const results = await Promise.all(groupPromises);
      
      // Organizar datos por grupo
      results.forEach(({ groupId, data }) => {
        newGroupData[groupId] = data;
      });
      
      setGroupData(newGroupData);
      
    } catch (error) {
      console.error('Error cargando datos de grupos:', error);
      setGroupData({});
    } finally {
      setLoading(false);
    }
  }, [groups]);

  const refreshGroupData = useCallback(() => {
    return fetchGroupData(true);
  }, [fetchGroupData]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  return {
    groupData,
    loading,
    refreshGroupData
  };
}

// Función para invalidar cache de un grupo específico
export function invalidateGroupDataCache(groupId: string) {
  groupDataCache.delete(groupId);
}

// Función para invalidar todo el cache de grupos
export function invalidateAllGroupDataCache() {
  groupDataCache.clear();
}
