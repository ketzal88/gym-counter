'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Target, Activity, Dumbbell, Zap, Calendar, AlertCircle } from 'lucide-react';

type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type WeeklyAvailability = 3 | 4 | 5 | 6;

export default function OnboardingGoalsPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const FITNESS_GOALS = [
        { id: 'weight_loss' as FitnessGoal, icon: Activity, title: t('onboarding.goalWeightLoss'), description: t('onboarding.goalWeightLossDesc'), color: 'text-orange-600 dark:text-orange-500', bgSelected: 'bg-orange-600', borderSelected: 'border-orange-600' },
        { id: 'muscle_gain' as FitnessGoal, icon: Dumbbell, title: t('onboarding.goalMuscleGain'), description: t('onboarding.goalMuscleGainDesc'), color: 'text-blue-600 dark:text-blue-500', bgSelected: 'bg-blue-600', borderSelected: 'border-blue-600' },
        { id: 'max_strength' as FitnessGoal, icon: Target, title: t('onboarding.goalMaxStrength'), description: t('onboarding.goalMaxStrengthDesc'), color: 'text-purple-600 dark:text-purple-500', bgSelected: 'bg-purple-600', borderSelected: 'border-purple-600' },
        { id: 'conditioning' as FitnessGoal, icon: Zap, title: t('onboarding.goalConditioning'), description: t('onboarding.goalConditioningDesc'), color: 'text-green-600 dark:text-green-500', bgSelected: 'bg-green-600', borderSelected: 'border-green-600' },
    ];

    const EXPERIENCE_LEVELS = [
        { id: 'beginner' as ExperienceLevel, emoji: '🌱', title: t('onboarding.beginner'), description: t('onboarding.beginnerDesc') },
        { id: 'intermediate' as ExperienceLevel, emoji: '🌿', title: t('onboarding.intermediate'), description: t('onboarding.intermediateDesc') },
        { id: 'advanced' as ExperienceLevel, emoji: '🌳', title: t('onboarding.advanced'), description: t('onboarding.advancedDesc') },
    ];

    const COMMON_INJURIES = [
        t('onboarding.injuryNone'),
        t('onboarding.injuryKnee'),
        t('onboarding.injuryLowerBack'),
        t('onboarding.injuryShoulder'),
        t('onboarding.injuryWrist'),
        t('onboarding.injuryAnkle'),
        t('onboarding.injuryElbow'),
    ];

    const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null);
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
    const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>(4);
    const [injuries, setInjuries] = useState('');

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
        if (!fitnessGoal) {
            alert(t('onboarding.selectGoal'));
            return;
        }
        if (!experienceLevel) {
            alert(t('onboarding.selectExperience'));
            return;
        }

        localStorage.setItem('onboarding_goals', JSON.stringify({
            fitnessGoal,
            experienceLevel,
            weeklyAvailability,
            injuries
        }));

        router.push('/onboarding/plan');
    };

    const handleBack = () => {
        router.push('/onboarding/profile');
    };

    const addInjury = (injury: string) => {
        if (injury === t('onboarding.injuryNone')) {
            setInjuries('');
        } else {
            const current = injuries ? injuries + ', ' : '';
            setInjuries(current + injury);
        }
    };

    const selectedGoal = FITNESS_GOALS.find(g => g.id === fitnessGoal);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('onboarding.goalsTitle')}
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400">
                    {t('onboarding.goalsSubtitle')}
                </p>
            </div>

            {/* Selector de Objetivo Fitness */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('onboarding.mainGoalLabel')}
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {FITNESS_GOALS.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = fitnessGoal === goal.id;
                        return (
                            <button
                                key={goal.id}
                                type="button"
                                onClick={() => setFitnessGoal(goal.id)}
                                className={`
                                    h-20 rounded-lg transition-colors text-left
                                    ${isSelected
                                        ? `${goal.bgSelected} text-white border-2 ${goal.borderSelected}`
                                        : 'bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4 px-4 h-full">
                                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : goal.color}`} />
                                    <div className="flex-1">
                                        <div className="font-semibold text-base">{goal.title}</div>
                                        <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-500'}`}>
                                            {goal.description}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selector de Nivel de Experiencia */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('onboarding.experienceLabel')}
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {EXPERIENCE_LEVELS.map((level) => {
                        const isSelected = experienceLevel === level.id;
                        return (
                            <button
                                key={level.id}
                                type="button"
                                onClick={() => setExperienceLevel(level.id)}
                                className={`
                                    h-18 rounded-lg transition-colors text-left
                                    ${isSelected
                                        ? 'bg-blue-600 text-white border-2 border-blue-600'
                                        : 'bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <span className="text-2xl">{level.emoji}</span>
                                    <div className="flex-1">
                                        <div className="font-semibold text-base">{level.title}</div>
                                        <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-500'}`}>
                                            {level.description}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selector de Disponibilidad Semanal */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4" />
                        {t('onboarding.availabilityLabel')}
                    </label>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            {weeklyAvailability}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-500 ml-1">{t('common.days')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map((days) => (
                        <button
                            key={days}
                            type="button"
                            onClick={() => setWeeklyAvailability(days as WeeklyAvailability)}
                            className={`
                                h-16 rounded-lg font-semibold text-xl transition-colors
                                ${weeklyAvailability === days
                                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                                    : 'bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div>{days}</div>
                                <div className="text-xs font-normal opacity-80">{t('common.days')}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-500 text-center flex items-center justify-center gap-1">
                    <span>💡</span>
                    <span>{t('onboarding.availabilityTip')}</span>
                </div>
            </div>

            {/* Lesiones (opcional) */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <AlertCircle className="w-4 h-4" />
                    {t('onboarding.injuriesLabel')}
                    <span className="font-normal text-slate-500 dark:text-slate-500 text-xs">{t('onboarding.injuriesOptional')}</span>
                </label>

                {/* Sugerencias rápidas */}
                <div className="flex flex-wrap gap-2">
                    {COMMON_INJURIES.map((injury) => (
                        <button
                            key={injury}
                            type="button"
                            onClick={() => addInjury(injury)}
                            className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                            {injury}
                        </button>
                    ))}
                </div>

                <textarea
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    placeholder={t('onboarding.injuriesPlaceholder')}
                    className="w-full h-24 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-colors resize-none outline-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500">
                    {t('onboarding.injuriesTip')}
                </p>
            </div>

            {/* Botones de navegación */}
            <div className="flex gap-3">
                <button
                    onClick={handleBack}
                    className="flex-1 h-12 rounded-lg font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                >
                    {t('common.back')}
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!fitnessGoal || !experienceLevel}
                    className={`
                        flex-1 h-12 rounded-lg font-semibold transition-colors
                        ${fitnessGoal && experienceLevel
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        }
                    `}
                >
                    {t('common.continue')}
                </button>
            </div>
        </div>
    );
}
