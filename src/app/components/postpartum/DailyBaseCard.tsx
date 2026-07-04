'use client';

import { useState, useEffect } from 'react';
import { POSTPARTUM_DAILY_BASE } from '@/services/protocolEngine';
import { useLanguage } from '@/context/LanguageContext';

interface DailyBaseCardProps {
    userId: string;
}

// Clave de localStorage por usuario y día: el checklist se reinicia cada jornada.
const storageKey = (userId: string, isoDate: string) => `pp_base_${userId}_${isoDate}`;
const todayIso = () => new Date().toISOString().split('T')[0];

/**
 * Card de la "Base diaria de reconexión" (plan posparto).
 * Los 4 ejercicios de base se hacen casi todos los días, incluso los de descanso,
 * así que viven acá y no dentro de la rutina. El estado es local (localStorage) y
 * se resetea al cambiar el día — es un recordatorio de bajo riesgo, sin Firestore.
 */
export default function DailyBaseCard({ userId }: DailyBaseCardProps) {
    const { t } = useLanguage();
    const [checked, setChecked] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!userId) return;
        try {
            const raw = localStorage.getItem(storageKey(userId, todayIso()));
            setChecked(raw ? JSON.parse(raw) : {});
        } catch {
            setChecked({});
        }
    }, [userId]);

    const toggle = (id: string) => {
        setChecked(prev => {
            const next = { ...prev, [id]: !prev[id] };
            try {
                localStorage.setItem(storageKey(userId, todayIso()), JSON.stringify(next));
            } catch {
                // Modo privado / almacenamiento lleno: no bloquea la UI.
            }
            return next;
        });
    };

    const doneCount = POSTPARTUM_DAILY_BASE.filter(ex => checked[ex.id]).length;
    const allDone = doneCount === POSTPARTUM_DAILY_BASE.length;

    return (
        <div className="rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50/60 dark:bg-teal-900/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-teal-100 dark:border-teal-900/30">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-rounded text-lg text-teal-600 dark:text-teal-400">self_improvement</span>
                        {t('postpartum.baseTitle')}
                    </h3>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                        {doneCount}/{POSTPARTUM_DAILY_BASE.length}
                    </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('postpartum.baseSubtitle')}</p>
            </div>

            <div className="p-3 space-y-1.5">
                {POSTPARTUM_DAILY_BASE.map(ex => {
                    const isDone = !!checked[ex.id];
                    return (
                        <button
                            key={ex.id}
                            type="button"
                            onClick={() => toggle(ex.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors border ${
                                isDone
                                    ? 'bg-teal-100/70 dark:bg-teal-900/20 border-teal-200 dark:border-teal-900/40'
                                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800'
                            }`}
                        >
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                isDone ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300 dark:border-slate-700 text-transparent'
                            }`}>
                                <span className="material-symbols-rounded text-[14px] font-black">check</span>
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${isDone ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                                    {ex.name}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-500">{ex.reps}</p>
                            </div>
                        </button>
                    );
                })}

                <p className="text-center text-[11px] font-medium pt-1.5">
                    {allDone
                        ? <span className="text-teal-600 dark:text-teal-400">{t('postpartum.baseDone')}</span>
                        : <span className="text-slate-400 dark:text-slate-600">{t('postpartum.baseReset')}</span>}
                </p>
            </div>
        </div>
    );
}
