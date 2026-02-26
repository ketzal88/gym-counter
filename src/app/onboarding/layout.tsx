'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface OnboardingLayoutProps {
    children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
    const pathname = usePathname();
    const { user, loading, onboardingCompleted } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/signin');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!loading && onboardingCompleted) {
            router.push('/dashboard');
        }
    }, [onboardingCompleted, loading, router]);

    const getCurrentStep = () => {
        if (pathname.includes('/profile')) return 1;
        if (pathname.includes('/goals')) return 2;
        if (pathname.includes('/plan')) return 3;
        return 1;
    };

    const currentStep = getCurrentStep();
    const totalSteps = 3;

    const steps = [
        { number: 1, label: t('onboarding.stepProfile') },
        { number: 2, label: t('onboarding.stepGoals') },
        { number: 3, label: t('onboarding.stepPlan') },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-500">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-lg mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                                <span className="text-lg">💪</span>
                            </div>
                            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                                GymCounter
                            </span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                            {currentStep}/{totalSteps}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="max-w-lg mx-auto px-6 py-8">
                <div className="flex items-center gap-3">
                    {steps.map((step, idx) => {
                        const isCompleted = step.number < currentStep;
                        const isCurrent = step.number === currentStep;

                        return (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex items-center gap-2 flex-1">
                                    {/* Step indicator */}
                                    <div
                                        className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center
                                            text-sm font-semibold flex-shrink-0 transition-colors
                                            ${isCompleted
                                                ? 'bg-blue-600 text-white'
                                                : isCurrent
                                                    ? 'border-2 border-blue-600 text-blue-600'
                                                    : 'border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600'
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            step.number
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`
                                            text-sm font-medium transition-colors
                                            ${isCurrent
                                                ? 'text-blue-600 dark:text-blue-500'
                                                : isCompleted
                                                    ? 'text-slate-600 dark:text-slate-400'
                                                    : 'text-slate-400 dark:text-slate-600'
                                            }
                                        `}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connector line */}
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`h-px flex-1 mx-2 ${
                                            step.number < currentStep
                                                ? 'bg-blue-600'
                                                : 'bg-slate-200 dark:bg-slate-800'
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-6 pb-32">
                {children}
            </div>

            {/* Footer tip */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent pointer-events-none">
                <div className="max-w-lg mx-auto px-6 py-4">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 pointer-events-auto">
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                            {t('onboarding.footerTip')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
