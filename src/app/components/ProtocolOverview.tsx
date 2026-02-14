'use client';

import React from 'react';
import { DAY_LABELS, getDayType, getCycleIndex, isDeload } from '@/services/protocolEngine';

interface ProtocolOverviewProps {
    currentDay: number;
    onClose: () => void;
}

export default function ProtocolOverview({ currentDay, onClose }: ProtocolOverviewProps) {
    const currentDayType = getDayType(currentDay);
    const currentCycle = getCycleIndex(currentDay);

    // Calculate next 6 days
    const nextDays = Array.from({ length: 6 }).map((_, i) => {
        const dayNum = currentDay + i;
        const type = getDayType(dayNum);
        return {
            dayNum,
            type: DAY_LABELS[type],
            isDeload: isDeload(getCycleIndex(dayNum))
        };
    });

    const deloadCycles = [4, 8, 12, 16]; // Showing some milestone deloads

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto">
            <div className="bg-slate-900 w-full max-w-xl rounded-[2rem] border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-500">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Plan de Operaciones</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="h-px w-8 bg-blue-600"></span>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Military Operator v1.0</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/30"
                    >
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                <div className="p-8 pt-4 space-y-8">
                    {/* Compact Status Dashboard */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-5 rounded-[1.5rem] border border-blue-500/20">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Día Actual</p>
                            <p className="text-4xl font-black text-white tabular-nums">
                                {currentDay}
                                <span className="text-slate-600 text-sm ml-1">/ 180</span>
                            </p>
                        </div>
                        <div className="flex-1 bg-slate-800/20 p-5 rounded-[1.5rem] border border-slate-700/30">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fase / Ciclo</p>
                            <p className="text-4xl font-black text-slate-200 tabular-nums">0{Math.floor((currentCycle - 1) / 4) + 1} <span className="text-blue-500 text-xs uppercase ml-1">C{currentCycle}</span></p>
                        </div>
                    </div>

                    {/* Highly Scannable 12-Day Structure */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Estructura de Rotación
                            </h3>
                            <span className="text-[10px] text-slate-600 font-bold uppercase">12 Bloques Estándar</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(DAY_LABELS).map(([num, label]) => {
                                const isCurrent = Number(num) === currentDayType;
                                return (
                                    <div
                                        key={num}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${isCurrent ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'bg-slate-800/40 border-slate-800/50 text-slate-500'}`}
                                    >
                                        <span className={`text-[11px] font-black w-7 h-7 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                                            {num}
                                        </span>
                                        <span className={`text-[11px] font-bold tracking-tight truncate ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                                            {label}
                                        </span>
                                        {isCurrent && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Simplified Timeline View */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Próximos Eventos (6 Días)
                            </h3>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                            {nextDays.map((day, idx) => (
                                <div key={idx} className={`min-w-[100px] flex-1 p-3 rounded-2xl border ${idx === 0 ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-800/20 border-slate-800/50'} text-center`}>
                                    <p className={`text-[9px] font-black mb-1 ${idx === 0 ? 'text-green-500' : 'text-slate-500'}`}>D{day.dayNum}</p>
                                    <p className="text-[10px] font-bold text-slate-300 leading-tight h-8 flex items-center justify-center">
                                        {day.type.split('(')[0]}
                                    </p>
                                    {day.isDeload && (
                                        <div className="mt-1 w-full h-1 bg-amber-500/30 rounded-full"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deload Milestones - Mini Progress */}
                    <div className="flex items-center gap-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                            <span className="material-symbols-rounded">low_priority</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-left">Próxima Descarga (Deload)</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 transition-all duration-1000"
                                        style={{ width: `${(currentCycle % 4 || 4) * 25}%` }}
                                    ></div>
                                </div>
                                <span className="text-[11px] font-black text-amber-500 whitespace-nowrap">CICLO {Math.ceil(currentCycle / 4) * 4}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-950/80 border-t border-slate-800/50 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="text-[11px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Cerrar Terminal
                    </button>
                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest italic font-mono">Status: Operation In Progress</p>
                </div>
            </div>
        </div>
    );
}
