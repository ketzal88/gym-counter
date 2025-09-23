'use client';

import { useState, useEffect } from 'react';
import { User } from '@/data/types';

interface MemberSearchProps {
  groupId: string;
  onInviteSent: () => void;
}

export default function MemberSearch({ groupId, onInviteSent }: MemberSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchUsers = async (searchQuery: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al buscar usuarios');
        return;
      }

      setSearchResults(data.users || []);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (userEmail: string) => {
    setSendingInvite(userEmail);
    setError('');

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          inviteeEmail: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al enviar invitación');
        return;
      }

      // Limpiar búsqueda y notificar éxito
      setQuery('');
      setSearchResults([]);
      onInviteSent();
    } catch {
      setError('Error de conexión');
    } finally {
      setSendingInvite(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔍 Invitar Amigos al Grupo
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por nombre o email
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Escribe el nombre o email..."
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {loading && query.length >= 2 && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Buscando usuarios...</span>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Resultados:</h4>
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <button
                  onClick={() => sendInvitation(user.email)}
                  disabled={sendingInvite === user.email}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200 flex items-center space-x-2"
                >
                  {sendingInvite === user.email ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Invitar</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && searchResults.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No se encontraron usuarios con ese nombre o email
          </div>
        )}
      </div>
    </div>
  );
}
