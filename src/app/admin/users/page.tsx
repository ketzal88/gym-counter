'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  subscribeToAllUsers,
  updateUserProfile,
  UserProfile
} from '@/services/db';

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const ADMIN_EMAIL = 'gabrielucc@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (!loading && !isAdmin) {
      router.push('/');
      return;
    }

    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToAllUsers((allUsers) => {
      setUsers(allUsers);
    });

    return () => unsubscribe();
  }, [user, loading, isAdmin, router]);

  const handleEditUser = (userToEdit: UserProfile) => {
    setSelectedUser(userToEdit);
    setMessage(null);
  };

  const handleSaveUser = async (userId: string, updates: Partial<UserProfile>) => {
    setUpdating(true);
    setMessage(null);

    try {
      await updateUserProfile(userId, updates);
      setMessage({
        type: 'success',
        text: '✅ Usuario actualizado exitosamente'
      });
      setSelectedUser(null);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      setMessage({
        type: 'error',
        text: '❌ Error al actualizar usuario'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Header />

        <UsersTable
          users={users}
          onEditUser={handleEditUser}
        />

        {selectedUser && (
          <EditUserModal
            user={selectedUser}
            onSave={handleSaveUser}
            onClose={() => setSelectedUser(null)}
            updating={updating}
          />
        )}

        {message && <MessageAlert message={message} />}
      </div>
    </div>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Cargando...</p>
      </div>
    </div>
  );
}

// Header Component
function Header() {
  const router = useRouter();

  return (
    <div className="mb-8">
      <button
        onClick={() => router.push('/')}
        className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
      >
        ← Volver al inicio
      </button>
      <h1 className="text-3xl font-bold mb-2">👥 Administración de Usuarios</h1>
      <p className="text-gray-400">
        Gestiona usuarios y sus suscripciones
      </p>
    </div>
  );
}

// Helper functions
const formatDate = (date: Date | { toDate(): Date } | { seconds: number } | undefined): string => {
  if (!date) return 'N/A';

  try {
    let d: Date;

    // Si es un Timestamp de Firestore (tiene .toDate())
    if (date && typeof date === 'object' && 'toDate' in date) {
      d = date.toDate();
    }
    // Si es un objeto con seconds (formato Firestore serializado)
    else if (date && typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000);
    }
    // Si es una instancia de Date
    else if (date instanceof Date) {
      d = date;
    }
    // Si es un string o número, intentar convertir
    else {
      d = new Date(date);
    }

    // Verificar que la fecha es válida
    if (isNaN(d.getTime())) {
      return 'N/A';
    }

    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error, date);
    return 'N/A';
  }
};

const getStatusBadge = (status?: string) => {
  const configs = {
    trial: { label: 'Prueba', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    active: { label: 'Activa', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    expired: { label: 'Expirada', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    cancelled: { label: 'Cancelada', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
    none: { label: 'Sin Suscripción', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };
  const config = configs[status as keyof typeof configs] || configs.none;
  return (
    <span className={`px-2 py-1 rounded text-xs border ${config.color}`}>
      {config.label}
    </span>
  );
};

// Users Table Component
interface UsersTableProps {
  users: UserProfile[];
  onEditUser: (user: UserProfile) => void;
}

function UsersTable({ users, onEditUser }: UsersTableProps) {
  return (
    <div className="bg-[#141B3D] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Último Login</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.uid} className="border-t border-gray-700 hover:bg-black/20">
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">{user.displayName}</td>
                  <td className="px-4 py-3">{getStatusBadge(user.subscriptionStatus)}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.subscriptionTier === 'monthly' && '💳 Mensual'}
                    {user.subscriptionTier === 'annual' && '💎 Anual'}
                    {!user.subscriptionTier && '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEditUser(user)}
                      className="bg-[#00D4FF] hover:bg-[#00B8E6] text-black px-3 py-1 rounded text-sm font-semibold"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-black/20 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Total de usuarios: <span className="font-semibold text-white">{users.length}</span>
        </p>
      </div>
    </div>
  );
}

// Edit User Modal Component
interface EditUserModalProps {
  user: UserProfile;
  onSave: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  onClose: () => void;
  updating: boolean;
}

function EditUserModal({ user, onSave, onClose, updating }: EditUserModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [subscriptionStatus, setSubscriptionStatus] = useState(user.subscriptionStatus || 'none');
  const [subscriptionTier, setSubscriptionTier] = useState<'monthly' | 'annual' | ''>(user.subscriptionTier || '');
  const [trialEndDate, setTrialEndDate] = useState(
    user.trialEndDate ? formatDateForInput(user.trialEndDate) : ''
  );
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(
    user.subscriptionEndDate ? formatDateForInput(user.subscriptionEndDate) : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<UserProfile> = {
      displayName,
      subscriptionStatus: subscriptionStatus as UserProfile['subscriptionStatus'],
    };

    // Solo agregar tier si no está vacío
    if (subscriptionTier) {
      updates.subscriptionTier = subscriptionTier as 'monthly' | 'annual';
    }

    // Solo agregar fechas si están definidas
    if (trialEndDate) {
      updates.trialEndDate = new Date(trialEndDate);
    }
    if (subscriptionEndDate) {
      updates.subscriptionEndDate = new Date(subscriptionEndDate);
    }

    onSave(user.uid, updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#141B3D] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Editar Usuario</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nombre</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00D4FF]"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email (no editable)</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-gray-500"
            />
          </div>

          {/* Subscription Status */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Estado de Suscripción</label>
            <select
              value={subscriptionStatus}
              onChange={(e) => setSubscriptionStatus(e.target.value)}
              className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00D4FF]"
            >
              <option value="none">Sin Suscripción</option>
              <option value="trial">Prueba</option>
              <option value="active">Activa</option>
              <option value="expired">Expirada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          {/* Subscription Tier */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Plan</label>
            <select
              value={subscriptionTier}
              onChange={(e) => setSubscriptionTier(e.target.value as 'monthly' | 'annual' | '')}
              className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00D4FF]"
            >
              <option value="">Ninguno</option>
              <option value="monthly">Mensual ($4.99/mes)</option>
              <option value="annual">Anual ($49.90/año)</option>
            </select>
          </div>

          {/* Trial End Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Fecha Fin de Prueba</label>
            <input
              type="date"
              value={trialEndDate}
              onChange={(e) => setTrialEndDate(e.target.value)}
              className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00D4FF]"
            />
          </div>

          {/* Subscription End Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Fecha Fin de Suscripción</label>
            <input
              type="date"
              value={subscriptionEndDate}
              onChange={(e) => setSubscriptionEndDate(e.target.value)}
              className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00D4FF]"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 bg-[#00D4FF] hover:bg-[#00B8E6] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 rounded transition-colors"
            >
              {updating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Advertencia */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
          <p className="text-xs text-yellow-300">
            ⚠️ Los cambios se guardan inmediatamente. Usa con precaución.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper para formatear fecha para input type="date"
function formatDateForInput(date: Date | { toDate(): Date } | { seconds: number } | undefined): string {
  if (!date) return '';

  try {
    let d: Date;

    // Si es un Timestamp de Firestore (tiene .toDate())
    if (date && typeof date === 'object' && 'toDate' in date) {
      d = date.toDate();
    }
    // Si es un objeto con seconds (formato Firestore serializado)
    else if (date && typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000);
    }
    // Si es una instancia de Date
    else if (date instanceof Date) {
      d = date;
    }
    // Si es un string o número, intentar convertir
    else {
      d = new Date(date);
    }

    // Verificar que la fecha es válida
    if (isNaN(d.getTime())) {
      return '';
    }

    return d.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formateando fecha:', error, date);
    return '';
  }
}

// Message Alert Component
interface MessageAlertProps {
  message: { type: 'success' | 'error', text: string };
}

function MessageAlert({ message }: MessageAlertProps) {
  return (
    <div className={`fixed bottom-6 right-6 rounded-lg p-4 shadow-lg z-50 ${
      message.type === 'success'
        ? 'bg-green-500/10 border border-green-500/30 text-green-300'
        : 'bg-red-500/10 border border-red-500/30 text-red-300'
    }`}>
      <p>{message.text}</p>
    </div>
  );
}
