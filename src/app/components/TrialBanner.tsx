'use client';

import Link from 'next/link';
import { useSubscription } from '@/context/SubscriptionContext';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, ArrowRight, AlertTriangle } from 'lucide-react';

export default function TrialBanner() {
  const { isTrialActive, trialDaysRemaining, subscriptionStatus, requiresPayment } = useSubscription();
  const { t } = useLanguage();

  // Active trial banner
  if (isTrialActive && subscriptionStatus === 'trial') {
    const isUrgent = trialDaysRemaining <= 2;

    return (
      <div className={`sticky top-0 z-40 border-b ${
        isUrgent
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
          : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className={`w-4 h-4 flex-shrink-0 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
              <p className={`font-medium text-sm ${isUrgent ? 'text-red-900 dark:text-red-100' : 'text-blue-900 dark:text-blue-100'}`}>
                {t('trial.freeTrialPrefix')} {trialDaysRemaining <= 1 ? t('trial.lastDay') : `${trialDaysRemaining} ${t('trial.daysRemaining')}`}
              </p>
            </div>
            <Link
              href="/paywall"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                isUrgent
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {t('trial.viewPlans')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Expired/freemium banner
  if (requiresPayment) {
    return (
      <div className="sticky top-0 z-40 border-b bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="font-medium text-sm text-amber-900 dark:text-amber-100">
                {t('freemium.bannerText')}
              </p>
            </div>
            <Link
              href="/paywall"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap bg-amber-600 text-white hover:bg-amber-700"
            >
              {t('freemium.subscribeCTA')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
