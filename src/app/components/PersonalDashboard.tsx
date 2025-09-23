'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, GymVisit } from '@/data/types';

export default function PersonalDashboard() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [visits, setVisits] = useState<GymVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Obtener información del usuario
        const userResponse = await fetch('/api/users');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('Datos del usuario recibidos:', userData);
          setUser(userData.user);
          
          // Obtener visitas del usuario después de tener el usuario
          const visitsResponse = await fetch('/api/sheets?type=visits');
          if (visitsResponse.ok) {
            const visitsData = await visitsResponse.json();
            console.log('Datos de visitas recibidos:', visitsData);
            
            // Filtrar solo las visitas del usuario actual
            if (visitsData.visits && Array.isArray(visitsData.visits)) {
              console.log('Usuario actual ID:', userData.user.id, 'Tipo:', typeof userData.user.id);
              
              const userVisits = visitsData.visits
                .filter((visit: { userId: string; id: string; date: string }) => {
                  // Los datos ahora vienen en formato: { id, userId, date }
                  const visitUserId = visit.userId;
                  const matches = visitUserId === userData.user.id;
                  console.log(`Comparando ${visitUserId} === ${userData.user.id}: ${matches}`);
                  return matches;
                });
              
              console.log('Visitas filtradas para usuario:', userVisits);
              setVisits(userVisits);
            }
          }

        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error cargando información del usuario</p>
      </div>
    );
  }

 
 const totalVisits = visits.length;

  // Función para agregar visita
  const handleAddVisit = async () => {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'visit',
          visit: {
            id: Date.now().toString(),
            userId: user.id,
            date: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        // Recargar las visitas
        const visitsResponse = await fetch('/api/sheets?type=visits');
        if (visitsResponse.ok) {
          const visitsData = await visitsResponse.json();
          if (visitsData.visits && Array.isArray(visitsData.visits)) {
            const userVisits = visitsData.visits
              .filter((visit: { userId: string; id: string; date: string }) => visit.userId === user.id);
            setVisits(userVisits);
          }
        }
      }
    } catch (error) {
      console.error('Error agregando visita:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header personalizado */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Hola, {user.name}! 👋
        </h2>
        
        {/* Contador personal - estilo original pero para una persona */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center">
            <div className="text-center">
              {/* <div className="text-2xl font-bold text-gray-900 mb-2">{user.name}</div> */}
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {totalVisits}
                <span className="text-2xl ml-2">🔥</span>
              </div>
              <button
                onClick={handleAddVisit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🏋️</span>
                <span>+1</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}