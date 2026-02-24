'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { BodyMeasurement } from '@/services/db';

interface BodyCompositionChartProps {
    measurements: BodyMeasurement[];
}

export default function BodyCompositionChart({ measurements }: BodyCompositionChartProps) {
    const data = useMemo(() => {
        return [...measurements]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-20)
            .map(m => ({
                date: new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                muscle: m.muscle,
                fat: m.fat,
            }));
    }, [measurements]);

    if (measurements.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <span className="material-symbols-rounded text-4xl text-slate-300 dark:text-slate-700 mb-2">monitoring</span>
                <p className="text-sm text-slate-400">Registrá mediciones corporales para ver la tendencia</p>
            </div>
        );
    }

    const latestMuscle = data[data.length - 1]?.muscle;
    const latestFat = data[data.length - 1]?.fat;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Composición Corporal</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Músculo & Grasa</p>
                </div>
                <div className="flex gap-3 text-right">
                    <div>
                        <p className="text-[10px] font-bold text-green-500 uppercase">Músculo</p>
                        <p className="text-lg font-black text-green-600">{latestMuscle}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase">Grasa</p>
                        <p className="text-lg font-black text-red-500">{latestFat}%</p>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
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
                        unit="%"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                        }}
                        formatter={(value: number, name: string) => [
                            `${value}%`,
                            name === 'muscle' ? 'Músculo' : 'Grasa'
                        ]}
                    />
                    <Line
                        type="monotone"
                        dataKey="muscle"
                        name="Músculo"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ fill: '#10b981', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="fat"
                        name="Grasa"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ fill: '#ef4444', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
