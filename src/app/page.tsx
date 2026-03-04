'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicOnlyGuard from './components/guards/PublicOnlyGuard';
import { useLanguage } from '@/context/LanguageContext';
import { Check, ArrowRight, TrendingUp, Play, WifiOff, Dumbbell, Zap, Shield, Target, Sparkles, Heart, Flame, X, Star, Users, BarChart3, ChevronRight } from 'lucide-react';

// --- Phone Mockup Shell ---
function PhoneMockup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto w-[240px] h-[480px] bg-slate-900 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl overflow-hidden ${className}`}>
      <div className="h-10 bg-slate-900 flex items-center justify-center">
        <div className="w-20 h-5 bg-slate-800 rounded-full" />
      </div>
      <div className="bg-white dark:bg-slate-950 h-[calc(100%-2.5rem)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// --- Mockup Screens ---
function MockupProfileScreen() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-2 w-36 bg-slate-100 dark:bg-slate-900 rounded" />
      <div className="flex gap-3 mt-4">
        <div className="flex-1 h-12 rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
          <span className="text-xs font-bold text-amber-600">M</span>
        </div>
        <div className="flex-1 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-400">F</span>
        </div>
      </div>
      <div className="space-y-3 mt-2">
        {[{ label: '80 kg' }, { label: '178 cm' }, { label: '28' }].map((item) => (
          <div key={item.label}>
            <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center px-3">
              <span className="text-xs font-semibold text-slate-500">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="h-10 rounded-lg bg-slate-900 dark:bg-white mt-4" />
    </div>
  );
}

function MockupPlanScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="flex gap-1.5 mt-2">
        {['L', 'M', 'X', 'J', 'V'].map((d, i) => (
          <div key={d} className={`flex-1 h-8 rounded-md flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-3">
        {[
          { name: 'Bench Press', w: '60kg', sets: '4×8' },
          { name: 'Barbell Row', w: '50kg', sets: '4×8' },
          { name: 'OHP', w: '35kg', sets: '3×10' },
          { name: 'Lat Pulldown', w: '45kg', sets: '3×12' },
        ].map((ex) => (
          <div key={ex.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
            <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{ex.name}</div>
              <div className="text-[9px] text-slate-400">{ex.sets}</div>
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{ex.w}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupTrackerScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-5 w-14 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Day 12</span>
        </div>
      </div>
      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Bench Press</div>
        <div className="space-y-1.5">
          {[1, 2, 3, 4].map((set) => (
            <div key={set} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${set <= 2 ? 'bg-amber-500' : 'border-2 border-slate-200 dark:border-slate-700'}`}>
                {set <= 2 && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 h-6 rounded bg-slate-50 dark:bg-slate-900 flex items-center px-2">
                <span className="text-[10px] text-slate-500">60 kg</span>
              </div>
              <div className="h-6 w-10 rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <span className="text-[10px] text-slate-500">×8</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-10 rounded-lg bg-amber-500 flex items-center justify-center mt-2">
        <span className="text-[11px] font-bold text-white tracking-wide">COMPLETAR</span>
      </div>
    </div>
  );
}

function MockupProgressionScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="space-y-2 mt-3">
        {[
          { name: 'Bench Press', prev: '57.5kg', curr: '60kg' },
          { name: 'Squat', prev: '80kg', curr: '85kg' },
          { name: 'Deadlift', prev: '95kg', curr: '100kg' },
        ].map((ex) => (
          <div key={ex.name} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{ex.name}</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 line-through">{ex.prev}</span>
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-[11px] font-bold text-green-600 dark:text-green-400">{ex.curr}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: '65%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupVideoScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="relative aspect-video bg-slate-800 rounded-lg mt-2 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-white/20">
            <div className="h-1 w-1/3 rounded-full bg-amber-500" />
          </div>
          <span className="text-[8px] text-white/60">3:42</span>
        </div>
      </div>
      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Bench Press - Técnica</div>
      <div className="text-[9px] text-slate-400 leading-relaxed">Posición correcta, agarre, arco, y ejecución del movimiento.</div>
      <div className="flex gap-2 mt-1">
        <div className="h-6 flex-1 rounded bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          <span className="text-[9px] text-slate-500">Anterior</span>
        </div>
        <div className="h-6 flex-1 rounded bg-amber-500 flex items-center justify-center">
          <span className="text-[9px] text-white font-medium">Siguiente</span>
        </div>
      </div>
    </div>
  );
}

function MockupOfflineScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 justify-center py-1.5 rounded-full bg-slate-100 dark:bg-slate-900">
        <WifiOff className="w-3 h-3 text-slate-400" />
        <span className="text-[9px] font-medium text-slate-500">Sin conexión</span>
      </div>
      <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-1.5 w-14 bg-slate-100 dark:bg-slate-900 rounded" />
            </div>
            <Check className="w-4 h-4 text-green-500" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="text-[9px] font-medium text-green-700 dark:text-green-400">Sesión guardada localmente</span>
      </div>
    </div>
  );
}

// --- Main Landing Page ---
export default function LandingPage() {
  const { t, dict } = useLanguage();
  const [billingAnnual, setBillingAnnual] = useState(true);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <PublicOnlyGuard>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* 1. Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white dark:text-slate-900" />
                </div>
                <span className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                  GymCounter
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="#pricing"
                  className="hidden sm:inline-flex text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('landing.ctaPlans')}
                </a>
                <Link
                  href="/auth/signin"
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('landing.signIn')}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 2. Hero */}
        <section className="overflow-hidden relative">
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/10 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-6 md:px-8 py-20 md:py-28">
            <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                  {t('landing.protocolBadge')}
                </span>
              </div>

              {/* Two-line headline */}
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                {t('landing.heroHeadline')}
                <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {t('landing.heroHeadlineAccent')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                {t('landing.heroSubtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href="/auth/signup"
                  className="group w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/10 dark:shadow-white/10 flex items-center justify-center gap-2"
                >
                  {t('landing.ctaStart')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#pricing"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-base border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-center"
                >
                  {t('landing.ctaPlans')}
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-slate-500 dark:text-slate-500">
                {[t('landing.trustNoCard'), t('landing.trustCancel'), t('landing.trustOffline')].map((trust) => (
                  <div key={trust} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>{trust}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2.5 Social Proof Bar */}
        <section className="border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Users, number: t('landing.socialProofUsers'), label: t('landing.socialProofUsersLabel') },
                { icon: BarChart3, number: t('landing.socialProofWorkouts'), label: t('landing.socialProofWorkoutsLabel') },
                { icon: Star, number: t('landing.socialProofRating'), label: t('landing.socialProofRatingLabel') },
                { icon: Target, number: t('landing.socialProofPrograms'), label: t('landing.socialProofProgramsLabel') },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                    <stat.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-slate-900 dark:text-white">{stat.number}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Problem → Solution */}
        <section>
          <div className="max-w-5xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="text-center space-y-3 mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('landing.problemTitle')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {t('landing.problemSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Without system */}
              <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                  <X className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t('landing.comparisonWithout')}</h3>
                </div>
                <ul className="space-y-4">
                  {(dict.landing.problemItems as string[]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* With GymCounter */}
              <div className="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                <div className="flex items-center gap-2 mb-6">
                  <Check className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t('landing.solutionTitle')}</h3>
                </div>
                <ul className="space-y-4">
                  {(dict.landing.solutionItems as string[]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Goals Section */}
        <section className="bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="text-center space-y-3 mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('landing.goalsTitle')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {t('landing.goalsSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { key: 'weight_loss', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                { key: 'muscle_gain', icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                { key: 'max_strength', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                { key: 'conditioning', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                { key: 'toned_abs', icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
                { key: 'glute_building', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                { key: 'fat_burn', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
              ].map(({ key, icon: Icon, color, bg, border }) => (
                <Link
                  key={key}
                  href="/auth/signup"
                  className={`group p-5 rounded-2xl border ${border} ${bg} hover:scale-[1.02] transition-all space-y-3`}
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {t(`landing.goalCard_${key}`)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t(`landing.goalCard_${key}_desc`)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 5. How It Works */}
        <section>
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="text-center space-y-3 mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('landing.howItWorksTitle')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {t('landing.howItWorksSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              {/* Step 1 */}
              <div className="text-center space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg">
                  1
                </div>
                <PhoneMockup className="animate-phone-float">
                  <MockupProfileScreen />
                </PhoneMockup>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{t('landing.step1Title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">{t('landing.step1Desc')}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-6 animate-fade-in-up animate-delay-100">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg">
                  2
                </div>
                <PhoneMockup className="animate-phone-float">
                  <MockupPlanScreen />
                </PhoneMockup>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{t('landing.step2Title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">{t('landing.step2Desc')}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-6 animate-fade-in-up animate-delay-200">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-lg">
                  3
                </div>
                <PhoneMockup className="animate-phone-float">
                  <MockupTrackerScreen />
                </PhoneMockup>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{t('landing.step3Title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">{t('landing.step3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Features (Alternating Left-Right) */}
        <section className="bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24 space-y-24">
            {/* Feature 1: Automatic Progression */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Smart</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('landing.feature1Title')}
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('landing.feature1Desc')}
                </p>
                <ul className="space-y-3">
                  {(dict.landing.feature1Bullets as string[]).map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-shrink-0">
                <PhoneMockup className="animate-phone-float">
                  <MockupProgressionScreen />
                </PhoneMockup>
              </div>
            </div>

            {/* Feature 2: Technique Videos */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Videos</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('landing.feature2Title')}
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('landing.feature2Desc')}
                </p>
                <ul className="space-y-3">
                  {(dict.landing.feature2Bullets as string[]).map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-shrink-0">
                <PhoneMockup className="animate-phone-float">
                  <MockupVideoScreen />
                </PhoneMockup>
              </div>
            </div>

            {/* Feature 3: Offline Mode */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Offline</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('landing.feature3Title')}
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('landing.feature3Desc')}
                </p>
                <ul className="space-y-3">
                  {(dict.landing.feature3Bullets as string[]).map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-shrink-0">
                <PhoneMockup className="animate-phone-float">
                  <MockupOfflineScreen />
                </PhoneMockup>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Comparison Table */}
        <section>
          <div className="max-w-4xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="text-center space-y-3 mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('landing.comparisonTitle')}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900">
                <div className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                  {t('landing.comparisonWithout')}
                </div>
                <div className="px-6 py-4 text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {t('landing.comparisonWith')}
                </div>
              </div>
              {/* Table rows */}
              {(dict.landing.comparisonRows as { without: string; with: string }[]).map((row, idx) => (
                <div key={idx} className={`grid grid-cols-2 ${idx < (dict.landing.comparisonRows as { without: string; with: string }[]).length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
                  <div className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{row.without}</span>
                  </div>
                  <div className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>{row.with}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Testimonials */}
        <section className="bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="text-center space-y-3 mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('landing.testimonialsTitle')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {t('landing.testimonialsSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {(dict.landing.testimonials as { name: string; role: string; quote: string; metric: string }[]).map((testimonial, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  {/* Metric badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40">
                    <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">{testimonial.metric}</span>
                  </div>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Stats */}
        <section>
          <div className="max-w-5xl mx-auto px-6 md:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: t('landing.stat1Number'), label: t('landing.stat1Label') },
                { number: t('landing.stat2Number'), label: t('landing.stat2Label') },
                { number: t('landing.stat3Number'), label: t('landing.stat3Label') },
                { number: t('landing.stat4Number'), label: t('landing.stat4Label') },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Pricing */}
        <section id="pricing" className="bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="text-center space-y-3 mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('landing.pricingTitle')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('landing.pricingSubtitle')}
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mb-12">
              <button
                onClick={() => setBillingAnnual(false)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${!billingAnnual ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {t('landing.billingMonthly')}
              </button>
              <button
                onClick={() => setBillingAnnual(true)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${billingAnnual ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {t('landing.billingAnnual')}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${billingAnnual ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'}`}>
                  {t('landing.savePercent')}
                </span>
              </button>
            </div>

            {/* Single pricing card */}
            <div className="max-w-lg mx-auto">
              <div className="relative p-8 md:p-10 rounded-2xl border-2 border-amber-500 dark:border-amber-400 bg-white dark:bg-slate-950 shadow-xl shadow-amber-500/5">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                  {billingAnnual ? t('landing.mostPopular') : t('landing.planMonthly')}
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {billingAnnual ? t('landing.planAnnual') : t('landing.planMonthly')}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-display text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {billingAnnual ? '$4.16' : '$4.99'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-500">{t('landing.perMonth')}</span>
                    </div>
                    {billingAnnual && (
                      <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                        <span className="line-through">$59.88</span>
                        {' '}
                        <span className="text-amber-600 dark:text-amber-400 font-medium">$49.90{t('landing.perYear')}</span>
                        {' · '}
                        <span className="text-amber-600 dark:text-amber-400 font-medium">{t('landing.save')} $9.98</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {(billingAnnual
                      ? (dict.landing.annualFeatures as string[])
                      : (dict.landing.monthlyFeatures as string[])
                    ).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/signup"
                    className="group block w-full py-4 rounded-xl font-semibold text-center bg-amber-500 text-white hover:bg-amber-600 transition-colors text-base flex items-center justify-center gap-2"
                  >
                    {t('landing.ctaStart')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <p className="text-center text-xs text-slate-500 dark:text-slate-500">
                    {t('landing.pricingGuarantee')}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-sm text-slate-500 dark:text-slate-500">{t('landing.securePayments')}</p>
            </div>
          </div>
        </section>

        {/* 11. FAQ */}
        <section>
          <div className="max-w-3xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="text-center space-y-3 mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('landing.faqTitle')}
              </h2>
            </div>
            <div className="space-y-3">
              {(dict.landing.faq as { q: string; a: string }[]).map((faq, idx) => (
                <details
                  key={idx}
                  className="group p-5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-medium text-slate-900 dark:text-white">
                    <span className="text-sm">{faq.q}</span>
                    <span className="text-amber-500 dark:text-amber-400 group-open:rotate-180 transition-transform ml-4 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 12. Final CTA */}
        <section className="px-4 md:px-8 py-12">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 p-12 md:p-16 text-center space-y-6 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight relative">
              {t('landing.ctaFinalTitle')}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto relative">
              {t('landing.ctaFinalSubtitle')}
            </p>
            <Link
              href="/auth/signup"
              className="relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-white text-amber-600 hover:bg-slate-50 transition-colors shadow-lg"
            >
              {t('landing.ctaStart')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-white/60 relative">
              {t('landing.ctaFinalNoCard')}
            </p>
          </div>
        </section>

        {/* 13. Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-white dark:text-slate-900" />
                </div>
                <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                  GymCounter
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('landing.footerTerms')}
                </Link>
                <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('landing.footerPrivacy')}
                </Link>
                <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('landing.footerContact')}
                </Link>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-500">
                © 2026 GymCounter
              </div>
            </div>
          </div>
        </footer>

        {/* Sticky Mobile CTA */}
        <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${showStickyCta ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-3">
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              {t('landing.ctaStart')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicOnlyGuard>
  );
}
