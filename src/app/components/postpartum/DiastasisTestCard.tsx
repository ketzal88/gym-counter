'use client';

import { useState } from 'react';
import { updateUserTrainingState, UserTrainingState } from '@/services/db';
import { useLanguage } from '@/context/LanguageContext';

type DiastasisResult = NonNullable<UserTrainingState['diastasisResult']>;

interface DiastasisTestCardProps {
    userId: string;
    result?: UserTrainingState['diastasisResult'];
    testedAt?: string; // ISO
}

const RESULT_OPTIONS: { id: DiastasisResult; labelKey: string; adviceKey: string; tone: 'ok' | 'warn' | 'muted' }[] = [
    { id: 'mild', labelKey: 'postpartum.testMild', adviceKey: 'postpartum.testMildAdvice', tone: 'ok' },
    { id: 'moderate', labelKey: 'postpartum.testModerate', adviceKey: 'postpartum.testModerateAdvice', tone: 'warn' },
    { id: 'unknown', labelKey: 'postpartum.testUnknown', adviceKey: 'postpartum.testUnknownAdvice', tone: 'muted' },
];

/**
 * Card del autotest de diástasis (plan posparto). Muestra el instructivo, permite
 * registrar el resultado y lo guarda en userTrainingState (campo opcional, merge/update).
 * Vuelve a mostrar el último resultado con opción de re-testear.
 */
export default function DiastasisTestCard({ userId, result, testedAt }: DiastasisTestCardProps) {
    const { t } = useLanguage();
    // Si ya hay un resultado guardado, arrancamos plegados (modo "ver último").
    const [expanded, setExpanded] = useState(!result);
    const [selected, setSelected] = useState<DiastasisResult | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!selected || !userId) return;
        setSaving(true);
        try {
            await updateUserTrainingState(userId, {
                diastasisResult: selected,
                diastasisTestedAt: new Date().toISOString(),
            });
            setExpanded(false);
            setSelected(null);
        } catch (e) {
            console.error('Error saving diastasis result', e);
        } finally {
            setSaving(false);
        }
    };

    const lastLabel = RESULT_OPTIONS.find(o => o.id === result)?.labelKey;
    const testedDate = testedAt ? new Date(testedAt).toLocaleDateString() : null;

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-rounded text-lg text-teal-600 dark:text-teal-400">fact_check</span>
                    {t('postpartum.testTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('postpartum.testSubtitle')}</p>
            </div>

            <div className="p-4 space-y-4">
                {/* Último resultado guardado */}
                {result && (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('postpartum.testLastResult')}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{lastLabel ? t(lastLabel) : t('postpartum.testNever')}</p>
                            {testedDate && <p className="text-[11px] text-slate-400 mt-0.5">{testedDate}</p>}
                        </div>
                        {!expanded && (
                            <button
                                onClick={() => setExpanded(true)}
                                className="text-xs font-semibold text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-900/40 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors"
                            >
                                {t('postpartum.testRetake')}
                            </button>
                        )}
                    </div>
                )}

                {/* Warning persistente si el último test fue moderado */}
                {result === 'moderate' && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-3 flex gap-2">
                        <span className="material-symbols-rounded text-amber-500 text-lg shrink-0">warning</span>
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{t('postpartum.testWarningModerate')}</p>
                    </div>
                )}

                {expanded && (
                    <>
                        {/* Instructivo */}
                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <p>{t('postpartum.testIntro')}</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>{t('postpartum.testStep1')}</li>
                                <li>{t('postpartum.testStep2')}</li>
                                <li>{t('postpartum.testStep3')}</li>
                                <li>{t('postpartum.testStep4')}</li>
                            </ol>
                        </div>

                        {/* Selección de resultado */}
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('postpartum.testResultQuestion')}
                            </p>
                            {RESULT_OPTIONS.map(opt => {
                                const isSel = selected === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setSelected(opt.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                            isSel
                                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t(opt.labelKey)}</p>
                                        {isSel && (
                                            <p className={`text-xs mt-1 leading-relaxed ${
                                                opt.tone === 'warn' ? 'text-amber-600 dark:text-amber-400'
                                                    : opt.tone === 'ok' ? 'text-teal-600 dark:text-teal-400'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                                {t(opt.adviceKey)}
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!selected || saving}
                            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                                !selected || saving
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                    : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                        >
                            {t('postpartum.testSave')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
