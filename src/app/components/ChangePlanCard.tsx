'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
    UserProfile,
    UserTrainingState,
    subscribeToUserProfile,
    subscribeToUserTrainingState,
    updateUserProfile,
    updateUserTrainingState,
} from '@/services/db';
import { selectPlanVariant, getVariantDisplayName } from '@/services/planVariantService';
import { useToast } from '@/hooks/useToast';
import ToastContainer from './ui/ToastContainer';
import ConfirmDialog from './ui/ConfirmDialog';

type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning' | 'toned_abs' | 'glute_building' | 'fat_burn' | 'greek_god';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type WeeklyAvailability = 3 | 4 | 5 | 6;

const TOTAL_DAYS = 180;

export default function ChangePlanCard() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { toasts, addToast, removeToast } = useToast();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [trainingState, setTrainingState] = useState<UserTrainingState | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Selected values for the new plan
    const [goal, setGoal] = useState<FitnessGoal>('greek_god');
    const [level, setLevel] = useState<ExperienceLevel>('advanced');
    const [days, setDays] = useState<WeeklyAvailability>(3);
    // Tracks whether we've already seeded the selectors from the profile
    const [seeded, setSeeded] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubProfile = subscribeToUserProfile(user.uid, (p) => {
            setProfile(p);
            setLoading(false);
        });
        const unsubState = subscribeToUserTrainingState(user.uid, setTrainingState);
        return () => {
            unsubProfile();
            unsubState();
        };
    }, [user]);

    // Seed selectors from the user's current profile once, when first available
    useEffect(() => {
        if (seeded || !profile) return;
        if (profile.fitnessGoal) setGoal(profile.fitnessGoal as FitnessGoal);
        if (profile.experienceLevel) setLevel(profile.experienceLevel);
        if (profile.weeklyAvailability) setDays(profile.weeklyAvailability);
        setSeeded(true);
    }, [profile, seeded]);

    const GOAL_OPTIONS: { id: FitnessGoal; label: string }[] = [
        { id: 'muscle_gain', label: t('onboarding.goalMuscleGain') },
        { id: 'max_strength', label: t('onboarding.goalMaxStrength') },
        { id: 'weight_loss', label: t('onboarding.goalWeightLoss') },
        { id: 'conditioning', label: t('onboarding.goalConditioning') },
        { id: 'greek_god', label: t('onboarding.goalGreekGod') },
        { id: 'toned_abs', label: t('onboarding.goalTonedAbs') },
        { id: 'glute_building', label: t('onboarding.goalGluteBuilding') },
        { id: 'fat_burn', label: t('onboarding.goalFatBurn') },
    ];

    const LEVEL_OPTIONS: { id: ExperienceLevel; label: string }[] = [
        { id: 'beginner', label: t('onboarding.beginner') },
        { id: 'intermediate', label: t('onboarding.intermediate') },
        { id: 'advanced', label: t('onboarding.advanced') },
    ];

    const newVariantId = selectPlanVariant({ fitnessGoal: goal, experienceLevel: level, weeklyAvailability: days });
    const currentVariantId = trainingState?.assignedVariant || profile?.assignedPlan || '';
    const isSamePlan = currentVariantId === newVariantId;

    const handleConfirmChange = async () => {
        if (!user) return;
        setShowConfirm(false);
        setSaving(true);
        try {
            const now = new Date();
            await updateUserProfile(user.uid, {
                fitnessGoal: goal,
                experienceLevel: level,
                weeklyAvailability: days,
                assignedPlan: newVariantId,
                planAssignedAt: now,
            });
            await updateUserTrainingState(user.uid, {
                planVersion: newVariantId,
                assignedVariant: newVariantId,
                currentDay: 1,
                // currentDay and completedProtocolSessions advance in lockstep (see RoutineTracker),
                // so reset both to keep the Day-1 restart consistent. liftState/benchmarkResults are
                // intentionally preserved — your working weights carry over to the new plan.
                completedProtocolSessions: 0,
                protocolCompleted: false,
                planStartedAt: now,
                estimatedCompletionDate: new Date(now.getTime() + TOTAL_DAYS * 24 * 60 * 60 * 1000),
            });
            addToast(t('changePlan.success'), 'success');
        } catch (error) {
            console.error('Error changing plan:', error);
            addToast(t('changePlan.error'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const selectClasses =
        'w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors';

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-rounded text-lg text-blue-600">swap_horiz</span>
                    {t('changePlan.title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{t('changePlan.subtitle')}</p>
            </div>

            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="py-6 text-center text-xs text-slate-400">{t('common.loading')}</div>
                ) : (
                    <>
                        {/* Current plan */}
                        {currentVariantId && (
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                    {t('changePlan.current')}
                                </p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {getVariantDisplayName(currentVariantId)}
                                </p>
                            </div>
                        )}

                        {/* Goal selector */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('changePlan.goalLabel')}
                            </label>
                            <select
                                value={goal}
                                onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                                className={selectClasses}
                            >
                                {GOAL_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Level selector */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('changePlan.experienceLabel')}
                            </label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
                                className={selectClasses}
                            >
                                {LEVEL_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Days selector */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('changePlan.daysLabel')}
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[3, 4, 5, 6].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDays(d as WeeklyAvailability)}
                                        className={`py-2.5 rounded-lg font-bold text-sm transition-colors border ${
                                            days === d
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* New plan preview */}
                        <div className="rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 p-3">
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
                                {t('changePlan.newPlanLabel')}
                            </p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {getVariantDisplayName(newVariantId)}
                            </p>
                        </div>

                        {/* Change button */}
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={saving || isSamePlan}
                            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                                saving || isSamePlan
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {saving ? t('changePlan.saving') : isSamePlan ? t('changePlan.sameWarning') : t('changePlan.changeButton')}
                        </button>
                    </>
                )}
            </div>

            {showConfirm && (
                <ConfirmDialog
                    title={t('changePlan.confirmTitle')}
                    message={`${getVariantDisplayName(newVariantId)}\n\n${t('changePlan.confirmMessage')}`}
                    confirmText={t('changePlan.confirmCta')}
                    cancelText={t('changePlan.cancel')}
                    onConfirm={handleConfirmChange}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
}
