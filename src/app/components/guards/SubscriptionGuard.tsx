'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/context/SubscriptionContext';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

/**
 * SubscriptionGuard - Verifica autenticación. Permite acceso freemium al dashboard
 * (features premium se bloquean a nivel de componente, no con redirect).
 */
export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const { loading: subLoading } = useSubscription();
    const router = useRouter();

    useEffect(() => {
        if (authLoading || subLoading) return;

        if (!user) {
            router.push('/auth/signin');
            return;
        }
    }, [user, authLoading, subLoading, router]);

    if (authLoading || subLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-500">{t('guards.verifying')}</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
