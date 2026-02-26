'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingProfilePage() {
    const router = useRouter();

    // Estados del formulario
    const [weight, setWeight] = useState(70);
    const [sex, setSex] = useState<'M' | 'F' | null>(null);
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(170);

    const handleContinue = () => {
        // Validación básica
        if (!sex) {
            alert('Por favor selecciona tu sexo');
            return;
        }

        // Guardar en localStorage temporalmente (luego se guardará en Firestore)
        localStorage.setItem('onboarding_profile', JSON.stringify({
            weight,
            sex,
            age,
            height
        }));

        // Navegar al siguiente paso
        router.push('/onboarding/goals');
    };

    // Calcular IMC para feedback visual
    const calculateBMI = () => {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const bmi = calculateBMI();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header del paso */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    Cuéntanos sobre ti
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Necesitamos algunos datos básicos para personalizar tu plan de entrenamiento
                </p>
            </div>

            {/* Avatar Preview (Responsive a los inputs) */}
            <div className="flex justify-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/30">
                        {sex === 'M' ? '🧔' : sex === 'F' ? '👩' : '👤'}
                    </div>
                    {sex && (
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full px-3 py-1 shadow-lg border-2 border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                IMC {bmi}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
                {/* Selector de Sexo */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        Sexo
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setSex('M')}
                            className={`
                                h-20 rounded-2xl font-bold text-lg transition-all duration-300
                                ${sex === 'M'
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-105'
                                }
                            `}
                        >
                            <div className="space-y-1">
                                <div className="text-2xl">🧔</div>
                                <div className="text-sm">Masculino</div>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSex('F')}
                            className={`
                                h-20 rounded-2xl font-bold text-lg transition-all duration-300
                                ${sex === 'F'
                                    ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-105'
                                }
                            `}
                        >
                            <div className="space-y-1">
                                <div className="text-2xl">👩</div>
                                <div className="text-sm">Femenino</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Peso con Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Peso
                        </label>
                        <div className="text-right">
                            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                {weight}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">kg</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="40"
                        max="150"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>40 kg</span>
                        <span>150 kg</span>
                    </div>
                </div>

                {/* Altura con Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Altura
                        </label>
                        <div className="text-right">
                            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                {height}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">cm</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="140"
                        max="220"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>140 cm</span>
                        <span>220 cm</span>
                    </div>
                </div>

                {/* Edad con Selector Numérico */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        Edad
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setAge(Math.max(15, age - 1))}
                            className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xl transition-all active:scale-95"
                        >
                            −
                        </button>
                        <div className="flex-1 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                                {age}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">años</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAge(Math.min(80, age + 1))}
                            className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xl transition-all active:scale-95"
                        >
                            +
                        </button>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>15 años (mínimo)</span>
                        <span>80 años (máximo)</span>
                    </div>
                </div>
            </div>

            {/* Botón de Continuar */}
            <button
                onClick={handleContinue}
                disabled={!sex}
                className={`
                    w-full h-14 rounded-2xl font-bold text-lg transition-all duration-300
                    ${sex
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }
                `}
            >
                Continuar →
            </button>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}
