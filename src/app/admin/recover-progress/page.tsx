'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToUserTrainingState,
  updateUserTrainingState,
  UserTrainingState,
  subscribeToWorkoutLogs,
  WorkoutLog
} from '@/services/db';
import { useRouter } from 'next/navigation';

export default function RecoverProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trainingState, setTrainingState] = useState<UserTrainingState | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [targetDay, setTargetDay] = useState<number>(6);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (!user) return;

    // Suscribirse al estado de entrenamiento
    const unsubscribeState = subscribeToUserTrainingState(user.uid, (state) => {
      setTrainingState(state);
    });

    // Suscribirse a los workouts
    const unsubscribeWorkouts = subscribeToWorkoutLogs(user.uid, (logs) => {
      setWorkouts(logs);
    });

    return () => {
      unsubscribeState();
      unsubscribeWorkouts();
    };
  }, [user, loading, router]);

  const handleRecover = async () => {
    if (!user || !targetDay) return;

    setUpdating(true);
    setMessage(null);

    try {
      await updateUserTrainingState(user.uid, {
        currentDay: targetDay
      });

      setMessage({
        type: 'success',
        text: `✅ ¡Progreso restaurado exitosamente! Día actualizado a ${targetDay}`
      });
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      setMessage({
        type: 'error',
        text: '❌ Error al actualizar el progreso. Por favor intenta de nuevo.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getMaxDayFromWorkouts = () => {
    if (workouts.length === 0) return 1;

    const maxDay = Math.max(...workouts
      .filter(w => w.protocolDay)
      .map(w => w.protocolDay || 0));

    return maxDay > 0 ? maxDay : 1;
  };

  const suggestedDay = getMaxDayFromWorkouts();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Volver al inicio
          </button>
          <h1 className="text-3xl font-bold mb-2">🔧 Recuperar Progreso</h1>
          <p className="text-gray-400">
            Utiliza esta herramienta para restaurar tu progreso de entrenamiento
          </p>
        </div>

        {/* User Info */}
        <div className="bg-[#141B3D] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">👤 Información del Usuario</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Email:</span> {user.email}</p>
            <p><span className="text-gray-400">Nombre:</span> {user.displayName}</p>
            <p><span className="text-gray-400">UID:</span> <code className="text-xs bg-black/30 px-2 py-1 rounded">{user.uid}</code></p>
          </div>
        </div>

        {/* Current State */}
        {trainingState && (
          <div className="bg-[#141B3D] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">📊 Estado Actual</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Día actual:</span>
                <span className="text-2xl font-bold text-[#00D4FF]">Día {trainingState.currentDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sesiones completadas:</span>
                <span className="font-semibold">{trainingState.completedProtocolSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Plan:</span>
                <span className="font-semibold">{trainingState.planVersion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completado:</span>
                <span>{trainingState.protocolCompleted ? '✅ Sí' : '❌ No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Workout History */}
        {workouts.length > 0 && (
          <div className="bg-[#141B3D] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">🏋️ Historial de Entrenamientos</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Total de workouts registrados: <span className="text-white font-semibold">{workouts.length}</span></p>
              <p className="text-gray-400">Último día completado según historial: <span className="text-white font-semibold">Día {suggestedDay}</span></p>

              {workouts.slice(0, 5).map((workout, idx) => (
                <div key={workout.id} className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{new Date(workout.timestamp).toLocaleDateString()}</span>
                    <span className="text-[#00D4FF]">Día {workout.protocolDay || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-gray-500">{workout.routineName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recovery Form */}
        <div className="bg-[#141B3D] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔄 Restaurar Progreso</h2>

          {suggestedDay > 1 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Sugerencia:</strong> Según tu historial de entrenamientos,
                completaste hasta el día <strong>{suggestedDay}</strong>.
                Tu siguiente entrenamiento debería ser el día <strong>{suggestedDay + 1}</strong>.
              </p>
              <button
                onClick={() => setTargetDay(suggestedDay + 1)}
                className="mt-2 text-xs bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1 rounded"
              >
                Usar día {suggestedDay + 1}
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Día de entrenamiento a restaurar:
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={targetDay}
                onChange={(e) => setTargetDay(parseInt(e.target.value) || 1)}
                className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#00D4FF]"
              />
            </div>

            <button
              onClick={handleRecover}
              disabled={updating || !targetDay}
              className="w-full bg-[#00D4FF] hover:bg-[#00B8E6] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors"
            >
              {updating ? 'Actualizando...' : `Restaurar al Día ${targetDay}`}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-300' :
            message.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-300' :
            'bg-blue-500/10 border border-blue-500/30 text-blue-300'
          }`}>
            <p>{message.text}</p>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
          <p className="text-sm text-yellow-300">
            ⚠️ <strong>Advertencia:</strong> Esta herramienta solo actualiza el día actual en tu perfil.
            No afecta tu historial de entrenamientos ni tus levantamientos. Úsala solo si perdiste
            tu progreso por un error técnico.
          </p>
        </div>
      </div>
    </div>
  );
}
