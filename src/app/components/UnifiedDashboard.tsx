'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { User, GymVisit, BodyMeasurement } from '@/data/types';
import { loadUsers, deleteVisit } from '@/data/sheetsService';

export default function UnifiedDashboard() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [visits, setVisits] = useState<GymVisit[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalUserId, setModalUserId] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalMuscle, setModalMuscle] = useState('');
  const [modalFat, setModalFat] = useState('');
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const modalDateRef = useRef<HTMLInputElement>(null);

  // Fecha de inicio del contador: 1 de enero de 2025
  const startDate = new Date(2025, 0, 1);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Obtener información del usuario actual
        const userResponse = await fetch('/api/users');
        let currentUser = null;
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('🔍 DEBUG - Datos del usuario recibidos:', userData);
          console.log('🔍 DEBUG - ID del usuario:', userData.user.id, 'Tipo:', typeof userData.user.id);
          setUser(userData.user);
          currentUser = userData.user;
        }

        // Cargar todos los usuarios para estadísticas
        const usersData = await loadUsers();
        console.log('🔍 DEBUG - Usuarios cargados:', usersData);
        
        // Si no hay usuarios cargados pero tenemos un usuario actual, usarlo
        if (usersData.length === 0 && currentUser) {
          console.log('🔍 DEBUG - No hay usuarios cargados, usando usuario actual');
          setUsers([currentUser]);
        } else {
          setUsers(usersData);
        }

        // Obtener visitas solo si tenemos un usuario
        if (currentUser) {
          const visitsResponse = await fetch('/api/sheets?type=visits');
          if (visitsResponse.ok) {
            const visitsData = await visitsResponse.json();
            console.log('Datos de visitas recibidos:', visitsData);
            
            if (visitsData.visits && Array.isArray(visitsData.visits)) {
              console.log('🔍 DEBUG - Usuario actual ID:', currentUser.id, 'Tipo:', typeof currentUser.id);
              console.log('🔍 DEBUG - Total visitas recibidas:', visitsData.visits.length);
              console.log('🔍 DEBUG - Primeras 3 visitas:', visitsData.visits.slice(0, 3));
              
              // Filtrar solo las visitas del usuario actual
              const userVisits = visitsData.visits
                .filter((visit: { userId: string; id: string; date: string }) => {
                  const visitUserId = visit.userId;
                  const matches = visitUserId === currentUser.id;
                  console.log(`🔍 Comparando ${visitUserId} === ${currentUser.id}: ${matches}`);
                  return matches;
                });
              
              console.log('🔍 DEBUG - Visitas filtradas para usuario:', userVisits.length, userVisits);
              setVisits(userVisits);
            }
          }
        }

        // Cargar mediciones corporales desde Google Sheets
        const measurementsResponse = await fetch('/api/sheets?type=body');
        if (measurementsResponse.ok) {
          const measurementsData = await measurementsResponse.json();
          console.log('🔍 DEBUG - Mediciones corporales recibidas:', measurementsData);
          setBodyMeasurements(measurementsData.bodyMeasurements || []);
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

  // Calcular estadísticas para el usuario actual
  const totalVisits = visits.length;

  // Función para agregar visita
  const handleAddVisit = async () => {
    if (!user) return;
    
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

  // Funciones para estadísticas y depurador
  const didUserAttendOnDate = (userId: string, date: Date) => {
    const targetDateLocal = date.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en zona local
    return visits.some(v => {
      if (v.userId !== userId) return false;
      const visitDate = new Date(v.date);
      const visitDateLocal = visitDate.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en zona local
      return visitDateLocal === targetDateLocal;
    });
  };

  const handleDeleteVisit = async (visitId: string) => {
    try {
      await deleteVisit(visitId);
      // Recargar datos
      const visitsResponse = await fetch('/api/sheets?type=visits');
      if (visitsResponse.ok) {
        const visitsData = await visitsResponse.json();
        if (visitsData.visits && Array.isArray(visitsData.visits)) {
          const userVisits = visitsData.visits
            .filter((visit: { userId: string; id: string; date: string }) => visit.userId === user?.id);
          setVisits(userVisits);
        }
      }
    } catch (error) {
      console.error('Error eliminando visita:', error);
    }
  };

  const handleAddVisitForDate = async (userId: string, dateString: string) => {
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
            userId: userId,
            date: new Date(dateString).toISOString(),
          },
        }),
      });

      if (response.ok) {
        // Recargar datos
        const visitsResponse = await fetch('/api/sheets?type=visits');
        if (visitsResponse.ok) {
          const visitsData = await visitsResponse.json();
          if (visitsData.visits && Array.isArray(visitsData.visits)) {
            const userVisits = visitsData.visits
              .filter((visit: { userId: string; id: string; date: string }) => visit.userId === user?.id);
            setVisits(userVisits);
          }
        }
      }
    } catch (error) {
      console.error('Error agregando visita:', error);
    }
  };

  const openModal = (userId: string) => {
    setModalUserId(userId);
    setModalDate(new Date().toISOString().split('T')[0]);
    setModalMuscle('');
    setModalFat('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalUserId('');
    setModalDate('');
    setModalMuscle('');
    setModalFat('');
  };

  const saveBodyMeasurement = async () => {
    if (!modalMuscle || !modalFat || !modalDate) return;
    
    setSavingMeasurement(true);
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'body',
          bodyMeasurement: {
            id: Date.now().toString(),
            userId: modalUserId,
            date: new Date(modalDate).toISOString(),
            muscle: parseFloat(modalMuscle),
            fat: parseFloat(modalFat),
          },
        }),
      });

      if (response.ok) {
        // Recargar mediciones
        const measurementsResponse = await fetch('/api/sheets?type=body');
        if (measurementsResponse.ok) {
          const measurementsData = await measurementsResponse.json();
          setBodyMeasurements(measurementsData.bodyMeasurements || []);
        }
        closeModal();
      }
    } catch (error) {
      console.error('Error guardando medición:', error);
    } finally {
      setSavingMeasurement(false);
    }
  };

  // Calcular días de la semana actual
  const currentWeekDays: Date[] = [];
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, etc.
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar para que lunes sea el primer día
  startOfWeek.setDate(today.getDate() + mondayOffset);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    currentWeekDays.push(day);
  }

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Sección PersonalDashboard - Saludo y contador principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Hola, {user.name}! 👋
          </h2>
          
          <div className="mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {totalVisits} 🔥
            </div>
            <p className="text-gray-600 mb-4">Total de visitas al gym</p>
            
            <button
              onClick={handleAddVisit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <span>🏋️</span>
              <span>+1</span>
            </button>
          </div>
        </div>
      </div>


      {/* Sección de Estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            📊 Estadísticas
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Estadísticas generales y Porcentajes de asistencia unidos */}
        <div className="mb-6">
          <div className="bg-white border rounded-lg p-4">
            {/* Título dentro de la card */}
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📈✔️ Porcentajes de asistencia
            </h4>
            
            {/* Estadísticas generales dentro de la misma card */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">
                Inicio del conteo: 1 de enero de 2025
              </div>
              <div className="text-sm text-gray-600">
                Días transcurridos: {totalDays} días
              </div>
            </div>
            {users.map(userItem => {
              // Usar todas las visitas para el usuario actual (Gabi)
              const userVisits = userItem.id === user?.id ? visits : [];
              const attendancePercentage = totalDays > 0 ? (userVisits.length / totalDays * 100).toFixed(1) : '0.0';
              
              console.log(`🔍 DEBUG - Usuario: ${userItem.name}, ID: ${userItem.id}, Visitas: ${userVisits.length}`);
              
              return (
                <div key={userItem.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{userItem.name}</span>
                    <span className="text-sm text-gray-600">{attendancePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(parseFloat(attendancePercentage), 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userVisits.length} visitas de {totalDays} días posibles
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asistencia semana actual */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            📅 Asistencia semana (lunes a domingo)
          </h4>
          <div className="bg-white border rounded-lg">
            {/* Header con días de la semana */}
            <div className="grid grid-cols-8 gap-1 p-2 bg-indigo-50 border-b border-indigo-200">
              <div className="col-span-1 font-medium text-indigo-900 text-sm"></div>
              {currentWeekDays.map((date, index) => {
                console.log(`🔍 DEBUG - Header ${index}: ${date.toLocaleDateString('en-CA')} (${date.toLocaleDateString('es-ES', {weekday: 'long'})})`);
                return (
                  <div key={index} className="col-span-1 text-center">
                    <div className="text-xs text-indigo-600 font-medium">
                      {['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'][index]}
                    </div>
                    <div className="text-xs text-indigo-800 font-bold">
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Contenido de la tabla con scroll */}
            <div className="bg-white rounded-b-lg">
              {users.map(userItem => {
                // Solo mostrar datos para el usuario actual (Gabi)
                if (userItem.id !== user?.id) return null;
                
                return (
                  <div key={userItem.id} className="grid grid-cols-8 gap-1 p-2 border-t border-indigo-100">
                    <div className="col-span-1 font-medium text-indigo-900 flex items-center">{userItem.name}</div>
                    {currentWeekDays.map((date, index) => {
                      const attended = didUserAttendOnDate(userItem.id, date);
                      const isFuture = date > today;
                      console.log(`🔍 DEBUG - ${userItem.name} ${date.toLocaleDateString('en-CA')} (${date.toLocaleDateString('es-ES', {weekday: 'long'})}): attended=${attended}, isFuture=${isFuture}`);
                      return (
                        <div key={index} className="col-span-1 flex justify-center items-center">
                          {isFuture ? (
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-400 text-xl">–</span>
                            </div>
                          ) : attended ? (
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-xl">✅</span>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                              <span className="text-red-500 text-xl">❌</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Componente de depuración - Últimas visitas */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <details open={false}>
            <summary className="cursor-pointer font-medium text-gray-700 flex items-center">
              <span className="mr-2">▶️</span>
              🔍 Depuración - Visitas recientes ({visits.length})
            </summary>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-600 mb-3">Últimos 10 días</div>
              {Array.from({length: 10}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en zona local
                const visitsOnDate = visits.filter(v => {
                  const visitDate = new Date(v.date);
                  const visitDateLocal = visitDate.toLocaleDateString('en-CA');
                  return visitDateLocal === dateString;
                });
                
                return (
                  <div key={dateString} className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">{dateString} ({new Intl.DateTimeFormat('es-ES', {weekday: 'long'}).format(date)})</div>
                    <div className="mt-1 ml-2">
                      {users.map(userItem => {
                        // Solo mostrar datos para el usuario actual (Gabi)
                        if (userItem.id !== user?.id) return null;
                        
                        const userVisits = visitsOnDate.filter(v => v.userId === userItem.id);
                        return (
                          <div key={userItem.id} className={`${userVisits.length > 0 ? 'text-green-600' : 'text-red-500'} flex justify-between items-center`}>
                            <div>
                              {userItem.name}: {userVisits.length > 0 ? `✅ (${userVisits.length} visitas)` : '❌ No registrado'}
                              {userVisits.length > 0 && (
                                <div className="text-xs text-gray-500 ml-4">
                                  {userVisits.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                      <div>ID: {v.id} - Hora: {new Date(v.date).toLocaleTimeString()}</div>
                                      <button 
                                        onClick={() => handleDeleteVisit(v.id)}
                                        className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded ml-2"
                                        title="Eliminar esta visita"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {userVisits.length === 0 && (
                              <button 
                                onClick={() => handleAddVisitForDate(userItem.id, dateString)}
                                className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                              >
                                Registrar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        </div>

        {/* Tabla de mediciones corporales */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              📏 Mediciones corporales
            </h4>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">% Masa muscular</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">% Grasa</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userItem => {
                  // Solo mostrar datos para el usuario actual (Gabi)
                  if (userItem.id !== user?.id) return null;
                  
                  const userMeasurements = bodyMeasurements
                    .filter(m => m.userId === userItem.id)
                    .sort((a, b) => b.date.localeCompare(a.date));
                  const measurementsToShow = userMeasurements; // Siempre mostrar todas
                  
                  console.log(`🔍 DEBUG - Mediciones para ${userItem.name}:`, userMeasurements.length, userMeasurements);
                  
                  if (measurementsToShow.length === 0) {
                    return (
                      <tr key={userItem.id + '-empty'} className="border-t">
                        <td className="px-2 py-1 font-medium align-top text-gray-900">{userItem.name}
                          <button onClick={() => openModal(userItem.id)} className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">+</button>
                        </td>
                        <td className="px-2 py-1 text-gray-500" colSpan={3}>Sin mediciones</td>
                      </tr>
                    );
                  }
                  return measurementsToShow.map((m, idx) => {
                    const prev = userMeasurements[userMeasurements.findIndex(mm => mm.id === m.id) + 1];
                    let muscleChange: string | null = null;
                    let fatChange: string | null = null;
                    if (prev) {
                      const muscleDiff = m.muscle - prev.muscle;
                      const fatDiff = m.fat - prev.fat;
                      if (muscleDiff !== 0) {
                        const sign = muscleDiff > 0 ? '+' : '';
                        muscleChange = `${sign}${muscleDiff.toFixed(1)}%`;
                      }
                      if (fatDiff !== 0) {
                        const sign = fatDiff > 0 ? '+' : '';
                        fatChange = `${sign}${fatDiff.toFixed(1)}%`;
                      }
                    }
                    return (
                      <tr key={userItem.id + m.id} className="border-t">
                        {idx === 0 && (
                          <td rowSpan={measurementsToShow.length} className="px-2 py-1 font-medium align-top text-gray-900">{userItem.name}
                            <button onClick={() => openModal(userItem.id)} className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">+</button>
                          </td>
                        )}
                        <td className="px-2 py-1 text-gray-800 font-medium text-xxs">{m.date}</td>
                        <td className="px-2 py-1 text-gray-900 font-bold">
                          {typeof m.muscle === 'number' && !isNaN(m.muscle) ? m.muscle + '%' : <span className="text-gray-400">–</span>}
                          {muscleChange && (
                            <span className={`ml-1 text-xxs ${parseFloat(muscleChange) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {muscleChange}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-gray-900 font-bold">
                          {typeof m.fat === 'number' && !isNaN(m.fat) ? m.fat + '%' : <span className="text-gray-400">–</span>}
                          {fatChange && (
                            <span className={`ml-1 text-xxs ${parseFloat(fatChange) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                              {fatChange}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para agregar mediciones corporales */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Agregar Medición Corporal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  ref={modalDateRef}
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">% Masa muscular</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={modalMuscle}
                  onChange={(e) => setModalMuscle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">% Grasa</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={modalFat}
                  onChange={(e) => setModalFat(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveBodyMeasurement}
                disabled={savingMeasurement || !modalMuscle || !modalFat || !modalDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {savingMeasurement ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
