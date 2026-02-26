'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface OnboardingGuardProps {
    children: React.ReactNode;
}

/**
 * OnboardingGuard - Redirige a /onboarding si el usuario NO ha completado el onboarding
 *
 * Uso: Envolver rutas que requieren onboarding completado (ej: /dashboard)
 */
export default function OnboardingGuard({ children }: OnboardingGuardProps) {
    const { user, loading, onboardingCompleted } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Si no está autenticado, redirigir a signin
        if (!user) {
            router.push('/auth/signin');
            return;
        }

        // Si está autenticado pero no completó onboarding, redirigir a onboarding
        if (!onboardingCompleted) {
            router.push('/onboarding/profile');
            return;
        }
    }, [user, loading, onboardingCompleted, router]);

    // Mostrar loading mientras se verifica
    if (loading || !user || !onboardingCompleted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Cargando...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
