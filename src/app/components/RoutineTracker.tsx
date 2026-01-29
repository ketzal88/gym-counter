'use client';

import { useState } from 'react';
import { ROUTINES, FINISHER, Routine, Exercise } from '@/data/routines';
import { addWorkoutLog } from '@/services/db';

interface RoutineTrackerProps {
    userId: string;
}

export default function RoutineTracker({ userId }: RoutineTrackerProps) {
    const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
    const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
    const [exerciseLogs, setExerciseLogs] = useState<Record<string, { reps: string, weight: string }[]>>({});
    const [finisherCompleted, setFinisherCompleted] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleRoutineSelect = (routine: Routine) => {
        setSelectedRoutine(routine);
        // Reset state for new routine
        setCompletedExercises({});
        const initialLogs: Record<string, { reps: string, weight: string }[]> = {};
        routine.exercises.forEach(ex => {
            initialLogs[ex.id] = Array(ex.series).fill({ reps: '', weight: '' });
        });
        setExerciseLogs(initialLogs);
    };

    const toggleExercise = (id: string) => {
        setCompletedExercises(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const updateLog = (exId: string, setIndex: number, field: 'reps' | 'weight', value: string) => {
        setExerciseLogs(prev => {
            const newLogs = [...(prev[exId] || [])];
            newLogs[setIndex] = { ...newLogs[setIndex], [field]: value };
            return { ...prev, [exId]: newLogs };
        });
    };

    const handleSave = async () => {
        if (!selectedRoutine || !userId) return;
        setSaving(true);
        try {
            const exercisesToLog = selectedRoutine.exercises.map(ex => ({
                exerciseId: ex.id,
                exerciseName: ex.name,
                sets: exerciseLogs[ex.id].map(s => ({
                    reps: parseInt(s.reps) || 0,
                    weight: parseFloat(s.weight) || 0,
                    completed: completedExercises[ex.id] || false
                }))
            }));

            await addWorkoutLog({
                userId,
                routineId: selectedRoutine.id,
                routineName: selectedRoutine.name,
                date: new Date().toISOString().split('T')[0],
                exercises: exercisesToLog,
                finisherCompleted
            });

            alert('¡Rutina guardada con éxito! 💪');
            setSelectedRoutine(null);
            setCompletedExercises({});
            setExerciseLogs({});
            setFinisherCompleted(false);
        } catch (error) {
            console.error("Error saving workout:", error);
            alert('Error al guardar la rutina');
        } finally {
            setSaving(false);
        }
    };

    if (!selectedRoutine) {
        return (
            <div className="space-y-6">
                <header>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Selecciona tu Rutina</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Elige el entrenamiento de hoy</p>
                </header>

                <div className="grid gap-4">
                    {ROUTINES.map(routine => (
                        <button
                            key={routine.id}
                            onClick={() => handleRoutineSelect(routine)}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-left hover:border-blue-500 transition-all group"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{routine.id === 'A' ? 'Fuerza' : routine.id === 'B' ? 'Potencia' : 'Resistencia'}</span>
                                <span className="material-symbols-rounded text-slate-300 group-hover:text-blue-500 transition-colors">arrow_forward</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-1">{routine.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{routine.exercises.length} ejercicios</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <header className="flex items-center gap-4">
                <button onClick={() => setSelectedRoutine(null)} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <div>
                    <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{selectedRoutine.name}</h2>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Entrenando ahora</p>
                </div>
            </header>

            {selectedRoutine.note && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 flex gap-3">
                    <span className="material-symbols-rounded text-blue-500">psychology</span>
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">{selectedRoutine.note}</p>
                </div>
            )}

            <div className="space-y-6">
                {selectedRoutine.exercises.map((ex) => (
                    <div key={ex.id} className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all ${completedExercises[ex.id] ? 'border-green-500/50 shadow-lg shadow-green-500/5' : 'border-slate-100 dark:border-slate-800'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => toggleExercise(ex.id)}
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${completedExercises[ex.id] ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'}`}
                                >
                                    <span className="material-symbols-rounded font-bold">{completedExercises[ex.id] ? 'check' : 'fitness_center'}</span>
                                </button>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{ex.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ex.series} series × {ex.reps} reps</p>
                                </div>
                            </div>
                            {ex.videoUrl && (
                                <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:scale-105 active:scale-95 transition-all">
                                    <span className="material-symbols-rounded">play_circle</span>
                                </a>
                            )}
                        </div>

                        <div className="grid gap-2">
                            {Array.from({ length: ex.series }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 w-4">S{i + 1}</span>
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="Peso"
                                                value={exerciseLogs[ex.id]?.[i]?.weight || ''}
                                                onChange={(e) => updateLog(ex.id, i, 'weight', e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-3 py-2 text-xs font-bold text-center"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">kg</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="Reps"
                                                value={exerciseLogs[ex.id]?.[i]?.reps || ''}
                                                onChange={(e) => updateLog(ex.id, i, 'reps', e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-3 py-2 text-xs font-bold text-center"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">x</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Finisher Section */}
                <div className={`bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden transition-all ${finisherCompleted ? 'opacity-100 scale-100' : 'opacity-90'}`}>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{FINISHER.name}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Circuito de resistencia</p>
                            </div>
                            <button
                                onClick={() => setFinisherCompleted(!finisherCompleted)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${finisherCompleted ? 'bg-white text-orange-600 scale-110' : 'bg-white/20 text-white'}`}
                            >
                                <span className="material-symbols-rounded text-2xl font-bold">{finisherCompleted ? 'star' : 'local_fire_department'}</span>
                            </button>
                        </div>
                        <p className="text-xs opacity-90 mb-4 italic leading-relaxed">{FINISHER.note}</p>
                        <ul className="space-y-2">
                            {FINISHER.exercises.map((fex, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs font-bold bg-white/10 p-2 rounded-xl">
                                    <span className="material-symbols-rounded text-sm">bolt</span>
                                    <span>{fex.name}: {fex.reps} reps</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving || !selectedRoutine}
                className={`w-full py-5 rounded-[2rem] font-black text-lg tracking-tight shadow-xl transition-all flex items-center justify-center gap-2 ${saving ? 'bg-slate-200 text-slate-400 bg-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-95 shadow-blue-500/30'}`}
            >
                {saving ? (
                    'Guardando...'
                ) : (
                    <>
                        <span className="material-symbols-rounded">save</span>
                        TERMINAR ENTRENAMIENTO
                    </>
                )}
            </button>
        </div>
    );
}
