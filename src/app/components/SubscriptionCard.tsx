'use client';

import { useState } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { useLanguage } from '@/context/LanguageContext';
import { createCheckoutSession, redirectToCustomerPortal } from '@/services/stripeService';

export default function SubscriptionCard() {
  const {
    subscriptionStatus,
    subscriptionTier,
    trialDaysRemaining,
    isTrialActive,
  } = useSubscription();

  const { t } = useLanguage();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleCheckout = async (tier: 'monthly' | 'annual') => {
    setLoadingAction(tier);
    try {
      await createCheckoutSession(tier);
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert(t('subscription.errorCheckout'));
      setLoadingAction(null);
    }
  };

  const handleManageBilling = async () => {
    setLoadingAction('portal');
    try {
      await redirectToCustomerPortal();
    } catch (error) {
      console.error('Error opening portal:', error);
      alert(t('subscription.errorPortal'));
      setLoadingAction(null);
    }
  };

  const getStatusConfig = () => {
    if (isTrialActive) {
      return {
        label: t('subscription.trial'),
        detail: `${trialDaysRemaining} ${t('subscription.daysRemaining')}`,
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      };
    }
    switch (subscriptionStatus) {
      case 'active':
        return {
          label: t('subscription.active'),
          detail: subscriptionTier === 'annual' ? t('subscription.annualPlan') : t('subscription.monthlyPlan'),
          dotColor: 'bg-green-500',
          textColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
        };
      case 'cancelled':
        return {
          label: t('subscription.cancelled'),
          detail: t('subscription.willNotRenew'),
          dotColor: 'bg-red-500',
          textColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
        };
      case 'expired':
        return {
          label: t('subscription.expired'),
          detail: t('subscription.subscribeToContinue'),
          dotColor: 'bg-amber-500',
          textColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        };
      default:
        return {
          label: t('subscription.noSubscription'),
          detail: t('subscription.subscribeToAccess'),
          dotColor: 'bg-slate-400',
          textColor: 'text-slate-600 dark:text-slate-400',
          bgColor: 'bg-slate-50 dark:bg-slate-800',
        };
    }
  };

  const status = getStatusConfig();
  const showSubscribeButtons = isTrialActive || subscriptionStatus === 'expired' || subscriptionStatus === 'cancelled' || subscriptionStatus === 'none';
  const showUpgradeToAnnual = subscriptionStatus === 'active' && subscriptionTier === 'monthly';
  const showManageBilling = subscriptionStatus === 'active' || subscriptionStatus === 'cancelled';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-rounded text-lg text-blue-600">credit_card</span>
          {t('subscription.title')}
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">{t('subscription.status')}</span>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${status.bgColor}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></div>
            <span className={`text-xs font-semibold ${status.textColor}`}>{status.label}</span>
          </div>
        </div>

        {/* Plan detail */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">{t('subscription.plan')}</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{status.detail}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800"></div>

        {/* Subscribe buttons (trial / expired / cancelled / none) */}
        {showSubscribeButtons && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {isTrialActive
                ? t('subscription.choosePlanTrial')
                : t('subscription.choosePlanExpired')}
            </p>
            <button
              onClick={() => handleCheckout('annual')}
              disabled={loadingAction !== null}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingAction === 'annual' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  {t('subscription.annualLabel')}
                  <span className="text-[10px] font-medium bg-white/20 px-1.5 py-0.5 rounded">{t('subscription.annualBadge')}</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleCheckout('monthly')}
              disabled={loadingAction !== null}
              className="w-full py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loadingAction === 'monthly' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
              ) : (
                t('subscription.monthlyLabel')
              )}
            </button>
          </div>
        )}

        {/* Upgrade to annual (monthly subscribers) */}
        {showUpgradeToAnnual && (
          <button
            onClick={() => handleCheckout('annual')}
            disabled={loadingAction !== null}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingAction === 'annual' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                {t('subscription.upgradeToAnnual')}
                <span className="text-[10px] font-medium bg-white/20 px-1.5 py-0.5 rounded">{t('subscription.upgradeBadge')}</span>
              </>
            )}
          </button>
        )}

        {/* Manage billing (active / cancelled subscribers) */}
        {showManageBilling && (
          <button
            onClick={handleManageBilling}
            disabled={loadingAction !== null}
            className="w-full py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingAction === 'portal' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
            ) : (
              <>
                <span className="material-symbols-rounded text-base">open_in_new</span>
                {t('subscription.manageBilling')}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
