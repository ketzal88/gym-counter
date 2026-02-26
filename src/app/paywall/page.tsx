'use client';

import { useState } from 'react';
import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/guards/OnboardingGuard';
import { Check, Clock, CreditCard, Lock, Smartphone } from 'lucide-react';
import { createCheckoutSession } from '@/services/stripeService';
import { useLanguage } from '@/context/LanguageContext';

export default function PaywallPage() {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
  const { t, dict } = useLanguage();

  const handleSubscribe = async (tier: 'monthly' | 'annual') => {
    setLoading(tier);
    try {
      await createCheckoutSession(tier);
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert(t('subscription.errorCheckout'));
      setLoading(null);
    }
  };

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="min-h-screen bg-white dark:bg-slate-950">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-6xl mx-auto px-6 md:px-8 py-5">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-lg">💪</span>
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  GymCounter
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-20">
            {/* Hero */}
            <div className="text-center space-y-6 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                  {t('paywall.trialEnded')}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {t('paywall.heroTitle')}<br />{t('paywall.heroTitle2')}
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {t('paywall.heroSubtitle')} <span className="font-semibold text-slate-900 dark:text-white">$4.99{t('landing.perMonth')}</span>.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
              {/* Plan Mensual */}
              <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      {t('landing.planMonthly')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      {t('landing.trustCancel')}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                      $4.99
                    </span>
                    <span className="text-slate-500 dark:text-slate-500">
                      {t('landing.perMonth')}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {dict.landing.monthlyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe('monthly')}
                    disabled={loading !== null}
                    className={`
                      w-full py-3 rounded-lg font-medium text-center transition-colors
                      ${loading === 'monthly'
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    {loading === 'monthly' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                        {t('common.processing')}
                      </span>
                    ) : (
                      t('paywall.subscribe')
                    )}
                  </button>
                </div>
              </div>

              {/* Plan Anual - DESTACADO */}
              <div className="relative p-8 rounded-xl border-2 border-blue-600 bg-white dark:bg-slate-950">
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">
                  {t('landing.mostPopular')}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      {t('landing.planAnnual')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      {t('landing.planAnnualSave')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        $49.90
                      </span>
                      <span className="text-slate-500 dark:text-slate-500">
                        {t('landing.perYear')}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                      <span className="line-through">$59.88</span>
                      {' · '}
                      <span className="text-blue-600 dark:text-blue-500 font-medium">{t('landing.save')} $9.98</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {dict.landing.annualFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe('annual')}
                    disabled={loading !== null}
                    className={`
                      w-full py-3 rounded-lg font-semibold text-center transition-colors
                      ${loading === 'annual'
                        ? 'bg-blue-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    {loading === 'annual' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t('common.processing')}
                      </span>
                    ) : (
                      t('paywall.subscribe')
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Value Props */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              <div className="text-center p-6">
                <CreditCard className="w-6 h-6 text-slate-400 mx-auto mb-3" />
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                  {t('paywall.securePayment')}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {t('paywall.processedByStripe')}
                </p>
              </div>

              <div className="text-center p-6">
                <Lock className="w-6 h-6 text-slate-400 mx-auto mb-3" />
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                  {t('paywall.cancelEasily')}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {t('paywall.cancelDesc')}
                </p>
              </div>

              <div className="text-center p-6">
                <Smartphone className="w-6 h-6 text-slate-400 mx-auto mb-3" />
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                  {t('paywall.immediateAccess')}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {t('paywall.immediateAccessDesc')}
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-6">
                {t('paywall.faqTitle')}
              </h3>

              {dict.paywall.faq.map((faq, idx) => (
                <details
                  key={idx}
                  className="group p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-medium text-slate-900 dark:text-white">
                    <span className="text-sm">{faq.q}</span>
                    <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
}
