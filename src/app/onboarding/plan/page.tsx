'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/db';
import { selectPlanVariant, getVariantDisplayName } from '@/services/planVariantService';
import { Check, Calendar, Clock, Layers } from 'lucide-react';

type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type WeeklyAvailability = 3 | 4 | 5 | 6;

interface OnboardingData {
    weight: number;
    sex: 'M' | 'F';
    age: number;
    height: number;
    fitnessGoal: FitnessGoal;
    experienceLevel: ExperienceLevel;
    weeklyAvailability: WeeklyAvailability;
    injuries: string;
}

export default function OnboardingPlanPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t, dict } = useLanguage();

    const GOAL_DESCRIPTIONS: Record<FitnessGoal, string> = {
        weight_loss: t('onboarding.descWeightLoss'),
        muscle_gain: t('onboarding.descMuscleGain'),
        max_strength: t('onboarding.descMaxStrength'),
        conditioning: t('onboarding.descConditioning'),
    };

    const EXPERIENCE_FEATURES: Record<ExperienceLevel, string[]> = {
        beginner: dict.onboarding.beginnerFeatures,
        intermediate: dict.onboarding.intermediateFeatures,
        advanced: dict.onboarding.advancedFeatures,
    };
    const [loading, setLoading] = useState(false);
    const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
    const [planVariantId, setPlanVariantId] = useState<string>('');

    useEffect(() => {
        const profileData = localStorage.getItem('onboarding_profile');
        const goalsData = localStorage.getItem('onboarding_goals');

        if (!profileData || !goalsData) {
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
            const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
                lastLogin: serverTimestamp(),
                onboardingCompleted: true,
                onboardingCompletedAt: serverTimestamp(),
                weight: onboardingData.weight,
                sex: onboardingData.sex,
                age: onboardingData.age,
                height: onboardingData.height,
                fitnessGoal: onboardingData.fitnessGoal,
                experienceLevel: onboardingData.experienceLevel,
                weeklyAvailability: onboardingData.weeklyAvailability,
                injuries: onboardingData.injuries || '',
                assignedPlan: planVariantId,
                planAssignedAt: serverTimestamp(),
                subscriptionStatus: 'trial',
                trialStartDate: now,
                trialEndDate: trialEndDate,
            }, { merge: true });

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
                estimatedCompletionDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
            });

            localStorage.removeItem('onboarding_profile');
            localStorage.removeItem('onboarding_goals');

            router.push('/dashboard');
        } catch (error) {
            console.error('Error completing onboarding:', error);
            alert(t('onboarding.errorOnboarding'));
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-500">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    const estimatedWeeks = Math.ceil(180 / onboardingData.weeklyAvailability);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('onboarding.planTitle')}
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400">
                    {t('onboarding.planSubtitle')}
                </p>
            </div>

            {/* Plan Card */}
            <div className="rounded-xl border-2 border-blue-600 overflow-hidden">
                <div className="bg-blue-600 text-white p-6 space-y-4">
                    <h2 className="text-xl font-bold">
                        {getVariantDisplayName(planVariantId)}
                    </h2>
                    <p className="text-blue-100 text-sm leading-relaxed">
                        {GOAL_DESCRIPTIONS[onboardingData.fitnessGoal]}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
                    <div className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Calendar className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{onboardingData.weeklyAvailability}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">{t('onboarding.daysPerWeek')}</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Layers className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">180</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">{t('onboarding.totalDays')}</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">~{estimatedWeeks}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">{t('common.weeks')}</div>
                    </div>
                </div>

                {/* Features */}
                <div className="p-6 space-y-3">
                    {EXPERIENCE_FEATURES[onboardingData.experienceLevel].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* First Week Preview */}
            <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {t('onboarding.firstWeek')}
                </h3>
                <div className="space-y-2">
                    {Array.from({ length: onboardingData.weeklyAvailability }).map((_, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                        >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm text-slate-900 dark:text-white">
                                    {t('onboarding.dayLabel')} {idx + 1} - {idx % 3 === 0 ? t('onboarding.mainStrength') : idx % 3 === 1 ? t('onboarding.accessories') : t('onboarding.conditioning')}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                    {t('onboarding.exercisesTime')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trial Badge */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-5 bg-slate-50 dark:bg-slate-900">
                <div className="space-y-2">
                    <div className="font-semibold text-slate-900 dark:text-white">
                        {t('onboarding.trialBadgeTitle')}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t('onboarding.trialBadgeDesc')} <span className="font-semibold">$4.99/mes</span> o <span className="font-semibold">$49.90/año</span>.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('onboarding.trialBadgeNoCard')}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pb-8">
                <button
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 h-12 rounded-lg font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors disabled:opacity-50"
                >
                    {t('common.back')}
                </button>
                <button
                    onClick={handleComplete}
                    disabled={loading}
                    className={`
                        flex-[2] h-12 rounded-lg font-semibold transition-colors
                        ${loading
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                    `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {t('onboarding.configuring')}
                        </span>
                    ) : (
                        t('onboarding.startTraining')
                    )}
                </button>
            </div>
        </div>
    );
}
