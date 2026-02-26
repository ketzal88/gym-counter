'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface OnboardingLayoutProps {
    children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
    const pathname = usePathname();
    const { user, loading, onboardingCompleted } = useAuth();
    const router = useRouter();

    // Redirigir si no está autenticado
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/signin');
        }
    }, [user, loading, router]);

    // Redirigir si ya completó onboarding
    useEffect(() => {
        if (!loading && onboardingCompleted) {
            router.push('/dashboard');
        }
    }, [onboardingCompleted, loading, router]);

    // Determinar paso actual
    const getCurrentStep = () => {
        if (pathname.includes('/profile')) return 1;
        if (pathname.includes('/goals')) return 2;
        if (pathname.includes('/plan')) return 3;
        return 1;
    };

    const currentStep = getCurrentStep();
    const totalSteps = 3;

    const steps = [
        { number: 1, label: 'Perfil', path: '/onboarding/profile' },
        { number: 2, label: 'Objetivos', path: '/onboarding/goals' },
        { number: 3, label: 'Plan', path: '/onboarding/plan' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Header con Logo */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-lg mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💪</span>
                            <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                GymCounter
                            </span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Paso {currentStep} de {totalSteps}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stepper - Mobile-First Design */}
            <div className="max-w-lg mx-auto px-6 py-6">
                <div className="flex items-center justify-between relative">
                    {/* Línea de progreso de fondo */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 rounded-full -z-10">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        ></div>
                    </div>

                    {/* Indicadores de pasos */}
                    {steps.map((step) => {
                        const isCompleted = step.number < currentStep;
                        const isCurrent = step.number === currentStep;
                        const isPending = step.number > currentStep;

                        return (
                            <div key={step.number} className="flex flex-col items-center gap-2 relative">
                                {/* Círculo del paso */}
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center
                                        font-bold text-sm transition-all duration-300
                                        ${isCompleted
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                                            : isCurrent
                                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-4 border-blue-500 shadow-lg shadow-blue-500/20 scale-110'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                        }
                                    `}
                                >
                                    {isCompleted ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        step.number
                                    )}
                                </div>

                                {/* Label del paso */}
                                <span
                                    className={`
                                        text-xs font-medium transition-all duration-300 whitespace-nowrap
                                        ${isCurrent
                                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                                            : isCompleted
                                                ? 'text-slate-600 dark:text-slate-400'
                                                : 'text-slate-400 dark:text-slate-600'
                                        }
                                    `}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contenido del paso actual */}
            <div className="max-w-lg mx-auto px-6 pb-24">
                {children}
            </div>

            {/* Footer opcional - Pro tip */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent dark:from-slate-900 dark:to-transparent pointer-events-none">
                <div className="max-w-lg mx-auto px-6 py-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl px-4 py-3 pointer-events-auto">
                        <div className="flex items-start gap-3">
                            <span className="text-lg">💡</span>
                            <div className="flex-1 text-xs text-blue-700 dark:text-blue-300">
                                <span className="font-bold">Pro tip:</span> Toda tu información es privada y segura. Puedes cambiarla después en ajustes.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
