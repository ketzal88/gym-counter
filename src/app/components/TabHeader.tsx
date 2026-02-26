'use client';

import React from 'react';

interface TabHeaderProps {
    title: string;
    onBack: () => void;
}

export default function TabHeader({ title, onBack }: TabHeaderProps) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <button
                onClick={onBack}
                className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
                <span className="material-symbols-rounded text-lg">arrow_back</span>
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
            </h2>
        </div>
    );
}
