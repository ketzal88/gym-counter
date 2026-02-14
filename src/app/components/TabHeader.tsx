'use client';

import React from 'react';

interface TabHeaderProps {
    title: string;
    onBack: () => void;
}

export default function TabHeader({ title, onBack }: TabHeaderProps) {
    return (
        <div className="flex items-center gap-4 mb-6 px-1">
            <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/30"
            >
                <span className="material-symbols-rounded text-xl">arrow_back</span>
            </button>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                {title}
            </h2>
        </div>
    );
}
