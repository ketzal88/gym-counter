'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribeToMaxWeights, addMaxWeight, MaxWeight, WorkoutLog } from '@/services/db';

const MAIN_EXERCISES = [
    { id: 'Squat', label: 'Sentadilla', muscle: 'Piernas', icon: 'directions_run', color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 'Bench Press', label: 'Press de Banca', muscle: 'Pecho', icon: 'fitness_center', color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'Deadlift', label: 'Peso Muerto', muscle: 'Espalda', icon: 'reorder', color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'Overhead Press', label: 'Press Militar', muscle: 'Hombros', icon: 'accessibility_new', color: 'text-red-600', bg: 'bg-red-100' },
];

const ACCESSORY_EXERCISES = [
    { id: 'Barbell Curl', label: 'Curl con Barra', muscle: 'Bíceps', icon: 'fitness_center', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 'Dumbbell Shoulder Press', label: 'Press Hombro Mancuerna', muscle: 'Hombros', icon: 'accessibility_new', color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { id: 'Lateral Raises', label: 'Elevaciones Laterales', muscle: 'Hombros', icon: 'open_with', color: 'text-sky-600', bg: 'bg-sky-100' },
    { id: 'Triceps Rope Pushdown', label: 'Pushdown Tríceps', muscle: 'Tríceps', icon: 'fitness_center', color: 'text-pink-600', bg: 'bg-pink-100' },
    { id: 'Barbell Row', label: 'Remo con Barra', muscle: 'Espalda', icon: 'reorder', color: 'text-amber-600', bg: 'bg-amber-100' },
    { id: 'Pull-ups', label: 'Dominadas', muscle: 'Espalda', icon: 'keyboard_double_arrow_up', color: 'text-indigo-600', bg: 'bg-indigo-100' },
];

const ALL_KNOWN_EXERCISES = [...MAIN_EXERCISES, ...ACCESSORY_EXERCISES];

interface MaxWeightsSectionProps {
    userId: string;
    workoutLogs?: WorkoutLog[];
}

interface ExerciseStat {
    id: string;
    label: string;
    muscle: string;
    icon: string;
    color: string;
    bg: string;
    current: MaxWeight | undefined;
    previous: MaxWeight | undefined;
    trend: string;
    fromLogs: boolean;
}

export default function MaxWeightsSection({ userId, workoutLogs = [] }: MaxWeightsSectionProps) {
    const [weights, setWeights] = useState<MaxWeight[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showAccessories, setShowAccessories] = useState(false);

    const [formExercise, setFormExercise] = useState(MAIN_EXERCISES[1].id);
    const [formWeight, setFormWeight] = useState('100');
    const [formReps, setFormReps] = useState('1');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToMaxWeights(userId, (data) => {
            setWeights(data);
        });
        return () => unsubscribe();
    }, [userId]);

    const handleSubmit = async () => {
        if (!formWeight) return;
        setSaving(true);
        try {
            await addMaxWeight(userId, new Date(), formExercise, parseFloat(formWeight), parseInt(formReps));
            setShowForm(false);
            setFormWeight('');
            setFormReps('1');
        } catch (error) {
            console.error("Error adding max weight:", error);
        } finally {
            setSaving(false);
        }
    };

    // Auto-detect exercises from workout logs that have weight data
    const logDetectedExercises = useMemo(() => {
        const knownIds = new Set(ALL_KNOWN_EXERCISES.map(e => e.id));
        const detected = new Map<string, { maxWeight: number; maxReps: number; name: string; date: string }>();

        for (const log of workoutLogs) {
            for (const ex of log.exercises) {
                if (knownIds.has(ex.exerciseName)) continue;

                for (const set of ex.sets) {
                    if (set.completed && set.weight > 0) {
                        const existing = detected.get(ex.exerciseName);
                        if (!existing || set.weight > existing.maxWeight) {
                            detected.set(ex.exerciseName, {
                                maxWeight: set.weight,
                                maxReps: set.reps,
                                name: ex.exerciseName,
                                date: log.date,
                            });
                        }
                    }
                }
            }
        }

        return detected;
    }, [workoutLogs]);

    const buildStats = (exercises: typeof MAIN_EXERCISES): ExerciseStat[] => {
        return exercises.map(ex => {
            const history = weights
                .filter(w => w.exercise === ex.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const current = history[0];
            const previous = history[1];

            let trend = 0;
            if (current && previous) {
                trend = ((current.weight - previous.weight) / previous.weight) * 100;
            }

            return { ...ex, current, previous, trend: trend.toFixed(1), fromLogs: false };
        });
    };

    const mainStats = buildStats(MAIN_EXERCISES);
    const accessoryStats = buildStats(ACCESSORY_EXERCISES);

    // Merge log-detected exercises that aren't in known lists
    const logExerciseStats: ExerciseStat[] = useMemo(() => {
        return Array.from(logDetectedExercises.entries()).map(([name, data]) => {
            // Check if there's a manual max weight record too
            const history = weights
                .filter(w => w.exercise === name)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const manualRecord = history[0];
            const bestWeight = manualRecord
                ? Math.max(manualRecord.weight, data.maxWeight)
                : data.maxWeight;

            return {
                id: name,
                label: name,
                muscle: 'Otro',
                icon: 'exercise',
                color: 'text-slate-600',
                bg: 'bg-slate-100',
                current: manualRecord && manualRecord.weight >= data.maxWeight
                    ? manualRecord
                    : { id: '', userId, date: data.date, exercise: name, weight: bestWeight, reps: data.maxReps, timestamp: new Date() },
                previous: history[1],
                trend: '0',
                fromLogs: true,
            };
        });
    }, [logDetectedExercises, weights, userId]);

    const allFormExercises = [
        ...MAIN_EXERCISES,
        ...ACCESSORY_EXERCISES,
        ...logExerciseStats.map(e => ({ id: e.id, label: e.label })),
    ];

    const renderExerciseCard = (stat: ExerciseStat) => (
        <div key={stat.id} className="relative group bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md">
            <div className="flex p-4 gap-4 items-center">
                <div className={`size-14 ${stat.bg} dark:bg-opacity-20 flex items-center justify-center rounded-2xl shrink-0`}>
                    <span className={`material-symbols-rounded ${stat.color} text-2xl`}>{stat.icon}</span>
                </div>

                <div className="flex flex-col grow min-w-0">
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.muscle}</p>
                    <p className="text-slate-900 dark:text-white text-base font-extrabold leading-tight">{stat.label}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] truncate mt-0.5">
                        {stat.current ? `Último: ${new Date(stat.current.date).toLocaleDateString('es-ES')}` : 'Sin registros'}
                        {stat.fromLogs && stat.current && <span className="ml-1 text-blue-400">(auto)</span>}
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                        {stat.current ? `${stat.current.weight} kg` : '-'}
                    </span>
                    {stat.current && stat.current.reps > 0 && (
                        <span className="text-[10px] text-slate-400 font-bold">x{stat.current.reps} rep{stat.current.reps > 1 ? 's' : ''}</span>
                    )}
                    {stat.current && stat.previous && parseFloat(stat.trend) !== 0 && (
                        <span className={`text-[10px] font-bold flex items-center ${parseFloat(stat.trend) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <span className="material-symbols-rounded text-xs mr-0.5">
                                {parseFloat(stat.trend) >= 0 ? 'trending_up' : 'trending_down'}
                            </span>
                            {parseFloat(stat.trend) > 0 ? '+' : ''}{stat.trend}%
                        </span>
                    )}
                </div>
            </div>

            <div className="px-4 pb-3">
                <div className="flex justify-end pt-2 border-t border-slate-50 dark:border-slate-800/50">
                    <button
                        onClick={() => {
                            setFormExercise(stat.id);
                            setFormWeight(stat.current ? stat.current.weight.toString() : '50');
                            setShowForm(true);
                        }}
                        className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                        <span className="material-symbols-rounded text-lg">add</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Main Lifts</h3>
            {mainStats.map(renderExerciseCard)}

            {/* Accessory Exercises Section */}
            <button
                onClick={() => setShowAccessories(!showAccessories)}
                className="w-full flex items-center justify-between px-1 py-2 group"
            >
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Ejercicios Accesorios ({accessoryStats.length + logExerciseStats.length})
                </h3>
                <span className={`material-symbols-rounded text-slate-400 transition-transform ${showAccessories ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {showAccessories && (
                <div className="space-y-3 animate-fade-in">
                    {accessoryStats.map(renderExerciseCard)}

                    {logExerciseStats.length > 0 && (
                        <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 pt-2">
                                Detectados de tus workouts
                            </p>
                            {logExerciseStats.map(renderExerciseCard)}
                        </>
                    )}
                </div>
            )}

            {/* Add Record Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                        onClick={() => setShowForm(false)}
                    ></div>

                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl p-6 pointer-events-auto animate-[slide-up_0.3s_ease-out] relative">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>

                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuevo Récord</h3>
                            <div className="w-6"></div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ejercicio</label>
                                <select
                                    value={formExercise}
                                    onChange={(e) => setFormExercise(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 dark:text-white focus:ring-0"
                                >
                                    <optgroup label="Main Lifts">
                                        {MAIN_EXERCISES.map(ex => <option key={ex.id} value={ex.id}>{ex.label}</option>)}
                                    </optgroup>
                                    <optgroup label="Accesorios">
                                        {ACCESSORY_EXERCISES.map(ex => <option key={ex.id} value={ex.id}>{ex.label}</option>)}
                                    </optgroup>
                                    {logExerciseStats.length > 0 && (
                                        <optgroup label="De tus workouts">
                                            {logExerciseStats.map(ex => <option key={ex.id} value={ex.id}>{ex.label}</option>)}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            <div className="flex flex-col items-center gap-4 py-4">
                                <h4 className="text-blue-500 text-xs font-bold uppercase tracking-widest">Peso (kg)</h4>
                                <div className="flex items-center justify-between w-full max-w-[280px]">
                                    <button
                                        onClick={() => setFormWeight((prev) => (parseFloat(prev) - 2.5).toFixed(1))}
                                        className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center hover:bg-blue-100 hover:scale-105 transition-all"
                                    >
                                        <span className="material-symbols-rounded font-bold">remove</span>
                                    </button>
                                    <input
                                        type="number"
                                        value={formWeight}
                                        onChange={(e) => setFormWeight(e.target.value)}
                                        className="w-32 bg-transparent border-none text-center text-6xl font-black text-slate-900 dark:text-white focus:ring-0 p-0"
                                    />
                                    <button
                                        onClick={() => setFormWeight((prev) => (parseFloat(prev) + 2.5).toFixed(1))}
                                        className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center hover:bg-blue-100 hover:scale-105 transition-all"
                                    >
                                        <span className="material-symbols-rounded font-bold">add</span>
                                    </button>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-400 mb-3">Repeticiones</p>
                                <div className="flex justify-center gap-3">
                                    {['1', '2', '3', '5'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setFormReps(r)}
                                            className={`w-12 h-10 rounded-full font-bold transition-all ${formReps === r
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-8">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
                            >
                                {saving ? 'Guardando...' : 'Guardar Récord'}
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="w-full bg-transparent text-slate-400 font-bold py-4 hover:text-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
