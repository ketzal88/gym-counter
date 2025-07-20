'use client';

import { useState, useEffect } from 'react';
import { User, GymVisit, BodyMeasurement } from '@/data/types';
import { loadUsers, loadVisits, saveVisit, deleteVisit } from '@/data/sheetsService';
import { getBodyMeasurements, addBodyMeasurement } from '@/data/storage';
import { useRef } from 'react';

export default function Stats() {
  const [users, setUsers] = useState<User[]>([]);
  const [userVisits, setUserVisits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [visitsData, setVisitsData] = useState<GymVisit[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Fecha de inicio del contador: 1 de enero de 2025
  const startDate = new Date(2025, 0, 1); // Meses en JS son 0-indexed, enero es 0
  
  // Calcular días transcurridos
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Add state for body measurements and modal
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [showAllMeasurements, setShowAllMeasurements] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalUserId, setModalUserId] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalMuscle, setModalMuscle] = useState('');
  const [modalFat, setModalFat] = useState('');
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const modalDateRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar usuarios y visitas
        const [usersData, visits] = await Promise.all([
          loadUsers(),
          loadVisits()
        ]);
        
        setUsers(usersData);
        setVisitsData(visits);
        
        // Contar todas las visitas por usuario
        const visitCounts: Record<string, number> = {};
        
        // Inicializar contadores en cero
        usersData.forEach(user => {
          visitCounts[user.id] = 0;
        });
        
        // Contar todas las visitas
        visits.forEach(visit => {
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
  }, [refreshCounter]); // Dependencia para recargar cuando cambie el contador

  // Load body measurements on mount and when refreshCounter changes
  useEffect(() => {
    getBodyMeasurements().then(setBodyMeasurements);
  }, [refreshCounter]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'gymcounter_refresh') {
        handleRefresh();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  
  // Función para forzar recarga de datos
  const handleRefresh = () => {
    // Incrementar contador para disparar el useEffect
    setRefreshCounter(prev => prev + 1);
  };
  
  // Función para registrar visita manual
  const handleAddVisit = async (userId: string, dateString: string) => {
    if (!window.confirm(`¿Registrar visita para el día ${dateString}?`)) {
      return;
    }
    
    try {
      // Parse date string as local date (YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0); // Local time, mediodía
      
      const visit: GymVisit = {
        id: Date.now().toString(),
        userId,
        date: date.toISOString()
      };
      
      const success = await saveVisit(visit);
      
      if (success) {
        alert(`Visita registrada con éxito para ${dateString}`);
        handleRefresh(); // Recargar datos
      } else {
        alert("Error al registrar la visita. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al registrar visita:", error);
      alert("Error al registrar la visita: " + error);
    }
  };
  
  // Función para eliminar una visita
  const handleDeleteVisit = async (visitId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta visita?')) {
      return;
    }
    
    try {
      const success = await deleteVisit(visitId);
      
      if (success) {
        alert('Visita eliminada con éxito');
        handleRefresh(); // Recargar datos
      } else {
        alert("Error al eliminar la visita. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al eliminar visita:", error);
      alert("Error al eliminar la visita: " + error);
    }
  };
  
  // Handler to open modal
  const openModal = (userId: string) => {
    setModalUserId(userId);
    setModalDate('');
    setModalMuscle('');
    setModalFat('');
    setShowModal(true);
    setTimeout(() => {
      if (modalDateRef.current) modalDateRef.current.focus();
    }, 100);
  };

  // Handler to save measurement
  const handleSaveMeasurement = async () => {
    if (!modalUserId || !modalDate || !modalMuscle || !modalFat) {
      alert('Completa todos los campos');
      return;
    }
    setSavingMeasurement(true);
    const success = await addBodyMeasurement(
      modalUserId,
      modalDate,
      parseFloat(modalMuscle),
      parseFloat(modalFat)
    );
    setSavingMeasurement(false);
    if (success) {
      setShowModal(false);
      handleRefresh();
    } else {
      alert('Error al guardar la medición');
    }
  };
  
  // Formato de fecha en español
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Formato corto para fechas recientes
  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      weekday: 'short'
    }).format(date);
  };
  
  // Función para obtener los días de la semana actual (lunes a domingo)
  const getCurrentWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (domingo) - 6 (sábado)
    // Calcular el lunes (si es domingo, retroceder 6 días)
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    // Generar los 7 días de la semana
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };
  
  // Función para verificar si un usuario asistió en una fecha específica
  const didUserAttendOnDate = (userId: string, date: Date) => {
    // Para comparar fechas, sólo necesitamos año-mes-día
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
        
    // Buscar visitas coincidentes
    const matchingVisits = visitsData.filter(visit => {
      // Parsear la fecha de visita
      const visitDate = new Date(visit.date);
      const visitYear = visitDate.getFullYear();
      const visitMonth = visitDate.getMonth();
      const visitDay = visitDate.getDate();
      
      // Comparar sólo año, mes y día (ignorando horas, minutos, etc.)
      const matches = visit.userId === userId && 
                     visitYear === year && 
                     visitMonth === month && 
                     visitDay === day;    
      
      return matches;
    });
    
    return matchingVisits.length > 0;
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
  
  const currentWeekDays = getCurrentWeekDays();
  
  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📊 Estadísticas</h2>
        <button 
          onClick={handleRefresh} 
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
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
        
        {/* Componente para la semana actual (lunes a domingo) con scroll vertical */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mt-6">
          <h3 className="font-medium mb-3 text-gray-800 flex items-center">
            <span className="text-xl mr-2">📅</span> Asistencia semana actual (lunes a domingo)
          </h3>
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg">
            {/* Tabla de encabezado fija */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-100 to-blue-100 shadow-sm rounded-t-lg">
              <div className="grid grid-cols-8 gap-1 p-2 font-medium text-indigo-900">
                <div className="col-span-1"></div>
                {currentWeekDays.map((date, index) => (
                  <div key={index} className="col-span-1 text-center px-1 py-2">
                    <div className="text-xs">{formatShortDate(date).split(' ')[0]}</div>
                    <div className="text-sm font-bold">{formatShortDate(date).split(' ')[1]}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Contenido de la tabla con scroll */}
            <div className="bg-white rounded-b-lg">
              {users.map(user => (
                <div key={user.id} className="grid grid-cols-8 gap-1 p-2 border-t border-indigo-100">
                  <div className="col-span-1 font-medium text-indigo-900 flex items-center">{user.name}</div>
                  {currentWeekDays.map((date, index) => {
                    const attended = didUserAttendOnDate(user.id, date);
                    const isFuture = date > today;
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
              ))}
            </div>
          </div>
        </div>
        
        {/* Componente de depuración - Últimas visitas */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <details open={false}>
            <summary className="font-medium text-gray-700 cursor-pointer">
              🔍 Depuración - Visitas recientes ({visitsData.length})
            </summary>
            
            {/* Verificador de fechas para los últimos 10 días */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Últimos 10 días</h4>
              <div className="space-y-2">
                {Array.from({length: 10}).map((_, i) => {
                  const dateObj = new Date();
                  dateObj.setDate(dateObj.getDate() - i);
                  const dateString = dateObj.toISOString().split('T')[0];
                  
                  const visitsOnDate = visitsData.filter(visit => {
                    const visitDate = new Date(visit.date);
                    return visitDate.getFullYear() === dateObj.getFullYear() &&
                           visitDate.getMonth() === dateObj.getMonth() &&
                           visitDate.getDate() === dateObj.getDate();
                  });
                  
                  const gabi = visitsOnDate.filter(v => v.userId === '1');
                  const ina = visitsOnDate.filter(v => v.userId === '2');
                  
                  return (
                    <div key={dateString} className="p-2 bg-white rounded border border-gray-200">
                      <div className="font-medium">{dateString} ({new Intl.DateTimeFormat('es-ES', {weekday: 'long'}).format(dateObj)})</div>
                      <div className="mt-1 ml-2">
                        <div className={`${gabi.length > 0 ? 'text-green-600' : 'text-red-500'} flex justify-between items-center`}>
                          <div>
                            Gabi: {gabi.length > 0 ? `✅ (${gabi.length} visitas)` : '❌ No registrado'}
                            {gabi.length > 0 && (
                              <div className="text-xs text-gray-500 ml-4">
                                {gabi.map((v, i) => (
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
                          {gabi.length === 0 && (
                            <button 
                              onClick={() => handleAddVisit('1', dateString)}
                              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                            >
                              Registrar
                            </button>
                          )}
                        </div>
                        <div className={`${ina.length > 0 ? 'text-green-600' : 'text-red-500'} flex justify-between items-center`}>
                          <div>
                            Iña: {ina.length > 0 ? `✅ (${ina.length} visitas)` : '❌ No registrado'}
                            {ina.length > 0 && (
                              <div className="text-xs text-gray-500 ml-4">
                                {ina.map((v, i) => (
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
                          {ina.length === 0 && (
                            <button 
                              onClick={() => handleAddVisit('2', dateString)}
                              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                            >
                              Registrar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
      </div>
      {/* Sección de mediciones corporales */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">📏</span> Mediciones corporales
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left text-gray-800 font-semibold">Usuario</th>
                <th className="px-2 py-1 text-left text-gray-800 font-semibold">Fecha</th>
                <th className="px-2 py-1 text-left text-gray-800 font-semibold">% Masa muscular</th>
                <th className="px-2 py-1 text-left text-gray-800 font-semibold">% Grasa</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const userMeasurements = bodyMeasurements
                  .filter(m => m.userId === user.id)
                  .sort((a, b) => b.date.localeCompare(a.date));
                const measurementsToShow = showAllMeasurements ? userMeasurements : userMeasurements.slice(0, 6);
                if (measurementsToShow.length === 0) {
                  // Show empty row with Registrar button
                  return (
                    <tr key={user.id + '-empty'} className="border-t">
                      <td className="px-2 py-1 font-medium align-top text-gray-900">{user.name}
                        <button onClick={() => openModal(user.id)} className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">+</button>
                      </td>
                      <td className="px-2 py-1 text-gray-500" colSpan={3}>Sin mediciones</td>
                    </tr>
                  );
                }
                return measurementsToShow.map((m, idx) => {
                  // Find previous measurement for this user
                  const prev = userMeasurements[userMeasurements.findIndex(mm => mm.id === m.id) + 1];
                  // Calculate changes
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
                    <tr key={user.id + m.id} className="border-t">
                      {idx === 0 && (
                        <td rowSpan={measurementsToShow.length} className="px-2 py-1 font-medium align-top text-gray-900">{user.name}
                          <button onClick={() => openModal(user.id)} className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">+</button>
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
                          <span className={`ml-1 text-xxs ${parseFloat(fatChange) < 0 ? 'text-green-600' : 'text-red-500'}`}>
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
          {bodyMeasurements.length > 6 && (
            <div className="mt-2 text-center">
              <button onClick={() => setShowAllMeasurements(s => !s)} className="text-blue-600 underline">
                {showAllMeasurements ? 'Mostrar menos' : 'Ver todas las mediciones'}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Modal para registrar medición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs">
            <h4 className="font-bold mb-2 text-gray-800">Registrar medición</h4>
            <div className="mb-2">
              <label className="block text-xs mb-1 text-gray-800">Fecha</label>
              <input ref={modalDateRef} type="date" className="w-full border rounded px-2 py-1 text-gray-900" value={modalDate} onChange={e => setModalDate(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="block text-xs mb-1 text-gray-800">% Masa muscular</label>
              <input type="number" min="0" max="100" step="0.1" className="w-full border rounded px-2 py-1 text-gray-900" value={modalMuscle} onChange={e => setModalMuscle(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="block text-xs mb-1 text-gray-800">% Grasa</label>
              <input type="number" min="0" max="100" step="0.1" className="w-full border rounded px-2 py-1 text-gray-900" value={modalFat} onChange={e => setModalFat(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800">Cancelar</button>
              <button onClick={handleSaveMeasurement} disabled={savingMeasurement} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                {savingMeasurement ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 