'use client';

import React, { useState } from 'react';
import { DAY_LABELS, TEMPLATES, WARMUP, getDayType, getCycleIndex, isDeload } from '@/services/protocolEngine';

interface ProtocolOverviewProps {
    currentDay: number;
    onClose: () => void;
}

export default function ProtocolOverview({ currentDay, onClose }: ProtocolOverviewProps) {
    const currentDayType = getDayType(currentDay);
    const currentCycle = getCycleIndex(currentDay);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [view, setView] = useState<'overview' | 'full'>('overview');

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

    const blockTypeIcon = (blockType: string) => {
        switch (blockType) {
            case 'conditioning': return 'timer';
            case 'warmup': return 'local_fire_department';
            default: return 'fitness_center';
        }
    };

    const blockTypeColor = (blockType: string) => {
        switch (blockType) {
            case 'conditioning': return 'text-indigo-400 bg-indigo-500/10';
            default: return 'text-blue-400 bg-blue-500/10';
        }
    };

    // Generate 180-day timeline grouped by cycles
    const cycles = Array.from({ length: 15 }).map((_, cycleIdx) => {
        const cycleNum = cycleIdx + 1;
        const startDay = cycleIdx * 12 + 1;
        const deload = isDeload(cycleNum);
        const days = Array.from({ length: 12 }).map((_, dayIdx) => {
            const absoluteDay = startDay + dayIdx;
            const dayType = dayIdx + 1;
            return {
                absoluteDay,
                dayType,
                label: DAY_LABELS[dayType],
                completed: absoluteDay < currentDay,
                isCurrent: absoluteDay === currentDay,
                isDeload: deload
            };
        });
        return { cycleNum, startDay, deload, days };
    });

    return (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
            <div className="max-w-xl mx-auto min-h-full">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50">
                    <div className="p-6 pb-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Plan de Operaciones</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-px w-8 bg-blue-600"></span>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Military Operator v1.0</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/30"
                        >
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>

                    {/* Tab Switcher */}
                    <div className="px-6 pb-4 flex gap-2">
                        <button
                            onClick={() => setView('overview')}
                            className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${view === 'overview' ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'}`}
                        >
                            Resumen
                        </button>
                        <button
                            onClick={() => setView('full')}
                            className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${view === 'full' ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'}`}
                        >
                            Programa Completo
                        </button>
                    </div>
                </div>

                {/* OVERVIEW VIEW */}
                {view === 'overview' && (
                    <div className="p-6 space-y-6">
                        {/* Status Dashboard */}
                        <div className="flex gap-3">
                            <div className="flex-1 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-4 rounded-2xl border border-blue-500/20">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Día Actual</p>
                                <p className="text-3xl font-black text-white tabular-nums">
                                    {currentDay}
                                    <span className="text-slate-600 text-sm ml-1">/ 180</span>
                                </p>
                            </div>
                            <div className="flex-1 bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fase / Ciclo</p>
                                <p className="text-3xl font-black text-slate-200 tabular-nums">
                                    0{Math.floor((currentCycle - 1) / 4) + 1}
                                    <span className="text-blue-500 text-xs uppercase ml-1">C{currentCycle}</span>
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30">
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progreso Total</span>
                                <span className="text-[11px] font-black text-blue-400">{Math.round((currentDay / 180) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all" style={{ width: `${(currentDay / 180) * 100}%` }} />
                            </div>
                        </div>

                        {/* Next Days */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Próximos 6 Días
                            </h3>
                            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                                {nextDays.map((day, idx) => (
                                    <div key={idx} className={`min-w-[100px] flex-1 p-3 rounded-2xl border ${idx === 0 ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-800/20 border-slate-800/50'} text-center`}>
                                        <p className={`text-[9px] font-black mb-1 ${idx === 0 ? 'text-green-500' : 'text-slate-500'}`}>D{day.dayNum}</p>
                                        <p className="text-[10px] font-bold text-slate-300 leading-tight h-8 flex items-center justify-center">
                                            {day.type.split('(')[0]}
                                        </p>
                                        {day.isDeload && <div className="mt-1 w-full h-1 bg-amber-500/30 rounded-full"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 12-Day Rotation with Expandable Exercises */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Estructura de Rotación
                                </h3>
                                <span className="text-[10px] text-slate-600 font-bold uppercase">Tocá para ver ejercicios</span>
                            </div>

                            <div className="space-y-2">
                                {Object.entries(TEMPLATES).map(([num, template]) => {
                                    const dayNum = Number(num);
                                    const isCurrent = dayNum === currentDayType;
                                    const isExpanded = expandedDay === dayNum;

                                    return (
                                        <div key={num} className="overflow-hidden rounded-xl border transition-all"
                                            style={{ borderColor: isCurrent ? 'rgba(59,130,246,0.5)' : isExpanded ? 'rgba(100,116,139,0.3)' : 'rgba(30,41,59,0.5)' }}>
                                            <button
                                                onClick={() => setExpandedDay(isExpanded ? null : dayNum)}
                                                className={`w-full flex items-center gap-3 p-3 transition-all ${isCurrent ? 'bg-blue-600/10' : isExpanded ? 'bg-slate-800/60' : 'bg-slate-800/40'}`}
                                            >
                                                <span className={`text-[11px] font-black w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                                                    {num}
                                                </span>
                                                <span className={`text-[11px] font-bold tracking-tight text-left flex-1 ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {template.type}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {template.mainLift && (
                                                        <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase">{template.mainLift}</span>
                                                    )}
                                                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>}
                                                    <span className={`material-symbols-rounded text-slate-600 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                        expand_more
                                                    </span>
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="bg-slate-950/40 p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                    {/* Warmup */}
                                                    <div className="mb-3">
                                                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">Calentamiento</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {WARMUP.map((w, i) => (
                                                                <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-800/60 px-2 py-1 rounded-lg">
                                                                    {w.name} x{w.reps}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Main Lift */}
                                                    {template.mainLift && (
                                                        <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                                                                <span className="material-symbols-rounded text-white text-sm">fitness_center</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black text-white uppercase">{template.mainLift} (Main)</p>
                                                                <p className="text-[10px] text-blue-400 font-bold">5x5 @ Training Max</p>
                                                            </div>
                                                            <span className="text-[9px] font-black bg-blue-500/20 text-blue-400 px-2 py-1 rounded uppercase">Principal</span>
                                                        </div>
                                                    )}

                                                    {/* Accessories */}
                                                    {template.accessories.map((acc, i) => (
                                                        <div key={i} className={`rounded-xl p-3 flex items-center gap-3 ${acc.blockType === 'conditioning' ? 'bg-indigo-500/5 border border-indigo-500/20' : 'bg-slate-800/30 border border-slate-700/20'}`}>
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${blockTypeColor(acc.blockType || 'strength')}`}>
                                                                <span className="material-symbols-rounded text-sm">{blockTypeIcon(acc.blockType || 'strength')}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-bold text-slate-200 truncate">{acc.name}</p>
                                                                {acc.conditioning ? (
                                                                    <div>
                                                                        <p className="text-[10px] text-indigo-400 font-bold">{acc.conditioning.format} - {acc.conditioning.duration}</p>
                                                                        <p className="text-[10px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">{acc.conditioning.instructions}</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[10px] text-slate-500 font-bold">{acc.sets}x{acc.reps} {acc.exerciseType ? `(${acc.exerciseType})` : ''}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Deload Info */}
                        <div className="flex items-center gap-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50">
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                                <span className="material-symbols-rounded">low_priority</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-left">Próxima Descarga (Deload)</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(currentCycle % 4 || 4) * 25}%` }}></div>
                                    </div>
                                    <span className="text-[11px] font-black text-amber-500 whitespace-nowrap">CICLO {Math.ceil(currentCycle / 4) * 4}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FULL PROGRAM VIEW */}
                {view === 'full' && (
                    <div className="p-6 space-y-6">
                        {/* Legend */}
                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Leyenda</p>
                            <div className="flex flex-wrap gap-3">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50"></span> Completado
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <span className="w-3 h-3 rounded bg-blue-500 border border-blue-500"></span> Hoy
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span> Pendiente
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                                    <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50"></span> Deload
                                </span>
                            </div>
                        </div>

                        {/* Cycles Timeline */}
                        {cycles.map((cycle) => (
                            <div key={cycle.cycleNum} className={`rounded-2xl border overflow-hidden ${cycle.deload ? 'border-amber-500/20' : 'border-slate-800/50'}`}>
                                {/* Cycle Header */}
                                <div className={`px-4 py-3 flex items-center justify-between ${cycle.deload ? 'bg-amber-500/5' : 'bg-slate-800/30'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-black ${cycle.deload ? 'text-amber-400' : 'text-white'}`}>
                                            Ciclo {cycle.cycleNum}
                                        </span>
                                        {cycle.deload && (
                                            <span className="text-[9px] font-black bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase">Deload</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">
                                        Día {cycle.startDay} - {cycle.startDay + 11}
                                    </span>
                                </div>

                                {/* Days Grid */}
                                <div className="p-3 grid grid-cols-4 gap-1.5">
                                    {cycle.days.map((day) => {
                                        let bgClass = 'bg-slate-800/40 text-slate-600';
                                        let dotClass = '';

                                        if (day.completed) {
                                            bgClass = 'bg-green-500/10 text-green-500';
                                            dotClass = 'bg-green-500';
                                        } else if (day.isCurrent) {
                                            bgClass = 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/50';
                                            dotClass = 'bg-blue-500 animate-pulse';
                                        }

                                        return (
                                            <div key={day.absoluteDay} className={`p-2 rounded-lg text-center transition-all ${bgClass}`}>
                                                <p className="text-[9px] font-black mb-0.5 flex items-center justify-center gap-1">
                                                    D{day.absoluteDay}
                                                    {dotClass && <span className={`w-1 h-1 rounded-full ${dotClass}`}></span>}
                                                </p>
                                                <p className="text-[8px] font-bold leading-tight opacity-70 truncate">
                                                    {day.label.split('(')[0].split('/')[0].trim()}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Program Summary */}
                        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/30 space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumen del Programa</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900/50 p-3 rounded-xl">
                                    <p className="text-2xl font-black text-white">180</p>
                                    <p className="text-[10px] text-slate-500 font-bold">Días totales</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-xl">
                                    <p className="text-2xl font-black text-white">15</p>
                                    <p className="text-[10px] text-slate-500 font-bold">Ciclos de 12 días</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-xl">
                                    <p className="text-2xl font-black text-amber-400">4</p>
                                    <p className="text-[10px] text-slate-500 font-bold">Semanas deload</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-xl">
                                    <p className="text-2xl font-black text-blue-400">12</p>
                                    <p className="text-[10px] text-slate-500 font-bold">Tipos de sesión</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="sticky bottom-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/50 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="text-[11px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Cerrar
                    </button>
                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest italic font-mono">Status: Operation In Progress</p>
                </div>
            </div>
        </div>
    );
}
