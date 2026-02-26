'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/dashboard';
    } else {
      alert('Aún estás sin conexión. Por favor verifica tu conexión a internet.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse" />
          <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-700 shadow-2xl">
            <WifiOff className="w-16 h-16 text-slate-600 dark:text-slate-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            {isOnline ? '¡Conexión Restaurada!' : 'Sin Conexión'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {isOnline
              ? 'Tu conexión a internet ha sido restaurada. Presiona el botón para continuar.'
              : 'Parece que estás sin conexión a internet. Verifica tu conexión y vuelve a intentarlo.'}
          </p>
        </div>

        {/* Offline Features */}
        {!isOnline && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-6 text-left space-y-4">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <span>💡</span>
              <span>Funciones Disponibles Offline</span>
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Completar workouts (se sincronizarán después)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Ver tu rutina actual y ejercicios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Registrar pesos y repeticiones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Usar el temporizador de descanso</span>
              </li>
            </ul>
            <p className="text-xs text-blue-700 dark:text-blue-300 italic">
              Todos tus datos se guardarán localmente y se sincronizarán automáticamente cuando vuelvas a tener conexión.
            </p>
          </div>
        )}

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className={`
            w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 shadow-lg
            ${isOnline
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-500/30'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
            }
          `}
        >
          <RefreshCw className="w-5 h-5" />
          <span>{isOnline ? 'Continuar' : 'Reintentar Conexión'}</span>
        </button>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
        </div>
      </div>
    </div>
  );
}
