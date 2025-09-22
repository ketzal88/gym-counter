'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, GymVisit, BodyMeasurement } from '@/data/types';

export default function PersonalDashboard() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [visits, setVisits] = useState<GymVisit[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
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
                .filter((visit: any) => {
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

          // Obtener mediciones corporales del usuario
          const bodyMeasurementsResponse = await fetch('/api/sheets?type=body');
          if (bodyMeasurementsResponse.ok) {
            const bodyData = await bodyMeasurementsResponse.json();
            console.log('Datos de mediciones corporales recibidos:', bodyData);
            
            // Filtrar solo las mediciones del usuario actual
            if (bodyData.bodyMeasurements && Array.isArray(bodyData.bodyMeasurements)) {
              const userBodyMeasurements = bodyData.bodyMeasurements
                .filter((measurement: any) => measurement.userId === userData.user.id);
              
              console.log('Mediciones corporales filtradas para usuario:', userBodyMeasurements);
              setBodyMeasurements(userBodyMeasurements);
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

  // Calcular estadísticas basadas en las visitas reales
  const today = new Date().toISOString().split('T')[0];
  const visitedToday = visits.some(visit => visit.date.startsWith(today));
  const lastVisit = visits.length > 0 ? new Date(visits[0].date) : null;
  
  // Calcular racha actual
  const calculateStreak = () => {
    if (visits.length === 0) return 0;
    
    const sortedVisits = [...visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    
    for (const visit of sortedVisits) {
      const visitDate = new Date(visit.date);
      const daysDiff = Math.floor((currentDate.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff === streak + 1) {
        // Día siguiente, continuar la racha
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateStreak();
  const totalVisits = visits.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header personalizado */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Hola, {user.name}! 👋
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalVisits}</div>
            <div className="text-sm text-blue-800">Total de visitas</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
            <div className="text-sm text-green-800">Racha actual</div>
          </div>
          
          <div className={`p-4 rounded-lg ${visitedToday ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${visitedToday ? 'text-green-600' : 'text-gray-600'}`}>
              {visitedToday ? '✅' : '❌'}
            </div>
            <div className={`text-sm ${visitedToday ? 'text-green-800' : 'text-gray-800'}`}>
              {visitedToday ? '¡Fuiste hoy!' : 'No fuiste hoy'}
            </div>
          </div>
        </div>

        {lastVisit && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-900">
              <strong className="text-gray-700">Última visita:</strong> <span className="text-gray-900">{lastVisit.toLocaleDateString('es-ES')}</span> a las <span className="text-gray-900">{lastVisit.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas personales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Tus Estadísticas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Visitas esta semana</h4>
            <div className="text-3xl font-bold text-blue-600">
              {visits.filter(visit => {
                const visitDate = new Date(visit.date);
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay()); // Lunes de esta semana
                weekStart.setHours(0, 0, 0, 0);
                
                return visitDate >= weekStart && visitDate <= today;
              }).length}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Visitas este mes</h4>
            <div className="text-3xl font-bold text-green-600">
              {visits.filter(visit => {
                const visitDate = new Date(visit.date);
                const today = new Date();
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                
                return visitDate >= monthStart && visitDate <= today;
              }).length}
            </div>
          </div>
        </div>
      </div>

      {/* Mediciones corporales */}
      {bodyMeasurements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💪 Composición Corporal</h3>
          
          <div className="space-y-3">
            {bodyMeasurements
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map((measurement, index) => {
                const prevMeasurement = index < bodyMeasurements.length - 1 ? 
                  bodyMeasurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[index + 1] : null;
                
                const muscleChange = prevMeasurement ? measurement.muscle - prevMeasurement.muscle : 0;
                const fatChange = prevMeasurement ? measurement.fat - prevMeasurement.fat : 0;
                
                return (
                  <div key={measurement.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">
                        {new Date(measurement.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">Músculo</div>
                        <div className="text-blue-600">
                          {measurement.muscle}%
                          {muscleChange !== 0 && (
                            <span className={`ml-1 ${muscleChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({muscleChange > 0 ? '+' : ''}{muscleChange.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">Grasa</div>
                        <div className="text-orange-600">
                          {measurement.fat}%
                          {fatChange !== 0 && (
                            <span className={`ml-1 ${fatChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({fatChange > 0 ? '+' : ''}{fatChange.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Historial de visitas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Historial de Visitas</h3>
        
        {visits.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tienes visitas registradas aún</p>
        ) : (
          <div className="space-y-2">
            {visits
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((visit) => (
              <div key={visit.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{new Date(visit.date).toLocaleDateString('es-ES')}</span>
                  <span className="text-gray-500 ml-2">{new Date(visit.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className="text-green-600 font-medium">✅</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
