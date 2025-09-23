'use client';

import { useState, useEffect } from 'react';
import { GroupInvitation } from '@/data/types';

interface ExtendedGroupInvitation extends GroupInvitation {
  groupName?: string;
  groupDescription?: string;
}

export default function InvitationNotifications() {
  const [invitations, setInvitations] = useState<ExtendedGroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingToInvitation, setRespondingToInvitation] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error cargando invitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId: string, response: 'accepted' | 'declined') => {
    setRespondingToInvitation(invitationId);
    try {
      const apiResponse = await fetch('/api/invitations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          response,
        }),
      });

      if (apiResponse.ok) {
        // Remover la invitación de la lista
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        
        // Si se acepta, recargar la página para mostrar el nuevo grupo
        if (response === 'accepted') {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error respondiendo invitación:', error);
    } finally {
      setRespondingToInvitation(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Cargando invitaciones...</span>
          </div>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        📨 Invitaciones Pendientes ({invitations.length})
      </h3>
      
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Te invitaron al grupo <span className="text-blue-600">{invitation.groupName || invitation.groupId}</span>
                </p>
                {invitation.groupDescription && (
                  <p className="text-sm text-gray-600">
                    {invitation.groupDescription}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Invitado por: {invitation.inviterId}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(invitation.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => respondToInvitation(invitation.id, 'declined')}
                  disabled={respondingToInvitation === invitation.id}
                  className="bg-red-100 hover:bg-red-200 disabled:bg-gray-100 text-red-800 px-3 py-2 rounded-md text-sm transition-colors duration-200 flex items-center space-x-2"
                >
                  {respondingToInvitation === invitation.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>❌</span>
                      <span>Rechazar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => respondToInvitation(invitation.id, 'accepted')}
                  disabled={respondingToInvitation === invitation.id}
                  className="bg-green-100 hover:bg-green-200 disabled:bg-gray-100 text-green-800 px-3 py-2 rounded-md text-sm transition-colors duration-200 flex items-center space-x-2"
                >
                  {respondingToInvitation === invitation.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Aceptar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
