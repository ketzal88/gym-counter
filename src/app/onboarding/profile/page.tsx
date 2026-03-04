'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { User, Scale, Ruler, Calendar } from 'lucide-react';

function NumberStepper({
    value,
    onChange,
    min,
    max,
    unit,
    icon: Icon,
    label,
}: {
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    unit: string;
    icon: typeof Scale;
    label: string;
}) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clamp = (v: number) => Math.max(min, Math.min(max, v));

    const stopRepeat = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        timeoutRef.current = null;
        intervalRef.current = null;
    }, []);

    const startRepeat = useCallback((delta: number) => {
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                onChange(clamp(value + delta));
            }, 80);
        }, 400);
    }, [value, onChange, min, max]);

    const handlePointerDown = (delta: number) => {
        onChange(clamp(value + delta));
        startRepeat(delta);
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Icon className="w-4 h-4" />
                {label}
            </label>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onPointerDown={() => handlePointerDown(-1)}
                    onPointerUp={stopRepeat}
                    onPointerLeave={stopRepeat}
                    className="w-14 h-12 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-950 font-semibold text-xl transition-colors select-none active:bg-slate-100 dark:active:bg-slate-900"
                >
                    −
                </button>
                <div className="flex-1 h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center gap-1 relative">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const v = parseInt(e.target.value);
                            if (!isNaN(v)) onChange(clamp(v));
                        }}
                        className="w-20 text-center text-3xl font-bold text-slate-900 dark:text-white bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-slate-500 dark:text-slate-500">{unit}</span>
                </div>
                <button
                    type="button"
                    onPointerDown={() => handlePointerDown(1)}
                    onPointerUp={stopRepeat}
                    onPointerLeave={stopRepeat}
                    className="w-14 h-12 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-950 font-semibold text-xl transition-colors select-none active:bg-slate-100 dark:active:bg-slate-900"
                >
                    +
                </button>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
                <span>{min} {unit}</span>
                <span>{max} {unit}</span>
            </div>
        </div>
    );
}

export default function OnboardingProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();

    const [weight, setWeight] = useState(70);
    const [sex, setSex] = useState<'M' | 'F' | null>(null);
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(170);

    const handleContinue = () => {
        if (!sex) {
            alert(t('onboarding.selectSex'));
            return;
        }

        localStorage.setItem('onboarding_profile', JSON.stringify({
            weight,
            sex,
            age,
            height
        }));

        router.push('/onboarding/goals');
    };

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

                {/* Peso */}
                <NumberStepper
                    value={weight}
                    onChange={setWeight}
                    min={40}
                    max={150}
                    unit="kg"
                    icon={Scale}
                    label={t('onboarding.weight')}
                />

                {/* Altura */}
                <NumberStepper
                    value={height}
                    onChange={setHeight}
                    min={140}
                    max={220}
                    unit="cm"
                    icon={Ruler}
                    label={t('onboarding.height')}
                />

                {/* Edad */}
                <NumberStepper
                    value={age}
                    onChange={setAge}
                    min={15}
                    max={80}
                    unit={t('common.years')}
                    icon={Calendar}
                    label={t('onboarding.age')}
                />
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
