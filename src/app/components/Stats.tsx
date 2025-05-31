'use client';

import { useState, useEffect } from 'react';
import { User, GymVisit } from '@/data/types';
import { loadUsers, loadVisits } from '@/data/sheetsService';

export default function Stats() {
  const [users, setUsers] = useState<User[]>([]);
  const [userVisits, setUserVisits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Fecha de inicio del contador: 3 de febrero de 2025
  const startDate = new Date(2025, 1, 3); // Meses en JS son 0-indexed, febrero es 1
  
  // Calcular días transcurridos
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar usuarios y visitas
        const [usersData, visitsData] = await Promise.all([
          loadUsers(),
          loadVisits()
        ]);
        
        setUsers(usersData);
        
        // Contar todas las visitas por usuario
        const visitCounts: Record<string, number> = {};
        
        // Inicializar contadores en cero
        usersData.forEach(user => {
          visitCounts[user.id] = 0;
        });
        
        // Contar todas las visitas
        visitsData.forEach(visit => {
          try {
            visitCounts[visit.userId] = (visitCounts[visit.userId] || 0) + 1;
          } catch (error) {
            console.error('Error procesando visita:', visit, error);
          }
        });
        
        setUserVisits(visitCounts);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos para estadísticas:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Formato de fecha en español
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
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
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-gray-700">
            <span className="font-bold">Inicio del conteo:</span> {formatDate(startDate)}
          </p>
          <p className="text-gray-700 mt-1">
            <span className="font-bold">Días transcurridos:</span> {totalDays} días
          </p>
        </div>
        
        <h3 className="font-medium mb-4 text-gray-800 flex items-center">
          <span className="text-xl mr-2">📈</span> Porcentajes de asistencia
        </h3>
        
        <div className="space-y-4">
          {users.map(user => {
            const visits = userVisits[user.id] || 0;
            const percentage = ((visits / totalDays) * 100).toFixed(1);
            
            // Determinar color basado en el porcentaje
            let barColor = 'bg-red-500';
            if (Number(percentage) > 40) barColor = 'bg-green-500';
            else if (Number(percentage) > 30) barColor = 'bg-yellow-500';
            else if (Number(percentage) > 20) barColor = 'bg-orange-500';
            
            return (
              <div key={user.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-800">{user.name}</span>
                  <span className="text-gray-700 font-bold">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`${barColor} h-4 rounded-full transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">{visits}</span> visitas de {totalDays} días posibles
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 