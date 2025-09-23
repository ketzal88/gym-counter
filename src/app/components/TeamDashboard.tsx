'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Group, User, GymVisit } from '@/data/types';
import { loadUsers } from '@/data/sheetsService';
import MemberSearch from './MemberSearch';

export default function TeamDashboard() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [groupVisits, setGroupVisits] = useState<GymVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
        if (data.groups.length > 0 && !selectedGroup) {
          setSelectedGroup(data.groups[0]);
        }
      } else {
        console.warn('Error cargando grupos, usando datos en cache si están disponibles');
      }
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  const fetchGroupData = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(`/api/groups/${selectedGroup.id}/members`);
      if (response.ok) {
        const data = await response.json();
        setGroupMembers(data.members || []);
        setGroupVisits(data.visits || []);
      } else {
        console.error('Error cargando datos de miembros del grupo:', response.statusText);
        // Fallback: cargar usuarios básicos
        const allUsers = await loadUsers();
        const members = allUsers.filter(user => 
          selectedGroup.members.includes(user.email)
        );
        setGroupMembers(members);
        setGroupVisits([]);
      }
    } catch (error) {
      console.error('Error cargando datos del grupo:', error);
      // Fallback: cargar usuarios básicos
      const allUsers = await loadUsers();
      const members = allUsers.filter(user => 
        selectedGroup.members.includes(user.email)
      );
      setGroupMembers(members);
      setGroupVisits([]);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (session) {
      fetchGroups();
    }
  }, [session, fetchGroups]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupData();
    }
  }, [selectedGroup, fetchGroupData]);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

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
        await fetchGroups();
        setShowCreateGroup(false);
        setNewGroupName('');
        setNewGroupDescription('');
      }
    } catch (error) {
      console.error('Error creando grupo:', error);
    }
  };

  const didUserAttendOnDate = (userId: string, date: Date) => {
    const targetDateLocal = date.toLocaleDateString('en-CA');
    return groupVisits.some(v => {
      if (v.userId !== userId) return false;
      
      const visitDate = new Date(v.date);
      const visitDateLocal = visitDate.toLocaleDateString('en-CA');
      return visitDateLocal === targetDateLocal;
    });
  };

  const getTotalVisits = (userId: string) => {
    return groupVisits.filter(v => v.userId === userId).length;
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

  if (loading) {
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
                  disabled={!newGroupName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
                >
                  Crear Grupo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {selectedGroup && (
        <>
          {/* 1. Grid de contadores de miembros (1-4) - PRINCIPAL */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center">
              📊 Contadores del Equipo
            </h3>
            
            <div 
              className="gap-4" 
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(2, 1fr)`,
                gap: '1rem'
              }}
            >
              {groupMembers.map((member) => {
                const totalVisits = getTotalVisits(member.id);
                const attendedToday = didUserAttendOnDate(member.id, today);
                
                return (
                  <div key={member.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border-2 border-blue-100 hover:border-blue-200 transition-all duration-200 shadow-lg">
                    <div className="text-lg font-bold text-gray-800 mb-3">
                      {member.name}
                    </div>
                    <div className="text-4xl font-black text-blue-600 mb-3">
                      {totalVisits} 🔥
                    </div>
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      attendedToday ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {attendedToday ? '✅ Fue hoy' : '❌ No fue hoy'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Asistencia semanal del equipo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📅 Asistencia Semanal del Equipo
            </h3>
            
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header con días de la semana */}
                <div className="grid gap-1 p-2 bg-indigo-50 border-b border-indigo-200 mb-2" 
                     style={{ gridTemplateColumns: `50px repeat(7, 1fr)` }}>
                  <div className="font-medium text-indigo-900 text-sm"></div>
                  {currentWeekDays.map((date, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-indigo-600 font-medium">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                      </div>
                      <div className="text-xs text-indigo-800 font-bold">
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Filas de miembros */}
                {groupMembers.map((member) => {
                  return (
                    <div key={member.id} 
                         className="grid gap-1 p-2 border-b border-gray-100 hover:bg-gray-50"
                         style={{ gridTemplateColumns: `50px repeat(7, 1fr)` }}>
                      <div className="font-medium text-gray-900 text-sm flex items-center">
                        {member.name}
                      </div>
                      {currentWeekDays.map((date, index) => {
                        const attended = didUserAttendOnDate(member.id, date);
                        const isFuture = date > today;
                        
                        return (
                          <div key={index} className="flex justify-center items-center">
                            {isFuture ? (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-gray-400 text-sm">–</span>
                              </div>
                            ) : attended ? (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-sm">✅</span>
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                                <span className="text-red-500 text-sm">❌</span>
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

          {/* 3. Búsqueda de miembros - Invitar amigos al grupo */}
          <MemberSearch 
            groupId={selectedGroup.id} 
            onInviteSent={fetchGroupData}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors duration-200"
          >
            Crear Primer Grupo
          </button>
        </div>
      )}

      {/* Header con selección de grupo - AL FINAL */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              👥 Team Attendance
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
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar grupo</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowCreateGroup(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Crear Grupo
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
