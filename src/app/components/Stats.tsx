'use client';

import { useState, useEffect } from 'react';
import { User } from '@/data/types';
import { loadUsers, loadVisits } from '@/data/sheetsService';

export default function Stats() {
  const [users, setUsers] = useState<User[]>([]);
  const [visitsByDate, setVisitsByDate] = useState<Record<string, { [userId: string]: boolean }>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar usuarios y visitas
        const [usersData, visitsData] = await Promise.all([
          loadUsers(),
          loadVisits()
        ]);
        
        setUsers(usersData);
        
        // Procesar visitas por fecha
        const visitMap: Record<string, { [userId: string]: boolean }> = {};
        
        visitsData.forEach(visit => {
          const dateStr = visit.date.split('T')[0]; // Get YYYY-MM-DD part
          
          if (!visitMap[dateStr]) {
            visitMap[dateStr] = {};
          }
          
          visitMap[dateStr][visit.userId] = true;
        });
        
        setVisitsByDate(visitMap);
      } catch (error) {
        console.error('Error cargando datos para estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Get sorted dates (most recent first)
  const sortedDates = Object.keys(visitsByDate).sort().reverse();
  
  // Format date to a more readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getConsecutiveDays = () => {
    if (!sortedDates.length) return 0;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // If today doesn't have a visit, return 0
    if (sortedDates[0] !== today) return 0;
    
    let consecutiveDays = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDateObj = new Date(sortedDates[i-1]);
      const prevDateObj = new Date(sortedDates[i]);
      
      // Check if dates are consecutive
      const diffTime = currentDateObj.getTime() - prevDateObj.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  };
  
  const consecutiveDays = getConsecutiveDays();
  
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto mt-8 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">📊 Estadísticas</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">
            <span className="inline-block animate-spin">⏳</span> Cargando estadísticas...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📊 Estadísticas</h2>
      
      {consecutiveDays > 0 && (
        <div className="bg-green-100 p-4 rounded-lg mb-4 shadow-md">
          <p className="text-green-800 flex items-center">
            <span className="text-2xl mr-2">🔥</span>
            <span className="font-bold">{consecutiveDays}</span> días consecutivos yendo al gimnasio!
          </p>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-medium mb-4 text-gray-800 flex items-center">
          <span className="text-xl mr-2">📅</span> Historial
        </h3>
        
        {sortedDates.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">📝 No hay visitas registradas aún.</p>
            <p className="text-sm text-gray-500">¡Comienza a registrar tus visitas al gimnasio!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedDates.map(date => (
              <li key={date} className="border-b pb-2 hover:bg-gray-50 rounded p-2 transition-colors">
                <div className="font-medium text-gray-800 flex items-center">
                  <span className="text-blue-500 mr-2">📅</span>
                  {formatDate(date)}
                </div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {users.map(user => (
                    <div 
                      key={user.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        visitsByDate[date][user.id] 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-200 text-gray-600'
                      } transition-all hover:scale-105`}
                    >
                      {user.name} {visitsByDate[date][user.id] ? '✅' : '❌'}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 