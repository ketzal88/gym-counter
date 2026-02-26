'use client';

import { useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { MaxWeight } from '@/services/db';

const LIFTS = [
    { id: 'Squat', label: 'Sentadilla', color: '#a855f7' },
    { id: 'Bench Press', label: 'Banca', color: '#3b82f6' },
    { id: 'Deadlift', label: 'Peso Muerto', color: '#f97316' },
    { id: 'Overhead Press', label: 'OHP', color: '#ef4444' },
];

interface LiftProgressionChartProps {
    weights: MaxWeight[];
}

export default function LiftProgressionChart({ weights }: LiftProgressionChartProps) {
    const [visibleLifts, setVisibleLifts] = useState<Set<string>>(
        new Set(LIFTS.map(l => l.id))
    );

    const data = useMemo(() => {
        const dateMap = new Map<string, Record<string, number>>();

        for (const w of weights) {
            const dateKey = new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            const dateSort = new Date(w.date).getTime();

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { _sort: dateSort });
            }

            const entry = dateMap.get(dateKey)!;
            const current = entry[w.exercise] ?? 0;
            if (w.weight > current) {
                entry[w.exercise] = w.weight;
            }
        }

        return Array.from(dateMap.entries())
            .map(([date, values]) => ({ date, ...values } as { date: string } & Record<string, number>))
            .sort((a, b) => (a._sort ?? 0) - (b._sort ?? 0))
            .slice(-20);
    }, [weights]);

    const toggleLift = (liftId: string) => {
        setVisibleLifts(prev => {
            const next = new Set(prev);
            if (next.has(liftId)) {
                if (next.size > 1) next.delete(liftId);
            } else {
                next.add(liftId);
            }
            return next;
        });
    };

    if (weights.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <span className="material-symbols-rounded text-4xl text-slate-300 dark:text-slate-700 mb-2">show_chart</span>
                <p className="text-sm text-slate-400">Registrá tus pesos máximos para ver la progresión</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Progresión de Fuerza</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Main Lifts</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {LIFTS.map(lift => (
                    <button
                        key={lift.id}
                        onClick={() => toggleLift(lift.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                            visibleLifts.has(lift.id)
                                ? 'border-current opacity-100'
                                : 'border-slate-200 dark:border-slate-700 opacity-40'
                        }`}
                        style={{ color: lift.color }}
                    >
                        {lift.label}
                    </button>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        unit=" kg"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                        }}
                    />
                    <Legend wrapperStyle={{ display: 'none' }} />
                    {LIFTS.filter(l => visibleLifts.has(l.id)).map(lift => (
                        <Line
                            key={lift.id}
                            type="monotone"
                            dataKey={lift.id}
                            name={lift.label}
                            stroke={lift.color}
                            strokeWidth={2.5}
                            dot={{ fill: lift.color, r: 3 }}
                            activeDot={{ r: 5 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
