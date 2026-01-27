'use client';

import { useState } from 'react';
import { Visit, addVisit, deleteDoc, doc, db } from '@/services/db';

interface RecentVisitsManagerProps {
    userId: string;
    visits: Visit[];
}

export default function RecentVisitsManager({ userId, visits }: RecentVisitsManagerProps) {
    const [processingDate, setProcessingDate] = useState<string | null>(null);

    // Generate last 30 days
    const days = [];
    const today = new Date();
    // Reset time part for accurate comparison
    const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let i = 0; i < 30; i++) {
        const d = new Date(todayNoTime);
        d.setDate(todayNoTime.getDate() - i);
        days.push(d);
    }

    const handleToggleVisit = async (date: Date, existingVisit: Visit | undefined) => {
        // Set time to now for new visits, or keep existing time? 
        // For debugging/fixing, maybe set to a default time like 10:00 AM if adding for past days?
        // Or just use the current time if it's today, and noon for past days?
        // Let's just use "now" time if it's today, otherwise 12:00 PM.

        const visitDate = new Date(date);
        if (date.getTime() === todayNoTime.getTime()) {
            const now = new Date();
            visitDate.setHours(now.getHours(), now.getMinutes());
        } else {
            visitDate.setHours(12, 0, 0, 0);
        }

        const dateStr = date.toISOString();
        setProcessingDate(dateStr);

        try {
            if (existingVisit) {
                if (confirm(`¿Eliminar visita del ${date.toLocaleDateString()}?`)) {
                    await deleteDoc(doc(db, 'visits', existingVisit.id));
                }
            } else {
                await addVisit(userId, visitDate);
            }
        } catch (error) {
            console.error('Error toggling visit:', error);
            alert('Error al actualizar la visita');
        } finally {
            setProcessingDate(null);
        }
    };

    const getWeekLabel = (date: Date, index: number) => {
        if (index === 0) return "Esta semana";
        // Simple check: if monday just passed? 
        // Or just hardcode "Semana Anterior" after 7 days? 
        if (index === 7) return "Semana anterior";
        if (index === 14) return "Hace 2 semanas";
        if (index === 21) return "Hace 3 semanas";
        return null;
    };

    return (
        <div className="space-y-4 pb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl flex gap-3 mb-6">
                <span className="material-symbols-rounded text-blue-500">info</span>
                <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-300">
                    Gestiona rápidamente tu historial. Elimina errores o añade visitas que olvidaste registrar.
                </p>
            </div>

            {days.map((date, index) => {
                // Find visit for this day (ignoring time)
                const existingVisit = visits.find(v => {
                    const vDate = new Date(v.date);
                    return vDate.getDate() === date.getDate() &&
                        vDate.getMonth() === date.getMonth() &&
                        vDate.getFullYear() === date.getFullYear();
                });

                const isProcessing = processingDate === date.toISOString();

                const isToday = index === 0;
                const isYesterday = index === 1;

                let dateLabel = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
                if (isToday) dateLabel = `Hoy, ${dateLabel}`;
                else if (isYesterday) dateLabel = `Ayer, ${dateLabel}`;

                // Capitalize first letter
                dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

                const weekLabel = getWeekLabel(date, index);

                return (
                    <div key={date.toISOString()}>
                        {weekLabel && (
                            <div className="py-4 flex items-center gap-4">
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{weekLabel}</span>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                        )}

                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${existingVisit
                                ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-200 dark:border-slate-700'
                            }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${existingVisit
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                    }`}>
                                    <span className={`material-symbols-rounded ${existingVisit ? 'font-bold' : 'font-light'}`}>
                                        {existingVisit ? 'check_circle' : 'calendar_today'}
                                    </span>
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${existingVisit ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {dateLabel}
                                    </p>
                                    <p className="text-[11px] text-slate-400 uppercase font-medium">
                                        {existingVisit
                                            ? `Registrado a las ${new Date(existingVisit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : 'Sin registro'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleToggleVisit(date, existingVisit)}
                                disabled={isProcessing}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${existingVisit
                                        ? 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        : 'bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:scale-105 active:scale-95'
                                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? (
                                    <span className="material-symbols-rounded animate-spin text-sm">refresh</span>
                                ) : (
                                    <span className="material-symbols-rounded">
                                        {existingVisit ? 'delete' : 'add'}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}

            <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <span className="material-symbols-rounded text-4xl mb-2 opacity-20">history</span>
                <p className="text-xs italic">Mostrando hasta hace 30 días</p>
            </div>
        </div>
    );
}
