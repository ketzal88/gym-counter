'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserTrainingState, subscribeToUserTrainingState, updateUserTrainingState } from '@/services/db';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useToast } from '@/hooks/useToast';
import ToastContainer from './ui/ToastContainer';

export default function ProtocolSettings() {
    const { user } = useAuth();
    const [userState, setUserState] = useState<UserTrainingState | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { restDuration, updateRestDuration } = useRestTimer();
    const { toasts, addToast, removeToast } = useToast();

    // Edit Form State
    const [editLifts, setEditLifts] = useState({
        bench: '',
        squat: '',
        deadlift: '',
        ohp: '',
        pullupsLevel: ''
    });

    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToUserTrainingState(user.uid, (state) => {
            setUserState(state);
            if (state && state.liftState) {
                setEditLifts({
                    bench: String(state.liftState.bench),
                    squat: String(state.liftState.squat),
                    deadlift: String(state.liftState.deadlift),
                    ohp: String(state.liftState.ohp),
                    pullupsLevel: String(state.liftState.pullupsLevel)
                });
            }
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    const handleSave = async () => {
        if (!user || !userState) return;
        setSaving(true);
        try {
            await updateUserTrainingState(user.uid, {
                liftState: {
                    bench: parseFloat(editLifts.bench) || 0,
                    squat: parseFloat(editLifts.squat) || 0,
                    deadlift: parseFloat(editLifts.deadlift) || 0,
                    ohp: parseFloat(editLifts.ohp) || 0,
                    pullupsLevel: parseInt(editLifts.pullupsLevel) || 0
                }
            });
            addToast('Pesos actualizados correctamente', 'success');
        } catch (error) {
            console.error("Error updating settings", error);
            addToast('Error al actualizar', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-400 text-xs">Cargando datos...</div>;
    if (!userState) return null;

    const timerOptions = [
        { label: '30s', value: 30 },
        { label: '1:00', value: 60 },
        { label: '1:30', value: 90 },
        { label: '2:00', value: 120 },
        { label: '2:30', value: 150 },
        { label: '3:00', value: 180 },
    ];

    return (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-rounded text-blue-500 bg-blue-900/20 p-2 rounded-xl">settings_accessibility</span>
                <div>
                    <h3 className="text-lg font-black text-white leading-none">Ajustes de Protocolo</h3>
                    <p className="text-xs text-slate-500 mt-1">Editar Pesos Base (Working Weights)</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                    { id: 'bench', label: 'Bench Press', step: 2.5 },
                    { id: 'squat', label: 'Squat', step: 5 },
                    { id: 'deadlift', label: 'Deadlift', step: 5 },
                    { id: 'ohp', label: 'Overhead Press', step: 2.5 }
                ].map((lift) => (
                    <div key={lift.id} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{lift.label}</label>
                        <div className="relative">
                            <input
                                type="number"
                                step={lift.step}
                                value={editLifts[lift.id as keyof typeof editLifts]}
                                onChange={(e) => setEditLifts(prev => ({ ...prev, [lift.id]: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-3 pr-8 text-white font-bold text-sm focus:border-blue-500 outline-none transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">KG</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Pull-ups Level</label>
                <div className="relative">
                    <input
                        type="number"
                        value={editLifts.pullupsLevel}
                        onChange={(e) => setEditLifts(prev => ({ ...prev, pullupsLevel: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-3 pr-8 text-white font-bold text-sm focus:border-blue-500 outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">Reps</span>
                </div>
            </div>

            {/* Rest Timer Configuration */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-rounded text-indigo-400 bg-indigo-900/20 p-1.5 rounded-lg text-sm">timer</span>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descanso entre series</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {timerOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => updateRestDuration(opt.value)}
                            className={`py-2.5 rounded-xl font-bold text-sm transition-all border ${restDuration === opt.value
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/20 p-3 rounded-xl flex gap-2 mb-6">
                <span className="material-symbols-rounded text-amber-500 text-sm">warning</span>
                <p className="text-[10px] text-amber-200/80 leading-relaxed">
                    Cambiar estos valores afectará todos los entrenamientos futuros. No modifica tu historial ni sesiones pasadas.
                </p>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all text-sm border border-slate-700 shadow-lg shadow-black/20"
            >
                {saving ? 'Guardando...' : 'Guardar Ajustes'}
            </button>
        </div>
    );
}
