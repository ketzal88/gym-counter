'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Group, GymVisit } from '@/data/types';
import MemberSearch from './MemberSearch';
import { useGroups } from '@/hooks/useGroups';
import { useGroupData } from '@/hooks/useGroupData';

export default function TeamDashboard() {
  const { data: session } = useSession();
  
  // Usar hooks optimizados
  const { groups, loading: loadingGroups, refreshGroups } = useGroups();
  const { groupData, loading: loadingGroupData } = useGroupData(groups);
  
  // Estados locales
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  
  // Estados para editar grupo
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [updatingGroup, setUpdatingGroup] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);

  // Efecto para seleccionar el primer grupo automáticamente
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    setCreatingGroup(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim(),
          isPublic: false
        }),
      });

      if (response.ok) {
        await refreshGroups();
        setShowCreateGroup(false);
        setNewGroupName('');
        setNewGroupDescription('');
      }
    } catch (error) {
      console.error('Error creando grupo:', error);
    } finally {
      setCreatingGroup(false);
    }
  };

  const updateGroup = async () => {
    if (!selectedGroup || !editGroupName.trim()) return;

    setUpdatingGroup(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          action: 'update',
          name: editGroupName.trim(),
          description: editGroupDescription.trim(),
        }),
      });

      if (response.ok) {
        await refreshGroups();
        setShowEditGroup(false);
        setEditGroupName('');
        setEditGroupDescription('');
        // Actualizar el grupo seleccionado localmente
        setSelectedGroup({ ...selectedGroup, name: editGroupName.trim(), description: editGroupDescription.trim() });
      }
    } catch (error) {
      console.error('Error actualizando grupo:', error);
    } finally {
      setUpdatingGroup(false);
    }
  };

  const leaveGroup = async () => {
    if (!selectedGroup || !session?.user?.email) return;

    setLeavingGroup(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          action: 'leave',
          userEmail: session.user.email,
        }),
      });

      if (response.ok) {
        await refreshGroups();
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error saliendo del grupo:', error);
    } finally {
      setLeavingGroup(false);
    }
  };

  const didUserAttendOnDate = (userId: string, date: Date, visits: GymVisit[]) => {
    const targetDateLocal = date.toLocaleDateString('en-CA');
    return visits.some(v => {
      if (v.userId !== userId) return false;
      
      const visitDate = new Date(v.date);
      const visitDateLocal = visitDate.toLocaleDateString('en-CA');
      return visitDateLocal === targetDateLocal;
    });
  };

  const getTotalVisits = (userId: string, visits: GymVisit[]) => {
    return visits.filter(v => v.userId === userId).length;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calcular días de la semana actual
  const currentWeekDays: Date[] = [];
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + mondayOffset);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    currentWeekDays.push(day);
  }

  if (loadingGroups) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando equipos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Modal para crear grupo */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Crear Nuevo Grupo</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del grupo *
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Mi Grupo de Gym"
                />
              </div>
              <div>
                <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  id="groupDescription"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Grupo para motivarnos mutuamente"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
            <button
              onClick={createGroup}
              disabled={!newGroupName.trim() || creatingGroup}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center"
            >
              {creatingGroup ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                'Crear Grupo'
              )}
            </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar grupo */}
      {showEditGroup && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Grupo</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="editGroupName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del grupo *
                </label>
                <input
                  type="text"
                  id="editGroupName"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Mi Grupo de Gym"
                />
              </div>
              <div>
                <label htmlFor="editGroupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  id="editGroupDescription"
                  value={editGroupDescription}
                  onChange={(e) => setEditGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Grupo para motivarnos mutuamente"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditGroup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateGroup}
                  disabled={!editGroupName.trim() || updatingGroup}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center"
                >
                  {updatingGroup ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Grupo'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para salir del grupo */}
      {leavingGroup && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">¿Salir del Grupo?</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres salir del grupo <strong>&ldquo;{selectedGroup.name}&rdquo;</strong>?
              <br />
              <span className="text-sm text-red-600">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setLeavingGroup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={leaveGroup}
                disabled={leavingGroup}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center"
              >
                {leavingGroup ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saliendo...
                  </>
                ) : (
                  'Salir del Grupo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards por Equipo - Contadores Anuales + Tabla Semanal */}
      <div className="space-y-6">
        {loadingGroupData ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <p className="text-gray-600">Cargando datos de los equipos...</p>
            </div>
          </div>
        ) : (
          groups.map((group) => {
            // Obtener datos de este grupo específico
            const groupInfo = groupData[group.id];
            if (!groupInfo) return null;
            
            const groupMembersList = groupInfo.members;
            const groupVisitsList = groupInfo.visits;
            
            return (
              <div key={group.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100">
                {/* Header del equipo */}
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-800">{group.name}</h4>
                  {group.description && (
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  )}
                </div>
                
                {/* Contadores de miembros (Asistencia Anual) */}
                <div 
                  className="gap-4 mb-6" 
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.min(groupMembersList.length, 2)}, 1fr)`,
                    gap: '1rem'
                  }}
                >
                  {groupMembersList.map((member) => {
                    const totalVisits = getTotalVisits(member.id, groupVisitsList);
                    const attendedToday = didUserAttendOnDate(member.id, today, groupVisitsList);
                    
                    return (
                      <div key={member.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border-2 border-blue-100 hover:border-blue-200 transition-all duration-200 shadow-lg">
                        <div className="text-lg font-bold text-gray-800 mb-2">
                          {member.name}
                        </div>
                        <div className="text-3xl font-black text-blue-600 mb-2">
                          {totalVisits} 🔥
                        </div>
                        <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          attendedToday ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {attendedToday ? '✅ Fue hoy' : '❌ No fue hoy'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tabla Semanal */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    📅 Asistencia semana (lunes a domingo)
                  </h4>
                  
                  {/* Generar días de la semana actual */}
                  {(() => {
                    const today = new Date();
                    const currentDay = today.getDay(); // 0 = domingo, 1 = lunes, etc.
                    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Ajustar para que lunes sea el primer día
                    const monday = new Date(today);
                    monday.setDate(today.getDate() + mondayOffset);
                    
                    const currentWeekDays: Date[] = [];
                    for (let i = 0; i < 7; i++) {
                      const day = new Date(monday);
                      day.setDate(monday.getDate() + i);
                      currentWeekDays.push(day);
                    }
                    
                    return (
                      <>
                        {/* Header con días de la semana */}
                        <div className="grid grid-cols-8 gap-1 p-2 bg-indigo-50 border-b border-indigo-200">
                          <div className="col-span-1 text-center font-medium text-indigo-900 text-sm">
                            
                          </div>
                          {currentWeekDays.map((date, index) => {
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
                        
                        {/* Contenido de la tabla */}
                        <div>
                          {groupMembersList.map(userItem => {
                            return (
                              <div key={userItem.id} className="grid grid-cols-8 gap-1 p-2 border-t border-indigo-100">
                                <div className="col-span-1 font-medium text-indigo-900 flex items-center text-sm">
                                  {userItem.name}
                                </div>
                                {currentWeekDays.map((date, index) => {
                                  const attended = didUserAttendOnDate(userItem.id, date, groupVisitsList);
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
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedGroup && (
        <>


          {/* 3. Búsqueda de miembros - Invitar amigos al grupo */}
          <MemberSearch 
            groupId={selectedGroup.id} 
            onInviteSent={refreshGroups}
          />
        </>
      )}

      {groups.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-gray-500 mb-4">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-lg">No tienes grupos todavía</p>
            <p className="text-sm">Crea tu primer grupo para empezar a competir con amigos</p>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            disabled={creatingGroup}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            {creatingGroup ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creando...</span>
              </>
            ) : (
              <span>Crear Primer Grupo</span>
            )}
          </button>
        </div>
      )}

      {/* Header con selección de grupo - AL FINAL */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              👥 Equipos a los que perteneces
            </h2>
            {selectedGroup && (
              <div className="text-gray-600">
                <span className="font-medium">{selectedGroup.name}</span>
                {selectedGroup.description && (
                  <span className="ml-2">- {selectedGroup.description}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {groups.length > 0 && (
              <select
                value={selectedGroup?.id || ''}
                onChange={(e) => {
                  const group = groups.find(g => g.id === e.target.value);
                  setSelectedGroup(group || null);
                }}
                disabled={loadingGroups}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">{loadingGroups ? 'Cargando...' : 'Seleccionar grupo'}</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
            
            {selectedGroup && (
              <>
                <button
                  onClick={() => {
                    setEditGroupName(selectedGroup.name);
                    setEditGroupDescription(selectedGroup.description || '');
                    setShowEditGroup(true);
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1"
                  title="Editar grupo"
                >
                  <span>✏️</span>
                  <span className="hidden sm:inline">Editar</span>
                </button>
                
                <button
                  onClick={() => setLeavingGroup(true)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1"
                  title="Salir del grupo"
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            )}
            
          </div>
        </div>
      </div>

      {/* Botón para crear grupo al final */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <button
          onClick={() => setShowCreateGroup(true)}
          disabled={creatingGroup}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center space-x-2 mx-auto"
        >
          {creatingGroup ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creando...</span>
            </>
          ) : (
            <>
              <span>➕</span>
              <span>Crear Nuevo Grupo</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
