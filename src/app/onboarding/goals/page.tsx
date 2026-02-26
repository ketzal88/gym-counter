'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type WeeklyAvailability = 3 | 4 | 5 | 6;

const FITNESS_GOALS = [
    {
        id: 'weight_loss' as FitnessGoal,
        emoji: '🔥',
        title: 'Perder Peso',
        description: 'Déficit calórico + cardio estructurado',
        gradient: 'from-orange-500 to-red-500',
        hoverGradient: 'from-orange-600 to-red-600',
    },
    {
        id: 'muscle_gain' as FitnessGoal,
        emoji: '💪',
        title: 'Ganar Músculo',
        description: 'Superávit calórico + hipertrofia',
        gradient: 'from-blue-500 to-indigo-500',
        hoverGradient: 'from-blue-600 to-indigo-600',
    },
    {
        id: 'max_strength' as FitnessGoal,
        emoji: '🏋️',
        title: 'Fuerza Máxima',
        description: 'Powerlifting y levantamientos pesados',
        gradient: 'from-purple-500 to-pink-500',
        hoverGradient: 'from-purple-600 to-pink-600',
    },
    {
        id: 'conditioning' as FitnessGoal,
        emoji: '⚡',
        title: 'Resistencia/CrossFit',
        description: 'Metcons + conditioning funcional',
        gradient: 'from-green-500 to-teal-500',
        hoverGradient: 'from-green-600 to-teal-600',
    },
];

const EXPERIENCE_LEVELS = [
    {
        id: 'beginner' as ExperienceLevel,
        emoji: '🌱',
        title: 'Principiante',
        description: 'Nuevo en el gym o menos de 6 meses',
    },
    {
        id: 'intermediate' as ExperienceLevel,
        emoji: '🌿',
        title: 'Intermedio',
        description: '6 meses a 2 años de experiencia',
    },
    {
        id: 'advanced' as ExperienceLevel,
        emoji: '🌳',
        title: 'Avanzado',
        description: 'Más de 2 años entrenando consistentemente',
    },
];

const COMMON_INJURIES = [
    'Ninguna',
    'Rodilla',
    'Espalda baja',
    'Hombro',
    'Muñeca',
    'Tobillo',
    'Codo',
];

export default function OnboardingGoalsPage() {
    const router = useRouter();

    // Estados del formulario
    const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null);
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
    const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>(4);
    const [injuries, setInjuries] = useState('');

    // Cargar datos previos si existen
    useEffect(() => {
        const saved = localStorage.getItem('onboarding_goals');
        if (saved) {
            const data = JSON.parse(saved);
            setFitnessGoal(data.fitnessGoal || null);
            setExperienceLevel(data.experienceLevel || null);
            setWeeklyAvailability(data.weeklyAvailability || 4);
            setInjuries(data.injuries || '');
        }
    }, []);

    const handleContinue = () => {
        // Validación básica
        if (!fitnessGoal) {
            alert('Por favor selecciona tu objetivo');
            return;
        }
        if (!experienceLevel) {
            alert('Por favor selecciona tu nivel de experiencia');
            return;
        }

        // Guardar en localStorage
        localStorage.setItem('onboarding_goals', JSON.stringify({
            fitnessGoal,
            experienceLevel,
            weeklyAvailability,
            injuries
        }));

        // Navegar al siguiente paso
        router.push('/onboarding/plan');
    };

    const handleBack = () => {
        router.push('/onboarding/profile');
    };

    const addInjury = (injury: string) => {
        if (injury === 'Ninguna') {
            setInjuries('');
        } else {
            const current = injuries ? injuries + ', ' : '';
            setInjuries(current + injury);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header del paso */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    Define tu objetivo
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Personalizaremos tu plan según tus metas y disponibilidad
                </p>
            </div>

            {/* Selector de Objetivo Fitness */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    ¿Cuál es tu objetivo principal?
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {FITNESS_GOALS.map((goal) => (
                        <button
                            key={goal.id}
                            type="button"
                            onClick={() => setFitnessGoal(goal.id)}
                            className={`
                                relative h-24 rounded-2xl transition-all duration-300
                                ${fitnessGoal === goal.id
                                    ? `bg-gradient-to-br ${goal.gradient} text-white shadow-2xl shadow-${goal.gradient.split('-')[1]}-500/40 scale-105`
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:scale-102'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4 px-4 h-full">
                                <div className="text-4xl">{goal.emoji}</div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-lg">{goal.title}</div>
                                    <div className={`text-sm ${fitnessGoal === goal.id ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {goal.description}
                                    </div>
                                </div>
                                {fitnessGoal === goal.id && (
                                    <div className="text-2xl">✓</div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selector de Nivel de Experiencia */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    ¿Cuál es tu nivel de experiencia?
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {EXPERIENCE_LEVELS.map((level) => (
                        <button
                            key={level.id}
                            type="button"
                            onClick={() => setExperienceLevel(level.id)}
                            className={`
                                h-20 rounded-2xl font-bold transition-all duration-300
                                ${experienceLevel === level.id
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:scale-102'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3 px-4">
                                <div className="text-3xl">{level.emoji}</div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-base">{level.title}</div>
                                    <div className={`text-xs ${experienceLevel === level.id ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {level.description}
                                    </div>
                                </div>
                                {experienceLevel === level.id && (
                                    <div className="text-xl">✓</div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selector de Disponibilidad Semanal */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Días disponibles por semana
                    </label>
                    <div className="text-right">
                        <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                            {weeklyAvailability}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">días</span>
                    </div>
                </div>

                {/* Visual Calendar Selector */}
                <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map((days) => (
                        <button
                            key={days}
                            type="button"
                            onClick={() => setWeeklyAvailability(days as WeeklyAvailability)}
                            className={`
                                h-16 rounded-xl font-bold text-xl transition-all duration-300
                                ${weeklyAvailability === days
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-105'
                                }
                            `}
                        >
                            <div className="space-y-1">
                                <div>{days}</div>
                                <div className="text-xs font-normal opacity-80">días</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    💡 Recomendamos 4-5 días para resultados óptimos
                </div>
            </div>

            {/* Lesiones (opcional) */}
            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    ¿Tienes alguna lesión o molestia? <span className="font-normal text-slate-500">(opcional)</span>
                </label>

                {/* Sugerencias rápidas */}
                <div className="flex flex-wrap gap-2">
                    {COMMON_INJURIES.map((injury) => (
                        <button
                            key={injury}
                            type="button"
                            onClick={() => addInjury(injury)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                        >
                            {injury}
                        </button>
                    ))}
                </div>

                <textarea
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    placeholder="Ejemplo: Dolor en rodilla derecha, molestia en hombro izquierdo..."
                    className="w-full h-24 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 transition-all resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Adaptaremos los ejercicios para cuidar estas áreas
                </p>
            </div>

            {/* Botones de navegación */}
            <div className="flex gap-3">
                <button
                    onClick={handleBack}
                    className="flex-1 h-14 rounded-2xl font-bold text-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                    ← Atrás
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!fitnessGoal || !experienceLevel}
                    className={`
                        flex-1 h-14 rounded-2xl font-bold text-lg transition-all duration-300
                        ${fitnessGoal && experienceLevel
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        }
                    `}
                >
                    Continuar →
                </button>
            </div>

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
                .hover\:scale-102:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
}
