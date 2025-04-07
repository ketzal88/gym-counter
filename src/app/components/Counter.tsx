'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, GymVisit } from '@/data/types';
import { loadUsers, loadVisits, saveVisit } from '@/data/sheetsService';

export default function Counter() {
  const [users, setUsers] = useState<User[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    '1': 29, // Gabi: 29 visitas
    '2': 28, // Iña: 28 visitas
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  
  // Actualizar contadores basados en las visitas (usando useCallback para evitar dependencias circulares)
  const updateCounts = useCallback((visits: GymVisit[], keepInitialValues = false) => {
    setCounts(prevCounts => {
      // Usar el valor anterior para evitar dependencia circular
      const newCounts: Record<string, number> = keepInitialValues ? { ...prevCounts } : {};
      
      // Contar visitas para cada usuario
      visits.forEach(visit => {
        if (!newCounts[visit.userId]) {
          newCounts[visit.userId] = 0;
        }
        newCounts[visit.userId]++;
      });
      
      return newCounts;
    });
  }, []); // Sin dependencia de counts
  
  // Cargar los datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar usuarios
        const usersData = await loadUsers();
        setUsers(usersData);
        
        // Cargar visitas y calcular contadores
        const visits = await loadVisits();
        
        // Mantenemos los valores iniciales establecidos directamente
        updateCounts(visits, true);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    
    fetchData();
  }, [updateCounts]);
  
  // Manejar la adición de una nueva visita
  const handleAddVisit = async (userId: string) => {
    setLoading(true);
    
    try {
      // Create new visit record with Argentina timezone
      const now = new Date();
      // Convert to Argentina time
      const argDate = new Date(now.toLocaleString('en-US', {
        timeZone: 'America/Argentina/Buenos_Aires'
      }));
      
      const newVisit: GymVisit = {
        id: Date.now().toString(),
        userId,
        date: argDate.toISOString()
      };
      
      // Save to Google Sheets (and localStorage as backup)
      await saveVisit(newVisit);
      
      // Update counter locally for immediate feedback
      setCounts(prevCounts => ({
        ...prevCounts,
        [userId]: (prevCounts[userId] || 0) + 1
      }));
      
      console.log('Visit registered successfully');
    } catch (error) {
      console.error('Error registering visit:', error);
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
      console.log('Datos reiniciados correctamente');
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
                {counts[user.id] || 0}
                <span className="ml-2 text-2xl">
                  {(counts[user.id] || 0) > 10 ? '🔥' : 
                   (counts[user.id] || 0) > 5 ? '💪' : 
                   (counts[user.id] || 0) > 0 ? '👍' : '🏃‍♂️'}
                </span>
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