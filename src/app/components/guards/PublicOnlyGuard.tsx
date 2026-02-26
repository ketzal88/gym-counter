'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface PublicOnlyGuardProps {
    children: React.ReactNode;
}

/**
 * PublicOnlyGuard - Redirige usuarios autenticados fuera de rutas públicas
 *
 * Uso: Envolver landing page, signin, signup para evitar que usuarios autenticados accedan
 *
 * Lógica de redirección:
 * - Si autenticado Y onboarding completado → /dashboard
 * - Si autenticado Y onboarding NO completado → /onboarding/profile
 * - Si NO autenticado → mostrar contenido público
 */
export default function PublicOnlyGuard({ children }: PublicOnlyGuardProps) {
    const { user, loading, onboardingCompleted } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (user) {
            // Usuario autenticado
            if (onboardingCompleted) {
                // Onboarding completado → dashboard
                router.push('/dashboard');
            } else {
                // Onboarding pendiente → onboarding flow
                router.push('/onboarding/profile');
            }
        }
    }, [user, loading, onboardingCompleted, router]);

    // Mostrar loading mientras se verifica
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Cargando...</p>
                </div>
            </div>
        );
    }

    // Si hay usuario autenticado, no mostrar nada (se está redirigiendo)
    if (user) {
        return null;
    }

    // Usuario no autenticado → mostrar contenido público
    return <>{children}</>;
}
