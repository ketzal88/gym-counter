'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Visit } from '@/services/db';

interface TotalVisitsChartProps {
    visits: Visit[];
    currentYear: number;
}

export default function TotalVisitsChart({ visits, currentYear }: TotalVisitsChartProps) {
    const data = useMemo(() => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const currentYearVisits = visits.filter(v => new Date(v.date).getFullYear() === currentYear);
        const lastYearVisits = visits.filter(v => new Date(v.date).getFullYear() === currentYear - 1);

        return months.map((month, index) => {
            return {
                name: month,
                current: currentYearVisits.filter(v => new Date(v.date).getMonth() === index).length,
                previous: lastYearVisits.filter(v => new Date(v.date).getMonth() === index).length,
            };
        });
    }, [visits, currentYear]);

    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="current"
                    name={`${currentYear}`}
                    stroke="#3b82f6"
                    activeDot={{ r: 6 }}
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="previous"
                    name={`${currentYear - 1}`}
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={{ fill: '#94a3b8', r: 3 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
