'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import {
  Visit,
  BodyMeasurement,
  subscribeToVisits,
  addVisit,
  subscribeToBodyMeasurements,
  addBodyMeasurement
} from '@/services/db';
import TotalVisitsChart from './TotalVisitsChart';
import MaxWeightsSection from './MaxWeightsSection';
import RecentVisitsManager from './RecentVisitsManager';
import BottomNav from './BottomNav';

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'logs' | 'kpis' | 'records'>('home');

  // Data State
  const [visits, setVisits] = useState<Visit[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Measurement Modal State
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalMuscle, setModalMuscle] = useState('');
  const [modalFat, setModalFat] = useState('');
  const [savingMeasurement, setSavingMeasurement] = useState(false);

  // Initial Data Load
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribeVisits = subscribeToVisits(user.uid, (data) => {
      setVisits(data);
      setLoading(false);
    });

    const unsubscribeMeasurements = subscribeToBodyMeasurements(user.uid, (data) => {
      setBodyMeasurements(data);
    });

    return () => {
      unsubscribeVisits();
      unsubscribeMeasurements();
    };
  }, [user]);

  // --- Statistics Calculation ---
  const currentYear = new Date().getFullYear();
  const yearVisits = visits.filter(v => new Date(v.date).getFullYear() === selectedYear);
  const totalVisitsYear = yearVisits.length;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11
  const isCurrentYear = selectedYear === currentYear;

  // Monthly Stats (Selected Year)
  // If current year, show current month and last month
  // If past year, show December and November of that year
  const displayMonth1 = isCurrentYear ? currentMonth : 11; // December for past years
  const displayMonth2 = isCurrentYear ? (currentMonth === 0 ? 11 : currentMonth - 1) : 10; // November for past years

  const month1Visits = yearVisits.filter(v => new Date(v.date).getMonth() === displayMonth1).length;
  const month2Visits = yearVisits.filter(v => new Date(v.date).getMonth() === displayMonth2).length;

  const month1Name = new Date(selectedYear, displayMonth1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const month2Name = new Date(selectedYear, displayMonth2, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Attendance Percentage Calculation
  const startOfYear = new Date(selectedYear, 0, 1);
  const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);
  const now = new Date();

  // Days elapsed in the selected year (up to today if current year, or full year if past)
  const referenceDate = isCurrentYear ? now : endOfYear;
  const daysElapsed = Math.floor((referenceDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Total days in the year
  const totalDaysInYear = Math.floor((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Attendance percentage
  const attendancePercentage = daysElapsed > 0 ? ((totalVisitsYear / daysElapsed) * 100).toFixed(1) : '0.0';

  // Week Stats Logic (for Weekly Calendar)
  const today = new Date();
  const currentWeekDays: Date[] = [];
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    currentWeekDays.push(day);
  }

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDayStatus = (date: Date) => {
    // Check if date is strictly in the future (tomorrow onwards)
    const now = new Date();
    // Reset time for accurate date comparison
    const dateNoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayNoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateNoTime > todayNoTime) return 'future';

    const attended = visits.some(v => isSameDay(new Date(v.date), date));

    if (attended) return 'attended';
    return dateNoTime.getTime() === todayNoTime.getTime() ? 'today' : 'missed';
  };


  const handleAddMeasurement = async () => {
    if (!user || !modalMuscle || !modalFat) return;
    setSavingMeasurement(true);
    try {
      await addBodyMeasurement(
        user.uid,
        new Date(modalDate),
        parseFloat(modalMuscle),
        parseFloat(modalFat)
      );
      setShowMeasurementModal(false);
      setModalMuscle('');
      setModalFat('');
    } catch (error) {
      console.error("Error adding measurement:", error);
      alert("Error al guardar la medición");
    } finally {
      setSavingMeasurement(false);
    }
  };

  // Process measurements to add diffs
  const processedMeasurements = useMemo(() => {
    const sorted = [...bodyMeasurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sorted.map((current, index) => {
      const next = sorted[index + 1]; // next in text is previous in time
      let muscleDiff = null;
      let fatDiff = null;

      if (next) {
        muscleDiff = (current.muscle - next.muscle).toFixed(1);
        fatDiff = (current.fat - next.fat).toFixed(1);
      }

      return {
        ...current,
        muscleDiff,
        fatDiff
      };
    });
  }, [bodyMeasurements]);


  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-500 rounded-full mb-4"></div>
        <div className="text-slate-400 font-medium">Cargando GymCounter...</div>
      </div>
    </div>;
  }

  return (
    <div className="pb-24 max-w-lg mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ---------------- HOME TAB ---------------- */}
      {activeTab === 'home' && (
        <>
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💪</span>
                <h1 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                  GymCounter
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMeasurementModal(true)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
                >
                  {user?.displayName?.charAt(0) || 'G'}
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 space-y-6 animate-fade-in">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                ¡Hola, {user?.displayName?.split(' ')[0] || 'Atleta'}! 👋
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Hoy es un buen día para entrenar.
              </p>
            </section>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-5 text-white shadow-xl shadow-blue-900/20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-rounded text-sm bg-white/20 p-1 rounded">rocket_launch</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-90">Motivación diaria</span>
                </div>
                <p className="text-sm font-medium leading-relaxed italic opacity-90">
                  "¡No hay límites para quien se atreve a superarse!"
                </p>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                <span className="material-symbols-rounded text-[140px]">fitness_center</span>
              </div>
            </div>

            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-6xl font-black text-blue-600 tracking-tighter drop-shadow-sm">{totalVisitsYear}</span>
                  <span className="text-5xl animate-pulse filter drop-shadow-lg">🔥</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Total de visitas al gym ({currentYear})</p>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500">
                    <span className="material-symbols-rounded text-lg">calendar_month</span>
                  </div>
                  Asistencia de la semana
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <span className="material-symbols-rounded text-lg">history</span>
                  </button>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Lun - Dom</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {currentWeekDays.map((date, index) => {
                  const dayName = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'][index];
                  const status = getDayStatus(date);

                  let bgClass = "bg-slate-50 dark:bg-slate-800 text-slate-300";
                  let icon = "remove"; // horizontal_rule
                  let textColor = "text-slate-400";
                  let isClickable = false;

                  if (status === 'attended') {
                    bgClass = "bg-green-100 dark:bg-green-900/20 text-green-500 shadow-sm";
                    icon = "check";
                    textColor = "text-green-600 dark:text-green-400";
                  } else if (status === 'missed') {
                    bgClass = "bg-red-50 dark:bg-red-900/10 text-red-400";
                    icon = "close";
                    textColor = "text-red-400";
                  } else if (status === 'today') {
                    bgClass = "border-2 border-dashed border-blue-500 text-blue-500 animate-pulse cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20";
                    icon = "add";
                    textColor = "text-blue-500 font-bold";
                    isClickable = true;
                  }

                  return (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <span className={`text-[10px] font-bold ${textColor}`}>
                        {dayName}
                      </span>
                      <div
                        onClick={() => {
                          if (user && isClickable) {
                            // Add visit for today immediately
                            addVisit(user.uid, new Date());
                          } else if (status === 'missed') {
                            // If missed (past), maybe open logs tab or specific modal?
                            // For now, let's redirect to logs to be safe/consistent
                            setActiveTab('logs');
                          }
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${bgClass}`}
                      >
                        <span className="material-symbols-rounded text-lg font-bold">{icon}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Monthly Summary with Year Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Resumen mensual</h4>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm">
                  <button
                    onClick={() => setSelectedYear(prev => prev - 1)}
                    className="flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <span className="material-symbols-rounded text-lg">chevron_left</span>
                  </button>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 px-2 min-w-[60px] text-center">{selectedYear}</span>
                  <button
                    onClick={() => setSelectedYear(prev => prev + 1)}
                    disabled={selectedYear >= currentYear}
                    className="flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-rounded text-lg">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl font-black text-green-600 dark:text-green-400">{month1Visits}</span>
                    <span className="material-symbols-rounded text-green-500/40 text-2xl">event_available</span>
                  </div>
                  <p className="text-[11px] font-bold text-green-800 dark:text-green-300 uppercase tracking-tight mb-0.5">{isCurrentYear ? 'Este mes' : 'Diciembre'}</p>
                  <p className="text-[10px] text-green-600/70 dark:text-green-400/70 capitalize">{month1Name}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl font-black text-purple-600 dark:text-purple-400">{month2Visits}</span>
                    <span className="material-symbols-rounded text-purple-500/40 text-2xl">history</span>
                  </div>
                  <p className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-tight mb-0.5">{isCurrentYear ? 'Mes pasado' : 'Noviembre'}</p>
                  <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 capitalize">{month2Name}</p>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500">
                    <span className="material-symbols-rounded text-lg">bar_chart</span>
                  </div>
                  Estadísticas
                </h3>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                  <span className="material-symbols-rounded text-lg">refresh</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Porcentaje de asistencia</p>
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{attendancePercentage}%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Meta: 80%</p>

                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(attendancePercentage), 100)}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
                  {totalVisitsYear} visitas de {daysElapsed} días {isCurrentYear ? 'transcurridos' : 'del año'}
                </p>
              </div>
            </section>

            {/* Floating Action Button (FAB) */}
            {user && !visits.some(v => isSameDay(new Date(v.date), new Date())) && (
              <button
                onClick={() => addVisit(user.uid, new Date())}
                className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 animate-pulse"
                aria-label="Agregar visita de hoy"
              >
                <span className="material-symbols-rounded text-3xl font-bold">add</span>
              </button>
            )}
          </main>
        </>
      )}

      {/* ---------------- LOGS TAB (Recent Visits Debugger) ---------------- */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('home')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-rounded text-slate-500">arrow_back</span>
              </button>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white">Corregir Asistencias</h1>
            </div>
          </header>
          <div className="p-4">
            <RecentVisitsManager userId={user?.uid || ''} visits={visits} />
          </div>
        </div>
      )}

      {/* ---------------- KPIs TAB (Annual Comparison) ---------------- */}
      {activeTab === 'kpis' && (
        <div className="animate-fade-in px-6 pb-28 pt-6 space-y-6">
          <header>
            <h2 className="text-2xl font-extrabold text-primary dark:text-primary leading-tight">Comparativa Anual</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Análisis visual del rendimiento {selectedYear} vs {selectedYear - 1}</p>
          </header>

          {/* Volume Statistics Card with Integrated Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/50 overflow-hidden">
            <div className="p-6">
              {/* Header with Volume and Legend */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Volumen Acumulado</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{totalVisitsYear.toLocaleString()}</span>
                    {yearVisits.length > 0 && (
                      <span className="text-xs font-bold text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <span className="material-symbols-rounded text-sm mr-0.5">trending_up</span>
                        {attendancePercentage}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-primary">{selectedYear}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">{selectedYear - 1}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  </div>
                </div>
              </div>

              {/* Integrated Chart */}
              <TotalVisitsChart visits={visits} currentYear={selectedYear} />
            </div>
          </div>

          {/* Insight Card */}
          <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <span className="material-symbols-rounded text-white">auto_awesome</span>
            </div>
            <div className="pt-0.5">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">Visión de Progreso</h3>
              <p className="text-xs text-blue-700 dark:text-blue-300/80 leading-relaxed mt-1">
                Tu evolución muestra un crecimiento constante en tu compromiso con el entrenamiento.
              </p>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
                <span className="material-symbols-rounded text-indigo-500 text-lg">equalizer</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Promedio Mensual</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">{Math.round(totalVisitsYear / 12).toLocaleString()}</div>
              <div className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center">
                <span className="material-symbols-rounded text-[12px] mr-0.5">trending_up</span>
                {attendancePercentage}% vs objetivo
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
                <span className="material-symbols-rounded text-amber-500 text-lg">workspace_premium</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Mes Pico</span>
              <div className="text-xl font-black text-slate-900 dark:text-white uppercase">
                {month1Visits >= month2Visits ? (isCurrentYear ? 'Este mes' : 'DIC') : (isCurrentYear ? 'Mes pasado' : 'NOV')}
              </div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">{Math.max(month1Visits, month2Visits)}</span> visitas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- RECORDS TAB (Personal Records) ---------------- */}
      {activeTab === 'records' && (
        <div className="animate-fade-in">
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <h1 className="font-bold text-lg text-slate-900 dark:text-white">Récords Personales</h1>
          </header>

          <main className="px-6 pb-28 pt-6 space-y-6">
            {user && <MaxWeightsSection userId={user.uid} />}

            {/* Body Measurements Section */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-rounded text-orange-500">straighten</span>
                  Mediciones corporales
                </h3>
                <button
                  onClick={() => setShowMeasurementModal(true)}
                  className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  + Nuevo
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">% Músculo</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">% Grasa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {processedMeasurements.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">Sin mediciones registradas</td></tr>
                    ) : (
                      processedMeasurements.slice(0, 10).map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {new Date(m.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 text-xs text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{m.muscle}%</span>
                              {m.muscleDiff && (
                                <span className={`text-[10px] font-bold ${parseFloat(m.muscleDiff) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {parseFloat(m.muscleDiff) > 0 ? '+' : ''}{m.muscleDiff}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{m.fat}%</span>
                              {m.fatDiff && (
                                <span className={`text-[10px] font-bold ${parseFloat(m.fatDiff) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {parseFloat(m.fatDiff) > 0 ? '+' : ''}{m.fatDiff}%
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      )}

      {/* Measurement Modal (Bottom Sheet Style) */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
            onClick={() => setShowMeasurementModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl p-6 pointer-events-auto animate-[slide-up_0.3s_ease-out] relative">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nueva Medición</h3>
              <button onClick={() => setShowMeasurementModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Fecha</label>
                <input
                  type="date"
                  value={modalDate}
                  onChange={e => setModalDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">% Músculo</label>
                  <div className="flex items-end gap-1">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={modalMuscle}
                      onChange={e => setModalMuscle(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-2xl font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300"
                    />
                    <span className="text-slate-400 font-bold mb-1.5">%</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">% Grasa</label>
                  <div className="flex items-end gap-1">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={modalFat}
                      onChange={e => setModalFat(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-2xl font-bold text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300"
                    />
                    <span className="text-slate-400 font-bold mb-1.5">%</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddMeasurement}
              disabled={savingMeasurement}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl mt-8 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {savingMeasurement ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
