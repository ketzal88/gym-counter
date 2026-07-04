'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Card colapsable con la guía de seguridad del plan posparto: las 5 reglas,
 * ejercicios a evitar, señales de alarma, caminatas y lactancia. Contenido estático.
 */
export default function PostpartumGuideCard() {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);

    const rules = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5'].map(k => t(`postpartum.${k}`));
    const sections = [
        { icon: 'block', titleKey: 'postpartum.avoidTitle', bodyKey: 'postpartum.avoidBody' },
        { icon: 'e911_emergency', titleKey: 'postpartum.alarmTitle', bodyKey: 'postpartum.alarmBody' },
        { icon: 'directions_walk', titleKey: 'postpartum.walkTitle', bodyKey: 'postpartum.walkBody' },
        { icon: 'nutrition', titleKey: 'postpartum.lactationTitle', bodyKey: 'postpartum.lactationBody' },
    ];

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
            >
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-rounded text-lg text-teal-600 dark:text-teal-400">menu_book</span>
                    {t('postpartum.guideTitle')}
                </h3>
                <span className={`material-symbols-rounded text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {open && (
                <div className="px-5 pb-5 space-y-5">
                    {/* 5 reglas */}
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('postpartum.rulesTitle')}
                        </p>
                        <ol className="space-y-1.5">
                            {rules.map((rule, i) => (
                                <li key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    <span className="w-5 h-5 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[10px] font-black flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {sections.map(sec => (
                        <div key={sec.titleKey} className="space-y-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <span className="material-symbols-rounded text-base text-teal-600 dark:text-teal-400">{sec.icon}</span>
                                {t(sec.titleKey)}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t(sec.bodyKey)}</p>
                        </div>
                    ))}

                    <p className="text-[11px] text-slate-400 dark:text-slate-600 italic leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                        {t('postpartum.disclaimer')}
                    </p>
                </div>
            )}
        </div>
    );
}
