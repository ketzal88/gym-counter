'use client';

import { useState } from 'react';
import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/guards/OnboardingGuard';
import { Check, Zap, Clock } from 'lucide-react';
import { createCheckoutSession } from '@/services/stripeService';

export default function PaywallPage() {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);

  const handleSubscribe = async (tier: 'monthly' | 'annual') => {
    setLoading(tier);
    try {
      await createCheckoutSession(tier);
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.');
      setLoading(null);
    }
  };

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">💪</span>
                <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GymCounter
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
            {/* Hero */}
            <div className="text-center space-y-6 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-bold text-amber-900 dark:text-amber-100">
                  Tu Prueba Gratuita Ha Terminado
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight">
                ¡Sigue Transformando<br />tu Físico!
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Has experimentado el poder de GymCounter. Continúa tu progreso con acceso completo desde solo <span className="font-bold text-blue-600 dark:text-blue-400">$4.99/mes</span>.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              {/* Plan Mensual */}
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                      Mensual
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Cancela cuando quieras
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">
                      $4.99
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-lg">
                      /mes
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'Plan personalizado 180 días',
                      'Progresión automática',
                      'Videos de técnica',
                      'Sistema de logros',
                      'Modo offline',
                      'Tracking ilimitado'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe('monthly')}
                    disabled={loading !== null}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-center transition-all
                      ${loading === 'monthly'
                        ? 'bg-slate-400 dark:bg-slate-600 text-white cursor-not-allowed'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105'
                      }
                    `}
                  >
                    {loading === 'monthly' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </span>
                    ) : (
                      'Suscribirme Ahora'
                    )}
                  </button>
                </div>
              </div>

              {/* Plan Anual - DESTACADO */}
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 scale-105 hover:scale-110 transition-all">
                {/* Badge de Popular */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-black shadow-lg">
                  🔥 MÁS POPULAR
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black mb-2">
                      Anual
                    </h3>
                    <p className="text-white/90 text-sm">
                      Ahorra 2 meses gratis
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black">
                        $49.90
                      </span>
                      <span className="text-white/80 text-lg">
                        /año
                      </span>
                    </div>
                    <div className="text-sm text-white/80">
                      <span className="line-through">$59.88</span>
                      {' '}→{' '}
                      <span className="font-bold text-amber-300">Ahorra $9.98</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'Todo lo del plan mensual',
                      '2 meses gratis ($9.98 de ahorro)',
                      'Soporte prioritario',
                      'Acceso anticipado a nuevas funciones',
                      'Sin preocuparte por renovaciones',
                      'Mejor precio garantizado'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-white flex-shrink-0" />
                        <span className="text-white">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe('annual')}
                    disabled={loading !== null}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-center transition-all shadow-lg
                      ${loading === 'annual'
                        ? 'bg-white/50 text-white cursor-not-allowed'
                        : 'bg-white text-blue-600 hover:scale-105'
                      }
                    `}
                  >
                    {loading === 'annual' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        Procesando...
                      </span>
                    ) : (
                      'Suscribirme Ahora'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Value Props */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-3xl mb-3">💳</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Pago Seguro
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Procesado por Stripe, líder mundial en pagos online
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-3xl mb-3">🔒</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Cancela Fácilmente
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sin preguntas ni complicaciones, desde tu cuenta
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-3xl mb-3">📱</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Acceso Inmediato
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Continúa tu entrenamiento en segundos
                </p>
              </div>
            </div>

            {/* FAQ Preview */}
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-6">
                Preguntas Frecuentes
              </h3>

              <details className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-900 dark:text-white">
                  <span>¿Puedo cancelar en cualquier momento?</span>
                  <span className="text-2xl group-open:rotate-180 transition-transform">
                    ↓
                  </span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sí, puedes cancelar en cualquier momento desde tu configuración de cuenta. Mantendrás acceso hasta el final de tu período de pago.
                </p>
              </details>

              <details className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-900 dark:text-white">
                  <span>¿Qué métodos de pago aceptan?</span>
                  <span className="text-2xl group-open:rotate-180 transition-transform">
                    ↓
                  </span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                  Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) procesadas de forma segura por Stripe.
                </p>
              </details>

              <details className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-900 dark:text-white">
                  <span>¿Perderé mi progreso si no me suscribo?</span>
                  <span className="text-2xl group-open:rotate-180 transition-transform">
                    ↓
                  </span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                  No. Todo tu progreso, datos y configuración se mantienen seguros. Cuando te suscribas, podrás continuar exactamente donde lo dejaste.
                </p>
              </details>
            </div>
          </div>
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
}
