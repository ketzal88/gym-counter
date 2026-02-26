'use client';

import Link from 'next/link';
import PublicOnlyGuard from './components/guards/PublicOnlyGuard';
import { Check, Zap, Target, TrendingUp, Award, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <PublicOnlyGuard>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">💪</span>
                <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GymCounter
                </span>
              </div>
              <Link
                href="/auth/signin"
                className="px-6 py-2 rounded-xl font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  Protocolo de 180 Días Científicamente Estructurado
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight">
                Transforma tu Físico<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  en 180 Días
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Plan personalizado adaptado a tu objetivo, experiencia y disponibilidad.
                Progresión automática, tracking completo y modo offline.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
                >
                  Comienza 7 Días Gratis 🚀
                </Link>
                <a
                  href="#pricing"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:scale-105 transition-all"
                >
                  Ver Planes
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Sin tarjeta requerida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Cancela cuando quieras</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Funciona offline</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                Todo lo que necesitas
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Un sistema completo para transformar tu físico de forma estructurada y científica
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Plan Personalizado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  48 variantes de plan adaptadas a tu objetivo (pérdida de peso, músculo, fuerza, resistencia), experiencia y disponibilidad semanal.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Progresión Automática
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  El sistema calcula automáticamente tus pesos, series y repeticiones óptimas para cada ejercicio según tu progreso.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Tracking Avanzado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Registra cada sesión, visualiza tu progreso con gráficos, desbloquea logros y mantén tu racha de entrenamiento.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎥</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Videos de Técnica
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cada ejercicio incluye un video de YouTube mostrando la técnica correcta para ejecutarlo de forma segura.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Sistema de Logros
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Desbloquea badges por asistencia, PRs, rachas consecutivas y más. Gamificación que te mantiene motivado.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Modo Offline
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Funciona sin conexión. Completa tus workouts en el gym sin WiFi y sincroniza después automáticamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                Planes simples y accesibles
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Comienza con 7 días gratis. Sin tarjeta requerida. Cancela cuando quieras.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Plan Mensual */}
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                      Mensual
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Cancela cuando quieras
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">
                      $4.99
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-lg">
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
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/signup"
                    className="block w-full py-4 rounded-2xl font-bold text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform"
                  >
                    Comenzar Gratis
                  </Link>
                </div>
              </div>

              {/* Plan Anual - DESTACADO */}
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 scale-105 hover:scale-110 transition-all">
                {/* Badge de Popular */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-black shadow-lg">
                  🔥 MÁS POPULAR
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black mb-2">
                      Anual
                    </h3>
                    <p className="text-white/90 text-sm">
                      Ahorra 2 meses gratis
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black">
                        $49.90
                      </span>
                      <span className="text-white/80 text-lg">
                        /año
                      </span>
                    </div>
                    <div className="text-sm text-white/80">
                      <span className="line-through">$59.88</span>
                      {' '}→{' '}
                      <span className="font-bold text-amber-300">Ahorra $9.98</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'Todo lo del plan mensual',
                      '2 meses gratis ($9.98 de ahorro)',
                      'Soporte prioritario',
                      'Acceso anticipado a nuevas funciones',
                      'Sin preocuparte por renovaciones',
                      'Mejor precio garantizado'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-white flex-shrink-0" />
                        <span className="text-white">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/signup"
                    className="block w-full py-4 rounded-2xl font-bold text-center bg-white text-blue-600 hover:scale-105 transition-transform shadow-lg"
                  >
                    Comenzar Gratis
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="text-center mt-12">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                💳 Pagos seguros procesados por Stripe • 🔒 Tus datos están protegidos
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                Preguntas Frecuentes
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: '¿Necesito experiencia previa en el gym?',
                  a: 'No. El plan se adapta a tu nivel (principiante, intermedio, avanzado). Si eres nuevo, comenzarás con ejercicios básicos y volumen moderado para construir técnica de forma segura.'
                },
                {
                  q: '¿Realmente funciona offline?',
                  a: 'Sí. Una vez que cargas tu plan, puedes completar workouts sin conexión. Los datos se sincronizan automáticamente cuando vuelves a tener internet.'
                },
                {
                  q: '¿Qué pasa después de los 7 días gratis?',
                  a: 'Después de 7 días, puedes elegir el plan mensual ($4.99/mes) o anual ($49.90/año). Si no deseas continuar, simplemente no te suscribes. No se requiere tarjeta para el trial.'
                },
                {
                  q: '¿Puedo cancelar mi suscripción?',
                  a: 'Sí, puedes cancelar en cualquier momento desde la configuración de tu cuenta. Mantendrás acceso hasta el final de tu período de pago.'
                },
                {
                  q: '¿El plan incluye nutrición?',
                  a: 'Actualmente nos enfocamos en entrenamiento estructurado. Próximamente agregaremos calculadora de macros y guías de nutrición.'
                },
                {
                  q: '¿Funciona en cualquier dispositivo?',
                  a: 'Sí. GymCounter es una PWA (Progressive Web App) que funciona en cualquier navegador moderno. Puedes añadirla a tu pantalla de inicio como una app nativa.'
                }
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-900 dark:text-white">
                    <span>{faq.q}</span>
                    <span className="text-2xl group-open:rotate-180 transition-transform">
                      ↓
                    </span>
                  </summary>
                  <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black">
              ¿Listo para transformar tu físico?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Únete a GymCounter y comienza tu viaje de 180 días hacia el mejor físico de tu vida.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-10 py-5 rounded-2xl font-black text-xl bg-white text-blue-600 hover:scale-110 transition-transform shadow-2xl"
            >
              Comenzar 7 Días Gratis 🚀
            </Link>
            <p className="text-sm text-white/70">
              Sin tarjeta requerida • Cancela cuando quieras
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-slate-900 dark:bg-black text-slate-400">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💪</span>
                <span className="font-black text-xl text-white">
                  GymCounter
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <Link href="#" className="hover:text-white transition-colors">
                  Términos de Servicio
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </div>

              <div className="text-sm">
                © 2025 GymCounter. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PublicOnlyGuard>
  );
}
