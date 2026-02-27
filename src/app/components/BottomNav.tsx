'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/context/SubscriptionContext';

type Tab = 'home' | 'routine' | 'logs' | 'kpis' | 'records' | 'settings';

const LOCKED_TABS: Tab[] = ['routine', 'kpis', 'records'];

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const { t } = useLanguage();
    const { requiresPayment } = useSubscription();
    const router = useRouter();

    const navItems = [
        { id: 'home' as const, label: t('nav.home'), icon: 'grid_view' },
        { id: 'routine' as const, label: t('nav.routine'), icon: 'fitness_center' },
        { id: 'logs' as const, label: t('nav.logs'), icon: 'history_edu' },
        { id: 'kpis' as const, label: t('nav.kpis'), icon: 'monitoring' },
        { id: 'records' as const, label: t('nav.records'), icon: 'military_tech' },
        { id: 'settings' as const, label: t('nav.settings'), icon: 'settings' },
    ];

    const handleTabPress = (tabId: Tab) => {
        if (requiresPayment && LOCKED_TABS.includes(tabId)) {
            router.push('/paywall');
            return;
        }
        onTabChange(tabId);
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-2 pb-6 flex justify-between items-center z-40"
            role="tablist"
            aria-label="Navegación principal"
        >
            {navItems.map((item) => {
                const isLocked = requiresPayment && LOCKED_TABS.includes(item.id);

                return (
                    <button
                        key={item.id}
                        onClick={() => handleTabPress(item.id)}
                        role="tab"
                        aria-selected={activeTab === item.id}
                        aria-label={item.label}
                        className={`relative flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center transition-colors ${
                            isLocked
                                ? 'text-slate-300 dark:text-slate-700'
                                : activeTab === item.id
                                    ? 'text-blue-600 dark:text-blue-500'
                                    : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                        }`}
                    >
                        <span className={`material-symbols-rounded ${activeTab === item.id && !isLocked ? 'font-bold' : ''}`}>
                            {item.icon}
                        </span>
                        <span className={`text-[10px] ${activeTab === item.id && !isLocked ? 'font-semibold' : 'font-medium'}`}>
                            {item.label}
                        </span>
                        {isLocked && (
                            <span className="absolute -top-0.5 -right-0.5 material-symbols-rounded text-[12px] text-slate-400 dark:text-slate-600">
                                lock
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
