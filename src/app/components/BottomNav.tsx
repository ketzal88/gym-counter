'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

type Tab = 'home' | 'routine' | 'logs' | 'kpis' | 'records' | 'settings';

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const { t } = useLanguage();

    const navItems = [
        { id: 'home' as const, label: t('nav.home'), icon: 'grid_view' },
        { id: 'routine' as const, label: t('nav.routine'), icon: 'fitness_center' },
        { id: 'logs' as const, label: t('nav.logs'), icon: 'history_edu' },
        { id: 'kpis' as const, label: t('nav.kpis'), icon: 'monitoring' },
        { id: 'records' as const, label: t('nav.records'), icon: 'military_tech' },
        { id: 'settings' as const, label: t('nav.settings'), icon: 'settings' },
    ];
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-2 pb-6 flex justify-between items-center z-40"
            role="tablist"
            aria-label="Navegación principal"
        >
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    role="tab"
                    aria-selected={activeTab === item.id}
                    aria-label={item.label}
                    className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center transition-colors ${activeTab === item.id
                        ? 'text-blue-600 dark:text-blue-500'
                        : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                        }`}
                >
                    <span className={`material-symbols-rounded ${activeTab === item.id ? 'font-bold' : ''}`}>
                        {item.icon}
                    </span>
                    <span className={`text-[10px] ${activeTab === item.id ? 'font-semibold' : 'font-medium'}`}>
                        {item.label}
                    </span>
                </button>
            ))}
        </nav>
    );
}
