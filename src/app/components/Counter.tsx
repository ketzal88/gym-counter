'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, GymVisit } from '@/data/types';
import { loadUsers, loadVisits, saveVisit } from '@/data/sheetsService';

export default function Counter() {
  const [users, setUsers] = useState<User[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);
  
  // Actualizar contadores basados en las visitas (usando useCallback para evitar dependencias circulares)
  const updateCounts = useCallback((visits: GymVisit[]) => {
    // Inicializar contadores en cero
    const newCounts: Record<string, number> = {};
    
    // Contar visitas para cada usuario
    visits.forEach(visit => {
      if (!newCounts[visit.userId]) {
        newCounts[visit.userId] = 0;
      }
      newCounts[visit.userId]++;
    });
    
    // Actualizar estado
    setCounts(newCounts);
  }, []); // Sin dependencia de counts
  
  // Cargar los datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar usuarios
        const usersData = await loadUsers();
        setUsers(usersData);
        
        // Cargar visitas y calcular contadores
        const visits = await loadVisits();
        updateCounts(visits);
        
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [updateCounts]);
  
  // Manejar la adición de una nueva visita
  const handleAddVisit = async (userId: string) => {
    setLoading(true);
    
    try {
      // Crear una fecha actual correcta
      const now = new Date();
      
      // Formato de fecha ISO
      const isoDate = now.toISOString();
      
      // Crear nuevo registro de visita
      const newVisit: GymVisit = {
        id: Date.now().toString(),
        userId,
        date: isoDate
      };
      
      // Guardar en Google Sheets (y localStorage como respaldo)
      await saveVisit(newVisit);
      
      // Actualizar contador localmente para feedback inmediato
      setCounts(prevCounts => ({
        ...prevCounts,
        [userId]: (prevCounts[userId] || 0) + 1
      }));
      
    } catch (error) {
      console.error('Error al registrar visita:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Resetear contadores
  const handleReset = () => {
    const confirmed = window.confirm('¿Estás seguro que quieres reiniciar todos los contadores a cero? Esta acción no se puede deshacer.');
    if (!confirmed) return;
    
    setResetting(true);
    
    // Reiniciar contadores a cero
    const resetCounts: Record<string, number> = {};
    users.forEach(user => {
      resetCounts[user.id] = 0;
    });
    
    setCounts(resetCounts);
    
    // Limpiar datos en localStorage
    try {
      localStorage.removeItem('gym_counter_data');
    } catch (error) {
      console.error('Error al reiniciar datos:', error);
    } finally {
      setResetting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">🏆 Gym Counter</h2>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors shadow-md flex items-center"
        >
          {resetting ? 'Reiniciando...' : '🗑️ Reiniciar contadores'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {users.map(user => (
          <div 
            key={user.id} 
            className="bg-white p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium mb-2 text-gray-800">{user.name}</h3>
              <div className="text-5xl font-bold mb-4 text-gray-900 flex items-center">
                {loading ? (
                  <span className="text-2xl">⏳</span>
                ) : (
                  <>
                    {counts[user.id] || 0}
                    <span className="ml-2 text-2xl">
                      {(counts[user.id] || 0) > 10 ? '🔥' : 
                       (counts[user.id] || 0) > 5 ? '💪' : 
                       (counts[user.id] || 0) > 0 ? '👍' : '🏃‍♂️'}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => handleAddVisit(user.id)}
                disabled={loading}
                className={`${
                  loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-4 py-2 rounded-md transition-colors transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center`}
              >
                {loading ? 'Guardando...' : '🏋️ ¡Fui al gym! +1'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 