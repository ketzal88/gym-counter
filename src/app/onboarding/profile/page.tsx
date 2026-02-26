'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { User, Scale, Ruler, Calendar } from 'lucide-react';

export default function OnboardingProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();

    // Estados del formulario
    const [weight, setWeight] = useState(70);
    const [sex, setSex] = useState<'M' | 'F' | null>(null);
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(170);

    const handleContinue = () => {
        // Validación básica
        if (!sex) {
            alert(t('onboarding.selectSex'));
            return;
        }

        // Guardar en localStorage temporalmente
        localStorage.setItem('onboarding_profile', JSON.stringify({
            weight,
            sex,
            age,
            height
        }));

        router.push('/onboarding/goals');
    };

    // Calcular IMC
    const calculateBMI = () => {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const bmi = calculateBMI();

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('onboarding.profileTitle')}
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400">
                    {t('onboarding.profileSubtitle')}
                </p>
            </div>

            {/* Avatar Preview */}
            <div className="flex justify-center">
                <div className="relative">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-4xl">
                        {sex === 'M' ? '🧔' : sex === 'F' ? '👩' : <User className="w-10 h-10 text-slate-400" />}
                    </div>
                    {sex && (
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-lg px-2 py-1">
                            <span className="text-xs font-semibold">
                                {t('onboarding.bmi')} {bmi}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Formulario */}
            <div className="space-y-8">
                {/* Selector de Sexo */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <User className="w-4 h-4" />
                        {t('onboarding.sex')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setSex('M')}
                            className={`
                                h-24 rounded-lg font-medium transition-colors
                                ${sex === 'M'
                                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                                    : 'bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl">🧔</span>
                                <span className="text-sm">{t('onboarding.male')}</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSex('F')}
                            className={`
                                h-24 rounded-lg font-medium transition-colors
                                ${sex === 'F'
                                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                                    : 'bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl">👩</span>
                                <span className="text-sm">{t('onboarding.female')}</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Peso con Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Scale className="w-4 h-4" />
                            {t('onboarding.weight')}
                        </label>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {weight}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-500 ml-1">kg</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="40"
                        max="150"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>40 kg</span>
                        <span>150 kg</span>
                    </div>
                </div>

                {/* Altura con Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Ruler className="w-4 h-4" />
                            {t('onboarding.height')}
                        </label>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {height}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-500 ml-1">cm</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="140"
                        max="220"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>140 cm</span>
                        <span>220 cm</span>
                    </div>
                </div>

                {/* Edad con Selector Numérico */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4" />
                        {t('onboarding.age')}
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setAge(Math.max(15, age - 1))}
                            className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-950 font-semibold text-lg transition-colors"
                        >
                            −
                        </button>
                        <div className="flex-1 h-14 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                {age}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-500 ml-2">{t('common.years')}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAge(Math.min(80, age + 1))}
                            className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-950 font-semibold text-lg transition-colors"
                        >
                            +
                        </button>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>15-80 {t('common.years')}</span>
                    </div>
                </div>
            </div>

            {/* Botón de Continuar */}
            <button
                onClick={handleContinue}
                disabled={!sex}
                className={`
                    w-full h-12 rounded-lg font-semibold transition-colors
                    ${sex
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }
                `}
            >
                {t('common.continue')}
            </button>
        </div>
    );
}
