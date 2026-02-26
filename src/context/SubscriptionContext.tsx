'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/services/db';
import { doc, onSnapshot } from 'firebase/firestore';
import type { UserProfile } from '@/services/db';

interface SubscriptionContextType {
    subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled' | 'none';
    trialDaysRemaining: number;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
    requiresPayment: boolean;
    subscriptionTier?: 'monthly' | 'annual';
    loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    subscriptionStatus: 'none',
    trialDaysRemaining: 0,
    isTrialActive: false,
    isSubscriptionActive: false,
    requiresPayment: false,
    loading: true,
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [subscriptionStatus, setSubscriptionStatus] = useState<'trial' | 'active' | 'expired' | 'cancelled' | 'none'>('none');
    const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
    const [subscriptionTier, setSubscriptionTier] = useState<'monthly' | 'annual' | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data() as UserProfile;

                // Set subscription status
                const status = userData.subscriptionStatus || 'none';
                setSubscriptionStatus(status);
                setSubscriptionTier(userData.subscriptionTier);

                // Calculate trial days remaining
                if (status === 'trial' && userData.trialEndDate) {
                    const now = new Date();
                    const trialEnd = userData.trialEndDate instanceof Date
                        ? userData.trialEndDate
                        : new Date(userData.trialEndDate);

                    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    setTrialDaysRemaining(Math.max(0, daysRemaining));
                } else {
                    setTrialDaysRemaining(0);
                }
            }
            setLoading(false);
        }, (error) => {
            console.error('Error subscribing to user subscription data:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const isTrialActive = subscriptionStatus === 'trial' && trialDaysRemaining > 0;
    const isSubscriptionActive = subscriptionStatus === 'active' || isTrialActive;
    const requiresPayment = subscriptionStatus === 'expired' || (subscriptionStatus === 'trial' && trialDaysRemaining <= 0);

    return (
        <SubscriptionContext.Provider
            value={{
                subscriptionStatus,
                trialDaysRemaining,
                isTrialActive,
                isSubscriptionActive,
                requiresPayment,
                subscriptionTier,
                loading,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
};
