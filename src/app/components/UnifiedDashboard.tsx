'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  Visit,
  BodyMeasurement,
  MaxWeight,
  WorkoutLog,
  subscribeToVisits,
  addVisit,
  subscribeToBodyMeasurements,
  addBodyMeasurement,
  subscribeToMaxWeights,
  subscribeToWorkoutLogs,
} from '@/services/db';
import TotalVisitsChart from './TotalVisitsChart';
import MaxWeightsSection from './MaxWeightsSection';
import RecentVisitsManager from './RecentVisitsManager';
import RoutineTracker from './RoutineTracker';
import BottomNav from './BottomNav';
import { UserTrainingState, subscribeToUserTrainingState } from '@/services/db';
import { getCycleIndex, isDeload } from '@/services/protocolEngine';
import TrainingStreakCard from './charts/TrainingStreakCard';
import LiftProgressionChart from './charts/LiftProgressionChart';
import WeeklyVolumeChart from './charts/WeeklyVolumeChart';
import BodyCompositionChart from './charts/BodyCompositionChart';
import ProtocolSettings from './ProtocolSettings';
import ProtocolOverview from './ProtocolOverview';
import TabHeader from './TabHeader';
import { isSameDay } from '@/utils/date';

export default function UnifiedDashboard() {
  const { user, logout } = useAuth();


  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'routine' | 'logs' | 'kpis' | 'records' | 'settings'>('home');

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
  const [showProtocolOverview, setShowProtocolOverview] = useState(false);
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const [userTrainingState, setUserTrainingState] = useState<UserTrainingState | null>(null);
  const [maxWeights, setMaxWeights] = useState<MaxWeight[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

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

    const unsubscribeTraining = subscribeToUserTrainingState(user.uid, (data) => {
      setUserTrainingState(data);
    });

    const unsubscribeMaxWeights = subscribeToMaxWeights(user.uid, (data) => {
      setMaxWeights(data);
    });

    const unsubscribeWorkouts = subscribeToWorkoutLogs(user.uid, (data) => {
      setWorkoutLogs(data);
    });

    return () => {
      unsubscribeVisits();
      unsubscribeMeasurements();
      unsubscribeTraining();
      unsubscribeMaxWeights();
      unsubscribeWorkouts();
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
  const displayMonth1 = isCurrentYear ? currentMonth : 11;
  const displayMonth2 = isCurrentYear ? (currentMonth === 0 ? 11 : currentMonth - 1) : 10;

  const month1Visits = yearVisits.filter(v => new Date(v.date).getMonth() === displayMonth1).length;
  const month2Visits = yearVisits.filter(v => new Date(v.date).getMonth() === displayMonth2).length;

  const month1Name = new Date(selectedYear, displayMonth1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const month2Name = new Date(selectedYear, displayMonth2, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Attendance Percentage Calculation
  const startOfYear = new Date(selectedYear, 0, 1);
  const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);
  const now = new Date();

  const referenceDate = isCurrentYear ? now : endOfYear;
  const daysElapsed = Math.floor((referenceDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const attendancePercentage = daysElapsed > 0 ? ((totalVisitsYear / daysElapsed) * 100).toFixed(1) : '0.0';

  // Week Stats Logic
  const today = new Date();
  const currentWeekDays: Date[] = [];
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    currentWeekDays.push(day);
  }

  const getDayStatus = (date: Date) => {
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

  const processedMeasurements = useMemo(() => {
    const sorted = [...bodyMeasurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return sorted.map((current, index) => {
      const next = sorted[index + 1];
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
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-sm text-slate-500 dark:text-slate-500">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-lg mx-auto min-h-screen bg-white dark:bg-slate-950">

      {/* ---------------- HOME TAB ---------------- */}
      {activeTab === 'home' && (
        <>
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-lg">💪</span>
                </div>
                <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  GymCounter
                </h1>
              </div>
              <button
                onClick={() => setActiveTab('records')}
                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors overflow-hidden"
              >
                {user?.photoURL ? (
                  <Image src={user.photoURL} alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'
                )}
              </button>
            </div>
          </header>

          <main className="px-6 py-8 space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                ¡Hola, {user?.displayName?.split(' ')[0] || 'Atleta'}! 👋
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Hoy es un buen día para entrenar.
              </p>
            </div>

            {userTrainingState && (
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => setActiveTab('records')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-rounded">rocket_launch</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo Actual</p>
                      {isDeload(getCycleIndex(userTrainingState.currentDay)) && (
                        <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded uppercase">Deload</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      Día {userTrainingState.currentDay} • <span className="text-blue-500">Ciclo {getCycleIndex(userTrainingState.currentDay)}</span>
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <span className="material-symbols-rounded text-sm">chevron_right</span>
                </div>
              </section>
            )}

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">Motivación diaria</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300 italic">
                  &quot;No hay límites para quien se atreve a superarse.&quot;
                </p>
              </div>
              <div className="hidden">
              </div>
            </div>

            <section className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">{totalVisitsYear}</span>
                <p className="text-slate-500 dark:text-slate-500 text-sm">Visitas al gym en {currentYear}</p>
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
                  let icon = "remove";
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
                            addVisit(user.uid, new Date());
                          } else if (status === 'missed') {
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
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{month1Visits}</span>
                    <span className="material-symbols-rounded text-slate-300 dark:text-slate-700 text-xl">event_available</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">{isCurrentYear ? 'Este mes' : 'Diciembre'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 capitalize">{month1Name}</p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{month2Visits}</span>
                    <span className="material-symbols-rounded text-slate-300 dark:text-slate-700 text-xl">history</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">{isCurrentYear ? 'Mes pasado' : 'Noviembre'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 capitalize">{month2Name}</p>
                </div>
              </div>
            </div>

            <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500">
                    <span className="material-symbols-rounded text-lg">bar_chart</span>
                  </div>
                  Estadísticas
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Porcentaje de asistencia</p>
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{attendancePercentage}%</span>
                </div>
                <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(attendancePercentage), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
                  {totalVisitsYear} visitas de {daysElapsed} días {isCurrentYear ? 'transcurridos' : 'del año'}
                </p>
              </div>
            </section>
          </main>
        </>
      )}

      {/* ---------------- LOGS TAB ---------------- */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in flex-1 overflow-y-auto px-6 pt-8 pb-24">
          <TabHeader title="Asistencias" onBack={() => setActiveTab('home')} />
          <div className="space-y-6">
            <RecentVisitsManager userId={user?.uid || ''} visits={visits} />
          </div>
        </div>
      )}

      {/* ---------------- ROUTINE TAB ---------------- */}
      {activeTab === 'routine' && (
        <div className="animate-fade-in flex-1 overflow-y-auto px-6 pt-8 pb-28">
          <TabHeader title="Rutina" onBack={() => setActiveTab('home')} />
          <RoutineTracker userId={user?.uid || ''} />
        </div>
      )}

      {/* ---------------- KPIs TAB ---------------- */}
      {activeTab === 'kpis' && (
        <div className="animate-fade-in flex-1 overflow-y-auto px-6 pt-8 pb-28 space-y-6">
          <TabHeader title="Proyección" onBack={() => setActiveTab('home')} />

          <TrainingStreakCard visits={visits} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Asistencia Mensual</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{totalVisitsYear}</span>
                  <span className="text-sm font-bold text-slate-400">visitas en {selectedYear}</span>
                </div>
              </div>
            </div>
            <TotalVisitsChart visits={visits} currentYear={selectedYear} />
          </div>

          <LiftProgressionChart weights={maxWeights} />

          <WeeklyVolumeChart workouts={workoutLogs} />

          <BodyCompositionChart measurements={bodyMeasurements} />
        </div>
      )}

      {/* ---------------- RECORDS TAB ---------------- */}
      {activeTab === 'records' && (
        <div className="animate-fade-in flex-1 overflow-y-auto px-6 pt-8 pb-28 space-y-6">
          <TabHeader title="Registros" onBack={() => setActiveTab('home')} />
          {userTrainingState && (
            <section className="rounded-xl border-2 border-slate-900 dark:border-slate-200 bg-slate-900 dark:bg-slate-950 p-6 text-white relative overflow-hidden">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-lg uppercase tracking-wide border border-blue-500/20">
                        Military Protocol
                      </span>
                      {isDeload(getCycleIndex(userTrainingState.currentDay)) && (
                        <span className="text-xs font-medium bg-amber-600/20 text-amber-500 px-2.5 py-1 rounded-lg uppercase tracking-wide border border-amber-500/20">
                          Deload
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold leading-none flex items-baseline gap-2">
                      Día {userTrainingState.currentDay}
                      <span className="text-slate-600 text-lg font-medium">/ 180</span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Ciclo</p>
                    <p className="text-2xl font-bold text-blue-500">{getCycleIndex(userTrainingState.currentDay)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'bench', label: 'BNCH' },
                    { id: 'squat', label: 'SQUT' },
                    { id: 'deadlift', label: 'DEAD' },
                    { id: 'ohp', label: 'OHP' }
                  ].map(lift => (
                    <div key={lift.id} className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase mb-1">{lift.label}</p>
                      <p className="text-sm font-bold text-white">
                        {userTrainingState.liftState?.[lift.id as keyof typeof userTrainingState.liftState] || '-'}
                        <span className="text-[10px] text-slate-600 ml-0.5">kg</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {!userTrainingState.protocolCompleted ? (
                    <button
                      onClick={() => setActiveTab('routine')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-rounded">play_circle</span>
                      Entrenar hoy
                    </button>
                  ) : (
                    <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 font-semibold py-3 rounded-lg text-center flex items-center justify-center gap-2">
                      <span className="material-symbols-rounded">stars</span>
                      Protocolo completado
                    </div>
                  )}

                  <button
                    onClick={() => setShowProtocolOverview(true)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium py-3 rounded-lg border border-slate-700 text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-rounded text-sm">map</span>
                    Ver estructura del protocolo
                  </button>
                </div>
              </div>
            </section>
          )}

          {user && <MaxWeightsSection userId={user.uid} workoutLogs={workoutLogs} />}

          <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">Mediciones corporales</h3>
              <button onClick={() => setShowMeasurementModal(true)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold">
                + Nuevo
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center">% Músculo</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center">% Grasa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {processedMeasurements.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">Sin mediciones registrados</td></tr>
                  ) : (
                    processedMeasurements.slice(0, 10).map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {new Date(m.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-xs text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{m.muscle}%</span>
                            {m.muscleDiff && (
                              <span className={`text-[10px] font-bold ${parseFloat(m.muscleDiff) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {parseFloat(m.muscleDiff) >= 0 ? '+' : ''}{m.muscleDiff}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{m.fat}%</span>
                            {m.fatDiff && (
                              <span className={`text-[10px] font-bold ${parseFloat(m.fatDiff) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {parseFloat(m.fatDiff) >= 0 ? '+' : ''}{m.fatDiff}%
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
        </div>
      )}

      {/* ---------------- SETTINGS TAB ---------------- */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-28 space-y-6 animate-fade-in">
          <TabHeader title="Configuración" onBack={() => setActiveTab('home')} />
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 mb-6 font-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold border border-slate-700 uppercase text-white">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{user?.displayName || 'Usuario'}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
          <ProtocolSettings />
          <div className="text-center text-[10px] text-slate-600 font-mono mt-12 mb-4">
            GymCounter Military v1.0
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMeasurementModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl p-6 relative animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nueva Medición</h3>
              <button onClick={() => setShowMeasurementModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha de registro</label>
                <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">% Músculo</label>
                  <div className="flex items-baseline gap-1">
                    <input type="number" step="0.1" value={modalMuscle} onChange={e => setModalMuscle(e.target.value)} className="w-full bg-transparent border-none p-0 text-3xl font-black outline-none" placeholder="0.0" />
                    <span className="text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">% Grasa</label>
                  <div className="flex items-baseline gap-1">
                    <input type="number" step="0.1" value={modalFat} onChange={e => setModalFat(e.target.value)} className="w-full bg-transparent border-none p-0 text-3xl font-black outline-none" placeholder="0.0" />
                    <span className="text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleAddMeasurement} disabled={savingMeasurement} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl mt-8 shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all transform disabled:opacity-50">
              {savingMeasurement ? 'Cargando...' : 'GUARDAR MEDICIÓN'}
            </button>
          </div>
        </div>
      )}

      {showProtocolOverview && userTrainingState && (
        <ProtocolOverview
          currentDay={userTrainingState.currentDay}
          onClose={() => setShowProtocolOverview(false)}
        />
      )}

      {/* Floating Action Button (FAB) for Quick Visit */}
      {activeTab === 'home' && user && !visits.some(v => isSameDay(new Date(v.date), new Date())) && (
        <button
          onClick={() => addVisit(user.uid, new Date())}
          className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 animate-bounce transition-all hover:bg-blue-500"
        >
          <span className="material-symbols-rounded text-4xl font-black">add</span>
        </button>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
