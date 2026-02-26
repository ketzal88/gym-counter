'use client';

import Link from 'next/link';
import { useSubscription } from '@/context/SubscriptionContext';
import { Clock } from 'lucide-react';

export default function TrialBanner() {
  const { isTrialActive, trialDaysRemaining, subscriptionStatus } = useSubscription();

  // Solo mostrar si está en trial
  if (!isTrialActive || subscriptionStatus !== 'trial') {
    return null;
  }

  // Color del banner según días restantes
  const getGradient = () => {
    if (trialDaysRemaining <= 1) return 'from-red-500 to-orange-500';
    if (trialDaysRemaining <= 3) return 'from-amber-500 to-orange-500';
    return 'from-blue-500 to-indigo-500';
  };

  const getUrgencyText = () => {
    if (trialDaysRemaining === 0) return '¡Último día!';
    if (trialDaysRemaining === 1) return '¡Último día!';
    return `${trialDaysRemaining} días restantes`;
  };

  return (
    <div className={`sticky top-0 z-40 bg-gradient-to-r ${getGradient()} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Trial info */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 animate-pulse" />
            <div className="text-center sm:text-left">
              <p className="font-bold text-sm">
                ⏰ Prueba Gratuita: {getUrgencyText()}
              </p>
              <p className="text-xs text-white/90">
                Suscríbete para continuar accediendo a tu plan
              </p>
            </div>
          </div>

          {/* Right: CTA Button */}
          <Link
            href="/paywall"
            className="px-6 py-2 rounded-xl font-bold text-sm bg-white text-blue-600 hover:bg-white/90 hover:scale-105 transition-all shadow-lg whitespace-nowrap"
          >
            Ver Planes 🚀
          </Link>
        </div>
      </div>
    </div>
  );
}
