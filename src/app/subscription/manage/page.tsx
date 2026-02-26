'use client';

import { useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import OnboardingGuard from '../../components/guards/OnboardingGuard';
import SubscriptionGuard from '../../components/guards/SubscriptionGuard';
import { useSubscription } from '@/context/SubscriptionContext';
import { redirectToCustomerPortal } from '@/services/stripeService';
import { CreditCard, Calendar, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ManageSubscriptionPage() {
  const {
    subscriptionStatus,
    subscriptionTier,
    isTrialActive,
    trialDaysRemaining,
  } = useSubscription();

  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      await redirectToCustomerPortal();
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Hubo un error al abrir el portal. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  const getTierDisplay = () => {
    if (!subscriptionTier) return 'N/A';
    return subscriptionTier === 'monthly' ? 'Mensual ($4.99/mes)' : 'Anual ($49.90/año)';
  };

  const getStatusDisplay = () => {
    if (isTrialActive) {
      return {
        text: `Prueba Gratuita (${trialDaysRemaining} días restantes)`,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
      };
    }

    switch (subscriptionStatus) {
      case 'active':
        return {
          text: 'Activa',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-950/30',
        };
      case 'cancelled':
        return {
          text: 'Cancelada',
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-950/30',
        };
      case 'expired':
        return {
          text: 'Expirada',
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
        };
      default:
        return {
          text: 'Desconocido',
          color: 'text-slate-600 dark:text-slate-400',
          bg: 'bg-slate-50 dark:bg-slate-800',
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <AuthGuard>
      <OnboardingGuard>
        <SubscriptionGuard>
          <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <span className="text-2xl">💪</span>
                      <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        GymCounter
                      </span>
                    </Link>
                  </div>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:scale-105 transition-transform"
                  >
                    ← Volver al Dashboard
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
              {/* Page Header */}
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                  Gestionar Suscripción
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Administra tu plan, método de pago y facturación
                </p>
              </div>

              {/* Subscription Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 mb-8">
                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                      Estado de Suscripción
                    </label>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')} animate-pulse`}></div>
                      <span className={`font-bold text-sm ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  {/* Plan */}
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                      Plan Actual
                    </label>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {getTierDisplay()}
                      </span>
                    </div>
                  </div>

                  {/* Manage Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleManageSubscription}
                      disabled={loading}
                      className={`
                        w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all
                        ${loading
                          ? 'bg-slate-400 dark:bg-slate-600 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105'
                        }
                      `}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Abriendo Portal...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>Gestionar en Stripe</span>
                          <ExternalLink className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
                      Serás redirigido al portal seguro de Stripe donde podrás actualizar tu método de pago, ver facturas y cancelar tu suscripción.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Billing Info */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                        Próxima Facturación
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Consulta tu próxima fecha de cargo y administra renovaciones en el portal de Stripe.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                        Método de Pago
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Actualiza tu tarjeta de crédito o débito de forma segura en cualquier momento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-8 p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                      ¿Necesitas Ayuda?
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      Si tienes problemas con tu suscripción o facturación, no dudes en contactarnos.
                    </p>
                    <Link
                      href="#"
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Contactar Soporte
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SubscriptionGuard>
      </OnboardingGuard>
    </AuthGuard>
  );
}
