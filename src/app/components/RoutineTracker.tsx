'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    generateWorkout,
    generateWorkoutForGoal,
    resolveGoalFromVariantId,
    evaluateUnlock,
    ProtocolWorkout,
} from '@/services/protocolEngine';
import {
    addWorkoutLog,
    subscribeToUserTrainingState,
    initializeUserTrainingState,
    updateUserTrainingState,
    UserTrainingState
} from '@/services/db';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/services/db';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useToast } from '@/hooks/useToast';
import { useLanguage } from '@/context/LanguageContext';
import { hasVideo } from '@/data/exerciseVideos';
import YouTubeVideoModal from './YouTubeVideoModal';
import ToastContainer from './ui/ToastContainer';
import ConfirmDialog from './ui/ConfirmDialog';

interface RoutineTrackerProps {
    userId: string;
}

export default function RoutineTracker({ userId }: RoutineTrackerProps) {
    const { t } = useLanguage();
    const [userState, setUserState] = useState<UserTrainingState | null>(null);
    const [loading, setLoading] = useState(true);
    const [workout, setWorkout] = useState<ProtocolWorkout | null>(null);

    // Tracking state
    const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
    const [exerciseLogs, setExerciseLogs] = useState<Record<string, { reps: string, weight: string, completed: boolean }[]>>({});
    const [saving, setSaving] = useState(false);
    const { toasts, addToast, removeToast } = useToast();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [videoExercise, setVideoExercise] = useState<{ id: string; name: string } | null>(null);

    // Sequential workout flow
    const [workoutStarted, setWorkoutStarted] = useState(false);
    const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Rest Timer & Wake Lock
    const { restTimer, timerActive, restDuration, startRestTimer, cancelRestTimer, formatTime } = useRestTimer();
    useWakeLock();

    // Initialization Modal State
    const [showInitModal, setShowInitModal] = useState(false);
    const [initLifts, setInitLifts] = useState({
        bench: '',
        squat: '',
        deadlift: '',
        ohp: '',
        pullups: ''
    });

    // Helper: Round Numbers
    const roundTo2_5 = (num: number) => Math.round(num / 2.5) * 2.5;
    const roundTo5 = (num: number) => Math.round(num / 5) * 5;

    // Elapsed timer
    useEffect(() => {
        if (!workoutStarted || !workoutStartTime) return;
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [workoutStarted, workoutStartTime]);

    const formatElapsed = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Load User State
    useEffect(() => {
        if (!userId) return;
        const unsub = subscribeToUserTrainingState(userId, (state) => {
            setUserState(state);
            setLoading(false);
            if (!state) {
                setShowInitModal(true);
            }
        });
        return () => unsub();
    }, [userId]);

    // Fetch Last Accessory Performance (Smart Memory)
    const fetchLastPerformance = useCallback(async (exerciseId: string) => {
        try {
            const q = query(
                collection(db, 'workouts'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(5)
            );
            const snapshot = await getDocs(q);

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const ex = data.exercises.find((e: { exerciseId: string }) => e.exerciseId === exerciseId);

                if (ex && ex.sets && ex.sets.length > 0) {
                    const bestSet = ex.sets.reduce((max: { weight: string; reps: string }, current: { weight: string; reps: string }) => {
                        return (parseFloat(current.weight) || 0) > (parseFloat(max.weight) || 0) ? current : max;
                    }, ex.sets[0]);

                    if (bestSet && bestSet.weight) {
                        return { weight: bestSet.weight, reps: bestSet.reps };
                    }
                }
            }
        } catch (e) {
            console.error("Error fetching history", e);
        }
        return null;
    }, [userId]);

    // Generate Workout & Prefill
    useEffect(() => {
        const prepareWorkout = async () => {
            if (userState && userState.liftState) {
                const goal = userState.assignedVariant
                    ? resolveGoalFromVariantId(userState.assignedVariant)
                    : 'military_v1';
                const generated = goal === 'military_v1'
                    ? generateWorkout(userState.currentDay, userState.liftState)
                    : generateWorkoutForGoal(userState.currentDay, userState.liftState, goal);

                const logs: Record<string, { reps: string; weight: string; completed: boolean }[]> = {};

                for (const ex of generated.exercises) {
                    let prefilledWeight = ex.weight ? ex.weight.toString() : '';
                    let prefilledReps = '';

                    if (ex.blockType === 'strength' && !ex.weight) {
                        const lastPerf = await fetchLastPerformance(ex.id);
                        if (lastPerf) {
                            prefilledWeight = lastPerf.weight.toString();
                            prefilledReps = lastPerf.reps ? lastPerf.reps.toString() : '';
                        }
                    }

                    logs[ex.id] = Array(ex.sets).fill(null).map(() => ({
                        reps: prefilledReps || ex.reps.split('-')[0],
                        weight: prefilledWeight,
                        completed: false
                    }));
                }

                setWorkout(generated);
                setExerciseLogs(logs);
                setCompletedExercises({});
            }
        };

        if (userState) {
            prepareWorkout();
        }
    }, [userState, fetchLastPerformance]);

    // Auto-advance when all sets of current exercise are completed
    useEffect(() => {
        if (!workoutStarted || !workout) return;
        const currentEx = workout.exercises[activeExerciseIndex];
        if (!currentEx) return;

        const logs = exerciseLogs[currentEx.id];
        if (!logs) return;

        const allSetsCompleted = logs.every(s => s.completed);
        const isExerciseCompleted = completedExercises[currentEx.id];

        if ((allSetsCompleted || isExerciseCompleted) && activeExerciseIndex < workout.exercises.length - 1) {
            const timer = setTimeout(() => {
                setActiveExerciseIndex(prev => prev + 1);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [exerciseLogs, completedExercises, activeExerciseIndex, workoutStarted, workout]);

    const handleInitialize = async () => {
        setLoading(true);
        try {
            const benchInput = parseFloat(initLifts.bench) || 0;
            const squatInput = parseFloat(initLifts.squat) || 0;
            const deadliftInput = parseFloat(initLifts.deadlift) || 0;
            const ohpInput = parseFloat(initLifts.ohp) || 0;
            const pullupsInput = parseInt(initLifts.pullups) || 0;

            const lifts = {
                bench: roundTo2_5(benchInput * 0.9),
                squat: roundTo5(squatInput * 0.9),
                deadlift: roundTo5(deadliftInput * 0.9),
                ohp: roundTo2_5(ohpInput * 0.9),
                pullupsLevel: pullupsInput,
                hip_thrust: 60
            };

            await initializeUserTrainingState(userId, lifts);
            setShowInitModal(false);
        } catch (error) {
            console.error(error);
            addToast("Error al inicializar el perfil", 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateLog = (exId: string, setIndex: number, field: 'reps' | 'weight', value: string) => {
        setExerciseLogs(prev => {
            const newLogs = [...(prev[exId] || [])];
            newLogs[setIndex] = { ...newLogs[setIndex], [field]: value };
            return { ...prev, [exId]: newLogs };
        });
    };

    const toggleSetComplete = (exId: string, setIndex: number) => {
        const wasCompleted = exerciseLogs[exId]?.[setIndex]?.completed;
        setExerciseLogs(prev => {
            const newLogs = [...(prev[exId] || [])];
            newLogs[setIndex] = { ...newLogs[setIndex], completed: !newLogs[setIndex].completed };
            return { ...prev, [exId]: newLogs };
        });
        if (!wasCompleted) {
            startRestTimer();
        }
    };

    const toggleExercise = (id: string) => {
        const isComplete = !completedExercises[id];
        setCompletedExercises(prev => ({ ...prev, [id]: isComplete }));

        setExerciseLogs(prev => {
            const newLogs = [...(prev[id] || [])];
            return {
                ...prev,
                [id]: newLogs.map(s => ({ ...s, completed: isComplete }))
            };
        });
        if (isComplete) {
            startRestTimer();
        }
    };

    const handleStartWorkout = () => {
        setWorkoutStarted(true);
        setWorkoutStartTime(new Date());
        setActiveExerciseIndex(0);
    };

    const isLastExercise = workout ? activeExerciseIndex >= workout.exercises.length - 1 : false;
    const isLastExerciseCompleted = (() => {
        if (!workout) return false;
        const lastEx = workout.exercises[workout.exercises.length - 1];
        if (!lastEx) return false;
        if (completedExercises[lastEx.id]) return true;
        const logs = exerciseLogs[lastEx.id];
        return logs ? logs.every(s => s.completed) : false;
    })();

    const handleSave = async () => {
        if (!workout || !userState) return;
        setSaving(true);

        try {
            const exercisesToLog = workout.exercises
                .filter(ex => ex.blockType !== 'warmup')
                .map(ex => ({
                    exerciseId: ex.id,
                    exerciseName: ex.name,
                    sets: exerciseLogs[ex.id]?.map(s => ({
                        reps: parseInt(s.reps) || 0,
                        weight: parseFloat(s.weight) || 0,
                        completed: s.completed
                    })) || []
                }));

            const performData = exercisesToLog.map(e => ({
                exerciseId: e.exerciseId,
                sets: e.sets
            }));

            const unlockResult = evaluateUnlock(performData, userState.liftState, workout);

            const endTime = new Date();

            await addWorkoutLog({
                userId,
                protocolDay: workout.dayNumber,
                protocolDayType: workout.dayType,
                cycleIndex: workout.cycleIndex,
                isDeload: workout.isDeload,
                unlockResult: unlockResult || null,
                date: new Date().toISOString().split('T')[0],
                routineId: `protocol_${workout.dayNumber}`,
                routineName: workout.dayType,
                exercises: exercisesToLog,
                finisherCompleted: false,
                startTime: workoutStartTime?.toISOString(),
                endTime: endTime.toISOString(),
            });

            const nextDay = userState.currentDay + 1;
            const updates: Partial<UserTrainingState> = {
                currentDay: nextDay,
                completedProtocolSessions: userState.completedProtocolSessions + 1
            };

            if (unlockResult) {
                updates.liftState = {
                    ...userState.liftState,
                    ...unlockResult
                };
            }

            if (nextDay > 180) {
                updates.protocolCompleted = true;
            }

            const benchmarkResults: UserTrainingState['benchmarkResults'] = { ...userState.benchmarkResults };
            const pushupLog = exercisesToLog.find(e => e.exerciseId === 'max_pushups');
            const pullupLog = exercisesToLog.find(e => e.exerciseId === 'max_pullups');

            if (pushupLog) {
                const max = Math.max(...pushupLog.sets.map(s => s.reps));
                if (max > 0) benchmarkResults.maxPushUps = max;
            }
            if (pullupLog) {
                const max = Math.max(...pullupLog.sets.map(s => s.reps));
                if (max > 0) benchmarkResults.maxPullUps = max;
            }

            if (Object.keys(benchmarkResults).length > 0) {
                updates.benchmarkResults = benchmarkResults;
            }

            await updateUserTrainingState(userId, updates);

            const successPhrases = unlockResult
                ? ["TITAN! Desbloqueaste +Carga", "GOAT! Subimos el nivel.", "INTENSIDAD PURA! Nuevo PR desbloqueado."]
                : ["Trabajo hecho. Mantenemos y atacamos.", "Solido. La consistencia es clave.", "Buen trabajo. A recuperar."];

            const phrase = successPhrases[Math.floor(Math.random() * successPhrases.length)];
            addToast(phrase, 'success');

            // Reset workout flow
            setWorkoutStarted(false);
            setWorkoutStartTime(null);
            setActiveExerciseIndex(0);
            setElapsedTime(0);
            window.scrollTo(0, 0);

        } catch (error) {
            console.error("Error saving:", error);
            addToast("Error al guardar la sesion", 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Cargando protocolo...</div>;

    // --- INITIALIZATION MODAL ---
    if (showInitModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6 overflow-y-auto">
                <div className="bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-700">
                    <div className="text-center mb-6">
                        <span className="material-symbols-rounded text-5xl text-blue-500 mb-2">fitness_center</span>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Seteo Inicial</h2>
                        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                            Ingresa el peso que <strong>HOY</strong> podes hacer para <strong className="text-white">5 repeticiones solidas</strong> con tecnica perfecta (sin llegar al fallo).
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {[
                            { id: 'bench', label: 'Bench Press' },
                            { id: 'squat', label: 'Squat' },
                            { id: 'deadlift', label: 'Deadlift' },
                            { id: 'ohp', label: 'Overhead Press' }
                        ].map((lift) => (
                            <div key={lift.id} className="bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center border border-slate-700/50 focus-within:border-blue-500/50 focus-within:bg-slate-800 transition-all">
                                <label className="text-white font-bold text-lg">{lift.label}</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={initLifts[lift.id as keyof typeof initLifts]}
                                        onChange={(e) => setInitLifts(prev => ({ ...prev, [lift.id]: e.target.value }))}
                                        className="w-24 bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white text-xl font-bold text-center focus:border-blue-500 outline-none shadow-inner"
                                        placeholder="0"
                                    />
                                    <span className="text-slate-500 font-bold text-sm w-4">KG</span>
                                </div>
                            </div>
                        ))}

                        <div className="bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center border border-slate-700/50 focus-within:border-blue-500/50 focus-within:bg-slate-800 transition-all">
                            <div>
                                <label className="text-white font-bold text-lg block">Pull-ups</label>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Maximas Estrictas</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={initLifts.pullups}
                                    onChange={(e) => setInitLifts(prev => ({ ...prev, pullups: e.target.value }))}
                                    className="w-24 bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white text-xl font-bold text-center focus:border-blue-500 outline-none shadow-inner"
                                    placeholder="0"
                                />
                                <span className="text-slate-500 font-bold text-sm w-4">RPS</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                            <span className="material-symbols-rounded text-blue-400">info</span>
                            <p className="text-xs text-blue-200">
                                Calcularemos tus cargas de trabajo al <strong>90%</strong> de lo que ingreses para asegurar progreso constante.
                            </p>
                        </div>

                        <button
                            onClick={handleInitialize}
                            disabled={!initLifts.bench || !initLifts.squat || !initLifts.deadlift || !initLifts.ohp}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                        >
                            CONFIRMAR Y CREAR PROTOCOLO
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (userState?.protocolCompleted) {
        return (
            <div className="p-8 text-center space-y-6">
                <ToastContainer toasts={toasts} onRemove={removeToast} />
                <div className="inline-block p-6 rounded-full bg-green-500/20 text-green-500 mb-4">
                    <span className="material-symbols-rounded text-6xl">emoji_events</span>
                </div>
                <h2 className="text-3xl font-black text-white">PROTOCOLO COMPLETADO!</h2>
                <p className="text-slate-400">Has completado los 180 dias. Eres una maquina.</p>
                <button
                    className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold"
                    onClick={() => setShowResetConfirm(true)}
                >
                    Reiniciar Ciclo (Mantener Cargas)
                </button>
                {showResetConfirm && (
                    <ConfirmDialog
                        title="Reiniciar Protocolo"
                        message="Reiniciar contadores? Tus cargas se mantendran."
                        confirmText="Reiniciar"
                        onConfirm={() => {
                            updateUserTrainingState(userId, { currentDay: 1, protocolCompleted: false });
                            setShowResetConfirm(false);
                        }}
                        onCancel={() => setShowResetConfirm(false)}
                    />
                )}
            </div>
        );
    }

    if (!workout) return null;

    // --- PRE-WORKOUT: Show preview + START button ---
    if (!workoutStarted) {
        return (
            <div className="space-y-6 pb-20 animate-fade-in relative z-10">
                <ToastContainer toasts={toasts} onRemove={removeToast} />

                {/* Header Info */}
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">
                            {t('dashboard.day')} {workout.dayNumber} / 180
                        </span>
                        <h2 className="text-2xl font-black text-white leading-none mt-1 mb-4">
                            {workout.dayType}
                        </h2>
                    </div>
                    <div className="text-right mb-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.cycle')} {workout.cycleIndex}</p>
                        {workout.isDeload && <span className="text-[10px] font-bold text-amber-500 bg-amber-900/20 px-2 py-1 rounded mt-1 inline-block">{t('dashboard.deload')}</span>}
                    </div>
                </div>

                {/* Exercise Preview */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('routine.workoutPreview')}</h3>
                    <div className="space-y-2">
                        {workout.exercises.map((ex, idx) => {
                            const isMain = ex.id === workout.mainLift;
                            return (
                                <div key={ex.id} className={`flex items-center gap-3 p-3 rounded-xl ${isMain ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-slate-800/40'}`}>
                                    <span className="text-xs font-black text-slate-600 w-6">{idx + 1}</span>
                                    <div className="flex-1">
                                        <span className={`text-sm font-bold ${isMain ? 'text-blue-400' : 'text-white'}`}>{ex.name}</span>
                                        {ex.blockType === 'strength' && (
                                            <span className="text-[10px] text-slate-500 ml-2">{ex.sets}x{ex.reps}</span>
                                        )}
                                    </div>
                                    {isMain && <span className="text-[9px] font-black text-blue-400 bg-blue-600/20 px-2 py-0.5 rounded uppercase">Main</span>}
                                    {ex.blockType === 'warmup' && <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded uppercase">Warmup</span>}
                                    {ex.blockType === 'conditioning' && <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">Metcon</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* START BUTTON */}
                <button
                    onClick={handleStartWorkout}
                    className="w-full py-6 rounded-3xl font-black text-xl tracking-tight shadow-2xl transition-all flex items-center justify-center gap-3 mt-6 transform active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20"
                >
                    <span className="material-symbols-rounded font-black text-2xl">play_arrow</span>
                    {t('routine.startWorkout')}
                </button>

                <YouTubeVideoModal
                    exerciseId={videoExercise?.id || ''}
                    exerciseName={videoExercise?.name || ''}
                    isOpen={videoExercise !== null}
                    onClose={() => setVideoExercise(null)}
                />
            </div>
        );
    }

    // --- ACTIVE WORKOUT: Sequential exercise flow ---
    const currentExercise = workout.exercises[activeExerciseIndex];
    const totalExercises = workout.exercises.length;
    const progressPercent = ((activeExerciseIndex + 1) / totalExercises) * 100;
    const isCurrentMain = currentExercise?.id === workout.mainLift;

    return (
        <div className="space-y-6 pb-20 animate-fade-in relative z-10">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* REST TIMER OVERLAY */}
            {timerActive && (
                <div className="fixed bottom-12 left-0 right-0 z-50 p-4 animate-fade-in">
                    <div className="max-w-lg mx-auto bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-blue-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                    <span className="material-symbols-rounded text-blue-400 text-xl">timer</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descanso</p>
                                    <p className="text-2xl font-black text-white tabular-nums">{formatTime(restTimer)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
                                        style={{ width: `${(restTimer / restDuration) * 100}%` }}
                                    />
                                </div>
                                <button
                                    onClick={cancelRestTimer}
                                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
                                >
                                    <span className="material-symbols-rounded text-lg">close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with timer and progress */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-green-600/20 text-green-400 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                            {t('routine.inProgress')}
                        </span>
                        <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">
                            {t('dashboard.day')} {workout.dayNumber}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-slate-500 text-sm">timer</span>
                        <span className="text-lg font-black text-white tabular-nums">{formatElapsed(elapsedTime)}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {t('routine.exerciseOf').replace('{current}', String(activeExerciseIndex + 1)).replace('{total}', String(totalExercises))}
                        </span>
                        <span className="text-[10px] font-black text-slate-500">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white leading-none">
                    {workout.dayType}
                </h2>
            </div>

            {/* CURRENT EXERCISE */}
            {currentExercise && (
                <div className="space-y-4">
                    {/* Warmup renderer */}
                    {currentExercise.blockType === 'warmup' && (
                        <div className="bg-slate-800/30 rounded-2xl p-6 border border-orange-500/20">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-rounded text-orange-400">local_fire_department</span>
                                    <div>
                                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Warmup</span>
                                        <h4 className="text-lg font-bold text-white">{currentExercise.name}</h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasVideo(currentExercise.id) && (
                                        <button
                                            onClick={() => setVideoExercise({ id: currentExercise.id, name: currentExercise.name })}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                        >
                                            <span className="material-symbols-rounded text-lg">smart_display</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">{currentExercise.reps}</p>
                            <button
                                onClick={() => toggleExercise(currentExercise.id)}
                                className={`w-full py-4 rounded-2xl font-black text-base transition-all ${completedExercises[currentExercise.id] ? 'bg-green-500 text-white' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'}`}
                            >
                                {completedExercises[currentExercise.id] ? 'COMPLETADO' : 'COMPLETAR WARMUP'}
                            </button>
                        </div>
                    )}

                    {/* Conditioning renderer */}
                    {currentExercise.blockType === 'conditioning' && (
                        <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 rounded-3xl p-6 border border-indigo-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <span className="material-symbols-rounded text-7xl">timer</span>
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex gap-2 items-center mb-1">
                                        <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded uppercase">{currentExercise.conditioningMetadata?.format || 'METCON'}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentExercise.conditioningMetadata?.duration}</span>
                                    </div>
                                    <h4 className="font-extrabold text-xl text-white">{currentExercise.name}</h4>
                                </div>
                                {hasVideo(currentExercise.id) && (
                                    <button
                                        onClick={() => setVideoExercise({ id: currentExercise.id, name: currentExercise.name })}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    >
                                        <span className="material-symbols-rounded text-lg">smart_display</span>
                                    </button>
                                )}
                            </div>
                            <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 mb-4">
                                <p className="text-xs text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                                    {currentExercise.conditioningMetadata?.instructions}
                                </p>
                            </div>
                            <button
                                onClick={() => toggleExercise(currentExercise.id)}
                                className={`w-full py-4 rounded-2xl font-black text-base transition-all ${completedExercises[currentExercise.id] ? 'bg-green-500 text-white' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'}`}
                            >
                                {completedExercises[currentExercise.id] ? 'COMPLETADO' : 'COMPLETAR'}
                            </button>
                        </div>
                    )}

                    {/* Strength renderer */}
                    {currentExercise.blockType === 'strength' && (
                        <div className={`bg-slate-900 rounded-[2rem] p-6 border ${isCurrentMain ? 'border-blue-500/40 shadow-xl shadow-blue-900/10' : 'border-slate-800'} relative overflow-hidden transition-all`}>
                            {isCurrentMain && <div className="absolute top-0 right-0 bg-blue-600 text-[9px] font-black text-white px-3 py-1 rounded-bl-xl uppercase tracking-widest">Main Block</div>}

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4 items-center">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isCurrentMain ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                        <span className="material-symbols-rounded font-black text-2xl">fitness_center</span>
                                    </div>
                                    <div>
                                        <h4 className={`font-black text-xl tracking-tight ${isCurrentMain ? 'text-blue-400' : 'text-white'}`}>{currentExercise.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded uppercase">{currentExercise.sets}x{currentExercise.reps}</span>
                                            {currentExercise.exerciseType === 'bodyweight_weighted' && <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase">+ Lastre</span>}
                                        </div>
                                    </div>
                                </div>
                                {hasVideo(currentExercise.id) && (
                                    <button
                                        onClick={() => setVideoExercise({ id: currentExercise.id, name: currentExercise.name })}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    >
                                        <span className="material-symbols-rounded text-lg">smart_display</span>
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {Array.from({ length: currentExercise.sets }).map((_, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${exerciseLogs[currentExercise.id]?.[i]?.completed ? 'bg-green-500/5 opacity-60' : 'bg-slate-800/40'}`}>
                                        <button
                                            onClick={() => toggleSetComplete(currentExercise.id, i)}
                                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${exerciseLogs[currentExercise.id]?.[i]?.completed ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-500/20' : 'border-slate-700 text-transparent hover:border-slate-500'}`}
                                        >
                                            <span className="material-symbols-rounded text-[14px] font-black">check</span>
                                        </button>

                                        <span className="text-[10px] font-black text-slate-600 w-5">S{i + 1}</span>

                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            {currentExercise.exerciseType !== 'bodyweight' ? (
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        placeholder={currentExercise.weight ? String(currentExercise.weight) : "0"}
                                                        value={exerciseLogs[currentExercise.id]?.[i]?.weight || ''}
                                                        onChange={(e) => updateLog(currentExercise.id, i, 'weight', e.target.value)}
                                                        className="w-full bg-slate-900/50 border-none rounded-xl px-4 py-2.5 text-sm font-black text-center text-white placeholder:text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-black">KG</span>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-900/30 rounded-xl px-4 py-2.5 flex items-center justify-center">
                                                    <span className="text-[10px] font-black text-slate-700 uppercase">{t('routine.bodyweight')}</span>
                                                </div>
                                            )}

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder={String(currentExercise.reps)}
                                                    value={exerciseLogs[currentExercise.id]?.[i]?.reps || ''}
                                                    onChange={(e) => updateLog(currentExercise.id, i, 'reps', e.target.value)}
                                                    className="w-full bg-slate-900/50 border-none rounded-xl px-4 py-2.5 text-sm font-black text-center text-white placeholder:text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-black tracking-widest">RPS</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* COMPLETE SESSION BUTTON (only when last exercise is done) */}
            {isLastExercise && isLastExerciseCompleted && (
                <div className="space-y-3 animate-fade-in">
                    <div className="text-center">
                        <p className="text-sm text-slate-400">
                            {t('routine.duration')}: <span className="font-bold text-white">{formatElapsed(elapsedTime)}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full py-6 rounded-3xl font-black text-xl tracking-tight shadow-2xl transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] ${saving ? 'bg-slate-800 text-slate-600 cursor-wait' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-500/20'}`}
                    >
                        {saving ? (
                            <span className="animate-spin material-symbols-rounded">progress_activity</span>
                        ) : (
                            <span className="material-symbols-rounded font-black text-2xl">task_alt</span>
                        )}
                        {saving ? t('routine.savingSession') : t('routine.completeSession')}
                    </button>
                </div>
            )}

            <YouTubeVideoModal
                exerciseId={videoExercise?.id || ''}
                exerciseName={videoExercise?.name || ''}
                isOpen={videoExercise !== null}
                onClose={() => setVideoExercise(null)}
            />
        </div>
    );
}
