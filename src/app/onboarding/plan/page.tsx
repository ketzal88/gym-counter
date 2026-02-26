'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/db';
import { selectPlanVariant, getVariantDisplayName } from '@/services/planVariantService';

type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type WeeklyAvailability = 3 | 4 | 5 | 6;

interface OnboardingData {
    // Paso 1: Perfil
    weight: number;
    sex: 'M' | 'F';
    age: number;
    height: number;
    // Paso 2: Goals
    fitnessGoal: FitnessGoal;
    experienceLevel: ExperienceLevel;
    weeklyAvailability: WeeklyAvailability;
    injuries: string;
}

const GOAL_IMAGES = {
    weight_loss: '🔥',
    muscle_gain: '💪',
    max_strength: '🏋️',
    conditioning: '⚡',
};

const GOAL_GRADIENTS = {
    weight_loss: 'from-orange-500 to-red-500',
    muscle_gain: 'from-blue-500 to-indigo-500',
    max_strength: 'from-purple-500 to-pink-500',
    conditioning: 'from-green-500 to-teal-500',
};

const GOAL_DESCRIPTIONS = {
    weight_loss: 'Plan enfocado en déficit calórico con énfasis en cardio y ejercicios compuestos para maximizar gasto calórico',
    muscle_gain: 'Protocolo de hipertrofia con volumen optimizado y progresión estructurada para ganancia muscular',
    max_strength: 'Programa de fuerza con levantamientos pesados y periodización para maximizar tus PRs',
    conditioning: 'Plan de acondicionamiento funcional con metcons, WODs y ejercicios de alta intensidad',
};

const EXPERIENCE_FEATURES = {
    beginner: [
        'Ejercicios básicos y seguros',
        'Volumen moderado para adaptación',
        'Énfasis en técnica correcta',
        'Progresión gradual'
    ],
    intermediate: [
        'Mayor variedad de ejercicios',
        'Volumen y frecuencia óptimos',
        'Técnicas de intensificación',
        'Periodización estructurada'
    ],
    advanced: [
        'Ejercicios complejos y variaciones',
        'Alto volumen de entrenamiento',
        'Técnicas avanzadas',
        'Especialización y picos'
    ]
};

export default function OnboardingPlanPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
    const [planVariantId, setPlanVariantId] = useState<string>('');

    useEffect(() => {
        // Cargar datos del onboarding desde localStorage
        const profileData = localStorage.getItem('onboarding_profile');
        const goalsData = localStorage.getItem('onboarding_goals');

        if (!profileData || !goalsData) {
            // Si faltan datos, volver al inicio
            router.push('/onboarding/profile');
            return;
        }

        const profile = JSON.parse(profileData);
        const goals = JSON.parse(goalsData);

        const completeData: OnboardingData = {
            ...profile,
            ...goals
        };

        setOnboardingData(completeData);

        // Calcular el plan variant ID
        const variantId = selectPlanVariant({
            fitnessGoal: goals.fitnessGoal,
            experienceLevel: goals.experienceLevel,
            weeklyAvailability: goals.weeklyAvailability
        });

        setPlanVariantId(variantId);
    }, [router]);

    const handleComplete = async () => {
        if (!user || !onboardingData) return;

        setLoading(true);

        try {
            const now = new Date();
            const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

            // Guardar perfil completo en Firestore
            await setDoc(doc(db, 'users', user.uid), {
                // Datos existentes
                uid: user.uid,
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
                lastLogin: serverTimestamp(),

                // Onboarding
                onboardingCompleted: true,
                onboardingCompletedAt: serverTimestamp(),

                // Perfil físico
                weight: onboardingData.weight,
                sex: onboardingData.sex,
                age: onboardingData.age,
                height: onboardingData.height,

                // Perfil fitness
                fitnessGoal: onboardingData.fitnessGoal,
                experienceLevel: onboardingData.experienceLevel,
                weeklyAvailability: onboardingData.weeklyAvailability,
                injuries: onboardingData.injuries || '',

                // Plan asignado
                assignedPlan: planVariantId,
                planAssignedAt: serverTimestamp(),

                // Suscripción (iniciar trial)
                subscriptionStatus: 'trial',
                trialStartDate: now,
                trialEndDate: trialEndDate,
            }, { merge: true });

            // Inicializar training state
            await setDoc(doc(db, 'userTrainingState', user.uid), {
                currentDay: 1,
                completedProtocolSessions: 0,
                liftState: {
                    bench: 60,
                    squat: 80,
                    deadlift: 100,
                    ohp: 40,
                    pullupsLevel: 0
                },
                planVersion: planVariantId,
                assignedVariant: planVariantId,
                protocolCompleted: false,
                planStartedAt: serverTimestamp(),
                estimatedCompletionDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // 180 días
            });

            // Limpiar localStorage
            localStorage.removeItem('onboarding_profile');
            localStorage.removeItem('onboarding_goals');

            // Redirigir al dashboard
            router.push('/dashboard');
        } catch (error) {
            console.error('Error completing onboarding:', error);
            alert('Hubo un error al completar el onboarding. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/onboarding/goals');
    };

    if (!onboardingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
                </div>
            </div>
        );
    }

    const estimatedWeeks = Math.ceil(180 / onboardingData.weeklyAvailability);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header del paso */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    ¡Tu plan está listo!
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Hemos personalizado un protocolo de 180 días para ti
                </p>
            </div>

            {/* Hero Card del Plan */}
            <div className={`relative rounded-3xl p-6 bg-gradient-to-br ${GOAL_GRADIENTS[onboardingData.fitnessGoal]} text-white shadow-2xl overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}></div>
                </div>

                <div className="relative space-y-4">
                    <div className="text-6xl">{GOAL_IMAGES[onboardingData.fitnessGoal]}</div>
                    <h2 className="text-2xl font-black">
                        {getVariantDisplayName(planVariantId)}
                    </h2>
                    <p className="text-white/90 text-sm leading-relaxed">
                        {GOAL_DESCRIPTIONS[onboardingData.fitnessGoal]}
                    </p>

                    {/* Stats del Plan */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-2xl font-black">{onboardingData.weeklyAvailability}</div>
                            <div className="text-xs opacity-90">días/semana</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-2xl font-black">180</div>
                            <div className="text-xs opacity-90">días totales</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-2xl font-black">~{estimatedWeeks}</div>
                            <div className="text-xs opacity-90">semanas</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Características del Plan */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Lo que incluye tu plan
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {EXPERIENCE_FEATURES[onboardingData.experienceLevel].map((feature, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                ✓
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview de Primera Semana */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Tu primera semana
                </h3>
                <div className="grid grid-cols-1 gap-2">
                    {Array.from({ length: onboardingData.weeklyAvailability }).map((_, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm text-slate-900 dark:text-white">
                                    Día {idx + 1} - {idx % 3 === 0 ? 'Fuerza Principal' : idx % 3 === 1 ? 'Accesorios' : 'Conditioning'}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    4-6 ejercicios • 45-60 minutos
                                </div>
                            </div>
                            <div className="text-slate-400">
                                →
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trial Badge */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-900 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="text-4xl">🎉</div>
                    <div className="flex-1 space-y-2">
                        <div className="font-black text-lg text-amber-900 dark:text-amber-100">
                            ¡7 Días Gratis para Comenzar!
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                            Prueba tu plan completo sin compromiso. Si decides continuar después de 7 días, solo <span className="font-bold">$4.99/mes</span> o <span className="font-bold">$49.90/año</span> (ahorra 2 meses).
                        </p>
                        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Sin tarjeta requerida</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de navegación */}
            <div className="flex gap-3 pb-8">
                <button
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 h-14 rounded-2xl font-bold text-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    ← Atrás
                </button>
                <button
                    onClick={handleComplete}
                    disabled={loading}
                    className={`
                        flex-2 flex-grow-[2] h-14 rounded-2xl font-bold text-lg transition-all duration-300
                        ${loading
                            ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95'
                        }
                    `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Configurando...
                        </span>
                    ) : (
                        '¡Comenzar mi Entrenamiento! 💪'
                    )}
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
            `}</style>
        </div>
    );
}
