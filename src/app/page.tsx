'use client';

import Link from 'next/link';
import PublicOnlyGuard from './components/guards/PublicOnlyGuard';
import { Check, ArrowRight, Target, TrendingUp, Award, Shield, Video, Trophy } from 'lucide-react';

export default function LandingPage() {
  return (
    <PublicOnlyGuard>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-xl">💪</span>
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                  GymCounter
                </span>
              </div>
              <Link
                href="/auth/signin"
                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                  Protocolo de 180 Días
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Transforma tu físico<br />
                <span className="text-blue-600">en 180 días</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Plan personalizado adaptado a tu objetivo, experiencia y disponibilidad.<br className="hidden md:block" />
                Progresión automática. Tracking completo. Modo offline.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href="/auth/signup"
                  className="group w-full sm:w-auto px-8 py-4 rounded-lg font-semibold text-base bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  Comenzar 7 días gratis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#pricing"
                  className="w-full sm:w-auto px-8 py-4 rounded-lg font-medium text-base border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                >
                  Ver planes
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-slate-500 dark:text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Sin tarjeta requerida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Cancela cuando quieras</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Funciona offline</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-24">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Todo lo que necesitas
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Un sistema completo para transformar tu físico de forma estructurada
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Target className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Plan Personalizado
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  48 variantes adaptadas a tu objetivo, experiencia y disponibilidad semanal.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Progresión Automática
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pesos, series y repeticiones calculados automáticamente según tu progreso.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Award className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Tracking Avanzado
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Registra sesiones, visualiza progreso y mantén tu racha de entrenamiento.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Video className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Videos de Técnica
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cada ejercicio incluye video de YouTube con técnica correcta y segura.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Sistema de Logros
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Desbloquea badges por asistencia, PRs y rachas. Gamificación motivante.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Modo Offline
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Funciona sin conexión. Sincroniza automáticamente cuando vuelves online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-24">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Planes simples
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Comienza con 7 días gratis. Sin tarjeta requerida.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Plan Mensual */}
              <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      Mensual
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Cancela cuando quieras
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                      $4.99
                    </span>
                    <span className="text-slate-500 dark:text-slate-500">
                      /mes
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'Plan personalizado 180 días',
                      'Progresión automática',
                      'Videos de técnica',
                      'Sistema de logros',
                      'Modo offline',
                      'Tracking ilimitado'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/signup"
                    className="block w-full py-3 rounded-lg font-medium text-center border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                  >
                    Comenzar gratis
                  </Link>
                </div>
              </div>

              {/* Plan Anual - DESTACADO */}
              <div className="relative p-8 rounded-xl border-2 border-blue-600 bg-white dark:bg-slate-950">
                {/* Badge de Popular */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">
                  Más popular
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      Anual
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Ahorra 2 meses gratis
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        $49.90
                      </span>
                      <span className="text-slate-500 dark:text-slate-500">
                        /año
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                      <span className="line-through">$59.88</span>
                      {' · '}
                      <span className="text-blue-600 dark:text-blue-500 font-medium">Ahorra $9.98</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'Todo lo del plan mensual',
                      '2 meses gratis ($9.98 ahorro)',
                      'Soporte prioritario',
                      'Acceso anticipado a funciones',
                      'Sin renovaciones mensuales',
                      'Mejor precio garantizado'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/signup"
                    className="block w-full py-3 rounded-lg font-semibold text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Comenzar gratis
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="text-center mt-12">
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Pagos seguros procesados por Stripe · Tus datos están protegidos
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-3xl mx-auto px-6 md:px-8 py-24">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Preguntas frecuentes
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: '¿Necesito experiencia previa en el gym?',
                  a: 'No. El plan se adapta a tu nivel (principiante, intermedio, avanzado). Si eres nuevo, comenzarás con ejercicios básicos y volumen moderado.'
                },
                {
                  q: '¿Realmente funciona offline?',
                  a: 'Sí. Una vez que cargas tu plan, puedes completar workouts sin conexión. Los datos se sincronizan automáticamente cuando vuelves a tener internet.'
                },
                {
                  q: '¿Qué pasa después de los 7 días gratis?',
                  a: 'Puedes elegir plan mensual ($4.99/mes) o anual ($49.90/año). Si no deseas continuar, simplemente no te suscribes. No se requiere tarjeta.'
                },
                {
                  q: '¿Puedo cancelar mi suscripción?',
                  a: 'Sí, en cualquier momento desde la configuración. Mantendrás acceso hasta el final de tu período de pago.'
                },
                {
                  q: '¿El plan incluye nutrición?',
                  a: 'Actualmente nos enfocamos en entrenamiento. Próximamente agregaremos calculadora de macros y guías de nutrición.'
                },
                {
                  q: '¿Funciona en cualquier dispositivo?',
                  a: 'Sí. GymCounter es una PWA que funciona en cualquier navegador. Puedes añadirla a tu pantalla de inicio como app nativa.'
                }
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="group p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-medium text-slate-900 dark:text-white">
                    <span className="text-base">{faq.q}</span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-4xl mx-auto px-6 md:px-8 py-24 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              ¿Listo para transformar tu físico?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Únete a GymCounter y comienza tu viaje de 180 días.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-base bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Comenzar 7 días gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Sin tarjeta requerida · Cancela cuando quieras
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-lg">💪</span>
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  GymCounter
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Términos
                </Link>
                <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Privacidad
                </Link>
                <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Contacto
                </Link>
              </div>

              <div className="text-sm text-slate-500 dark:text-slate-500">
                © 2025 GymCounter
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PublicOnlyGuard>
  );
}
