'use client';

import React from 'react';

type Tab = 'home' | 'routine' | 'logs' | 'kpis' | 'records';

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const navItems = [
        { id: 'home', label: 'Resumen', icon: 'grid_view' },
        { id: 'routine', label: 'Rutina', icon: 'fitness_center' },
        { id: 'logs', label: 'Registro', icon: 'history_edu' },
        { id: 'kpis', label: 'KPIs', icon: 'monitoring' },
        { id: 'records', label: 'Récords', icon: 'military_tech' },
    ] as const;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-2 pb-6 flex justify-between items-center z-40">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === item.id
                        ? 'text-primary'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                >
                    <span className={`material-symbols-rounded ${activeTab === item.id ? 'font-bold' : ''}`}>
                        {item.icon}
                    </span>
                    <span className={`text-[10px] ${activeTab === item.id ? 'font-bold' : 'font-medium'}`}>
                        {item.label}
                    </span>
                </button>
            ))}
        </nav>
    );
}
