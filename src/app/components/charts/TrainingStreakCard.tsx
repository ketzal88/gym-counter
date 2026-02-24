'use client';

import { useMemo } from 'react';
import { Visit } from '@/services/db';

interface TrainingStreakCardProps {
    visits: Visit[];
}

export default function TrainingStreakCard({ visits }: TrainingStreakCardProps) {
    const { currentStreak, longestStreak, last30Days } = useMemo(() => {
        const visitDates = new Set(
            visits.map(v => {
                const d = new Date(v.date);
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            })
        );

        // Current streak: consecutive days ending today or yesterday
        let current = 0;
        const today = new Date();
        const checkDate = new Date(today);

        // Check if today has a visit, if not start from yesterday
        const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        if (!visitDates.has(todayKey)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
            if (visitDates.has(key)) {
                current++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Longest streak
        const sortedDates = [...visitDates]
            .map(k => {
                const [y, m, d] = k.split('-').map(Number);
                return new Date(y, m, d);
            })
            .sort((a, b) => a.getTime() - b.getTime());

        let longest = 0;
        let tempStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const diff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                tempStreak++;
            } else if (diff > 1) {
                longest = Math.max(longest, tempStreak);
                tempStreak = 1;
            }
        }
        longest = Math.max(longest, tempStreak);
        if (sortedDates.length === 0) longest = 0;

        // Last 30 days heatmap
        const days: { date: Date; visited: boolean }[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            days.push({ date: d, visited: visitDates.has(key) });
        }

        return { currentStreak: current, longestStreak: longest, last30Days: days };
    }, [visits]);

    const daysThisMonth = last30Days.filter(d => d.visited).length;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consistencia</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Racha de Entrenamiento</p>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-xl">
                    <span className="text-orange-500 text-lg">🔥</span>
                    <span className="text-xl font-black text-orange-600 dark:text-orange-400">{currentStreak}</span>
                    <span className="text-[10px] font-bold text-orange-400 uppercase">días</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{longestStreak}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mejor racha</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{daysThisMonth}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Últimos 30d</p>
                </div>
            </div>

            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Últimos 30 días</p>
                <div className="grid grid-cols-10 gap-1">
                    {last30Days.map((day, i) => (
                        <div
                            key={i}
                            title={day.date.toLocaleDateString('es-ES')}
                            className={`aspect-square rounded-sm transition-colors ${
                                day.visited
                                    ? 'bg-green-500 dark:bg-green-600'
                                    : 'bg-slate-100 dark:bg-slate-800'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
