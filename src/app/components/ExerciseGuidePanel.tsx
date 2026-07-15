'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getExerciseGuide } from '@/data/exerciseGuide';

interface ExerciseGuidePanelProps {
    exerciseId: string;
}

/**
 * Panel colapsable con la técnica de un ejercicio: músculo objetivo, secundarios
 * y pasos de ejecución en el idioma del usuario.
 *
 * No todos los ejercicios tienen guía (metcons, skills, posparto) — en ese caso
 * el componente no renderiza nada.
 */
export default function ExerciseGuidePanel({ exerciseId }: ExerciseGuidePanelProps) {
    const { t, locale } = useLanguage();
    const [open, setOpen] = useState(false);
    const guide = getExerciseGuide(exerciseId);

    if (!guide) return null;

    const steps = guide.steps[locale];

    return (
        <div className="mt-4 border-t border-slate-800 pt-3">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="w-full flex items-center justify-between text-left group"
            >
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                    <span className="material-symbols-rounded text-base">menu_book</span>
                    {t('routine.howTo')}
                </span>
                <span className={`material-symbols-rounded text-slate-500 text-lg transition-transform ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {open && (
                <div className="mt-3 animate-fade-in space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">
                            {guide.target}
                        </span>
                        {guide.secondaryMuscles.map((muscle) => (
                            <span
                                key={muscle}
                                className="text-[9px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider"
                            >
                                {muscle}
                            </span>
                        ))}
                    </div>

                    <ol className="space-y-2">
                        {steps.map((step, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-black flex items-center justify-center mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-xs text-slate-400 leading-relaxed">{step}</p>
                            </li>
                        ))}
                    </ol>

                    <p className="text-[9px] text-slate-600 leading-relaxed">{t('routine.guideSource')}</p>
                </div>
            )}
        </div>
    );
}
