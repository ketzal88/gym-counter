'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

/**
 * SubscriptionGuard - Redirige a /paywall si el trial expiró y no hay suscripción activa
 *
 * Uso: Envolver rutas que requieren suscripción activa (ej: /dashboard, /routine)
 */
export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
    const { user, loading: authLoading } = useAuth();
    const { requiresPayment, loading: subLoading } = useSubscription();
    const router = useRouter();

    useEffect(() => {
        if (authLoading || subLoading) return;

        // Si no está autenticado, redirigir a signin (AuthGuard debería manejar esto)
        if (!user) {
            router.push('/auth/signin');
            return;
        }

        // Si requiere pago, redirigir a paywall
        if (requiresPayment) {
            router.push('/paywall');
            return;
        }
    }, [user, authLoading, requiresPayment, subLoading, router]);

    // Mostrar loading mientras se verifica
    if (authLoading || subLoading || !user || requiresPayment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Verificando suscripción...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
