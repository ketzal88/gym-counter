'use client';

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { WorkoutLog } from '@/services/db';

interface WeeklyVolumeChartProps {
    workouts: WorkoutLog[];
}

function getWeekLabel(date: Date): string {
    const start = new Date(date);
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    return start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function getWeekKey(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + mondayOffset);
    return d.toISOString().split('T')[0];
}

export default function WeeklyVolumeChart({ workouts }: WeeklyVolumeChartProps) {
    const data = useMemo(() => {
        const weekMap = new Map<string, { label: string; volume: number; sessions: number }>();

        for (const w of workouts) {
            const date = new Date(w.date);
            const key = getWeekKey(date);

            if (!weekMap.has(key)) {
                weekMap.set(key, { label: getWeekLabel(date), volume: 0, sessions: 0 });
            }

            const entry = weekMap.get(key)!;
            entry.sessions += 1;

            for (const ex of w.exercises) {
                for (const set of ex.sets) {
                    if (set.completed && set.weight > 0) {
                        entry.volume += set.reps * set.weight;
                    }
                }
            }
        }

        return Array.from(weekMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-8)
            .map(([, v]) => v);
    }, [workouts]);

    if (workouts.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <span className="material-symbols-rounded text-4xl text-slate-300 dark:text-slate-700 mb-2">bar_chart</span>
                <p className="text-sm text-slate-400">Completá entrenamientos para ver el volumen semanal</p>
            </div>
        );
    }

    const maxVolume = Math.max(...data.map(d => d.volume));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Volumen Semanal</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Últimas 8 semanas</p>
                </div>
                {data.length > 0 && (
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Última semana</p>
                        <p className="text-lg font-black text-blue-600">
                            {(data[data.length - 1].volume / 1000).toFixed(1)}t
                        </p>
                    </div>
                )}
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}t` : `${v}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                        }}
                        formatter={(value) => [`${(value ?? 0).toLocaleString()} kg`, 'Volumen']}
                        labelFormatter={(label) => `Semana del ${label}`}
                    />
                    <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={`rgba(59, 130, 246, ${0.4 + (entry.volume / maxVolume) * 0.6})`}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
