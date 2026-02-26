import { db } from './db';
import { collection, doc, getDoc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { BADGE_DEFINITIONS, BadgeDefinition, calculateLevel } from '@/data/badgeDefinitions';

export interface Badge {
  id: string;
  unlockedAt: Date;
  seen: boolean; // Para mostrar notificación de nuevo badge
}

export interface UserBadges {
  userId: string;
  badges: Badge[];
  totalPoints: number;
  level: number;
  lastBadgeUnlocked?: Date;
}

/**
 * Obtiene los badges del usuario
 */
export async function getUserBadges(userId: string): Promise<UserBadges> {
  try {
    const badgesDoc = await getDoc(doc(db, 'userBadges', userId));

    if (!badgesDoc.exists()) {
      // Crear documento inicial si no existe
      const initialBadges: UserBadges = {
        userId,
        badges: [],
        totalPoints: 0,
        level: 1,
      };
      await setDoc(doc(db, 'userBadges', userId), initialBadges);
      return initialBadges;
    }

    const data = badgesDoc.data() as UserBadges;
    // Convert Firestore Timestamps to Date
    if (data.lastBadgeUnlocked && typeof data.lastBadgeUnlocked === 'object') {
      data.lastBadgeUnlocked = (data.lastBadgeUnlocked as unknown as { toDate(): Date }).toDate();
    }
    data.badges = data.badges.map(b => ({
      ...b,
      unlockedAt: typeof (b.unlockedAt as unknown as { toDate?: () => Date }).toDate === 'function' ? (b.unlockedAt as unknown as { toDate(): Date }).toDate() : b.unlockedAt
    }));

    return data;
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return {
      userId,
      badges: [],
      totalPoints: 0,
      level: 1,
    };
  }
}

/**
 * Obtiene estadísticas del usuario para evaluación de badges
 */
async function getUserStats(userId: string) {
  try {
    // Obtener training state
    const trainingStateDoc = await getDoc(doc(db, 'userTrainingState', userId));
    const trainingState = trainingStateDoc.data();

    // Obtener todos los workouts
    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const workoutsSnapshot = await getDocs(workoutsQuery);
    const workouts = workoutsSnapshot.docs.map(d => d.data());

    // Calcular volumen total
    let totalVolume = 0;
    workouts.forEach(workout => {
      workout.exercises?.forEach((ex: { sets?: { weight: string; reps: string }[] }) => {
        ex.sets?.forEach((set: { weight: string; reps: string }) => {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseFloat(set.reps) || 0;
          totalVolume += weight * reps;
        });
      });
    });

    // Calcular racha actual (días consecutivos con workout)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedWorkouts = [...workouts].sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    const checkDate = new Date(today);
    for (const workout of sortedWorkouts) {
      const workoutDate = workout.timestamp?.toDate ? workout.timestamp.toDate() : new Date(workout.timestamp);
      workoutDate.setHours(0, 0, 0, 0);

      if (workoutDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (workoutDate.getTime() < checkDate.getTime()) {
        break;
      }
    }

    // Contar workouts por hora
    const workoutsByHour: Record<number, number> = {};
    workouts.forEach(workout => {
      const date = workout.timestamp?.toDate ? workout.timestamp.toDate() : new Date(workout.timestamp);
      const hour = date.getHours();
      workoutsByHour[hour] = (workoutsByHour[hour] || 0) + 1;
    });

    // Contar workouts por día de la semana en el mes actual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const workoutsByDayOfWeek: Record<number, number> = {};

    workouts.forEach(workout => {
      const date = workout.timestamp?.toDate ? workout.timestamp.toDate() : new Date(workout.timestamp);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const dayOfWeek = date.getDay();
        workoutsByDayOfWeek[dayOfWeek] = (workoutsByDayOfWeek[dayOfWeek] || 0) + 1;
      }
    });

    return {
      totalWorkouts: workouts.length,
      currentStreak,
      currentDay: trainingState?.currentDay || 1,
      protocolCompleted: trainingState?.protocolCompleted || false,
      liftState: trainingState?.liftState || { bench: 0, squat: 0, deadlift: 0, ohp: 0, pullupsLevel: 0 },
      totalVolume,
      workoutsByHour,
      workoutsByDayOfWeek,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalWorkouts: 0,
      currentStreak: 0,
      currentDay: 1,
      protocolCompleted: false,
      liftState: { bench: 0, squat: 0, deadlift: 0, ohp: 0, pullupsLevel: 0 },
      totalVolume: 0,
      workoutsByHour: {},
      workoutsByDayOfWeek: {},
    };
  }
}

/**
 * Evalúa una condición de badge
 */
interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  currentDay: number;
  protocolCompleted: boolean;
  liftState: Record<string, number>;
  totalVolume: number;
  workoutsByHour: Record<number, number>;
  workoutsByDayOfWeek: Record<number, number>;
}

function evaluateCondition(condition: BadgeDefinition['condition'], stats: UserStats): boolean {
  switch (condition.type) {
    case 'visits_total':
      return stats.totalWorkouts >= (condition.count || 0);

    case 'visits_streak':
      return stats.currentStreak >= (condition.days || 0);

    case 'protocol_day':
      return stats.currentDay >= (condition.day || 0);

    case 'protocol_complete':
      return stats.protocolCompleted;

    case 'lift_milestone':
      if (!condition.lift || !condition.weight) return false;
      const liftValue = stats.liftState[condition.lift];
      return liftValue >= condition.weight;

    case 'total_volume':
      return stats.totalVolume >= (condition.volume || 0);

    case 'time_of_day':
      if (condition.hour === undefined || condition.count === undefined) return false;
      const workoutsAtHour = stats.workoutsByHour[condition.hour] || 0;
      return workoutsAtHour >= condition.count;

    case 'day_of_week':
      if (condition.dayOfWeek === undefined || condition.monthCount === undefined) return false;
      const workoutsOnDay = stats.workoutsByDayOfWeek[condition.dayOfWeek] || 0;
      return workoutsOnDay >= condition.monthCount;

    default:
      return false;
  }
}

/**
 * Evalúa todos los badges y desbloquea los que cumplan condiciones
 * Retorna los badges recién desbloqueados
 */
export async function evaluateBadges(userId: string): Promise<Badge[]> {
  try {
    const userBadges = await getUserBadges(userId);
    const stats = await getUserStats(userId);

    const newBadges: Badge[] = [];

    for (const badgeDef of BADGE_DEFINITIONS) {
      // Skip si ya desbloqueado
      if (userBadges.badges.some(b => b.id === badgeDef.id)) {
        continue;
      }

      // Evaluar condición
      if (evaluateCondition(badgeDef.condition, stats)) {
        newBadges.push({
          id: badgeDef.id,
          unlockedAt: new Date(),
          seen: false,
        });
      }
    }

    // Si hay nuevos badges, guardarlos
    if (newBadges.length > 0) {
      const updatedBadges = [...userBadges.badges, ...newBadges];
      const newTotalPoints = updatedBadges.reduce((sum, badge) => {
        const def = BADGE_DEFINITIONS.find(b => b.id === badge.id);
        return sum + (def?.points || 0);
      }, 0);
      const newLevel = calculateLevel(newTotalPoints);

      await setDoc(doc(db, 'userBadges', userId), {
        userId,
        badges: updatedBadges,
        totalPoints: newTotalPoints,
        level: newLevel,
        lastBadgeUnlocked: new Date(),
      });
    }

    return newBadges;
  } catch (error) {
    console.error('Error evaluating badges:', error);
    return [];
  }
}

/**
 * Marca un badge como visto
 */
export async function markBadgeAsSeen(userId: string, badgeId: string): Promise<void> {
  try {
    const userBadges = await getUserBadges(userId);
    const updatedBadges = userBadges.badges.map(b =>
      b.id === badgeId ? { ...b, seen: true } : b
    );

    await setDoc(doc(db, 'userBadges', userId), {
      ...userBadges,
      badges: updatedBadges,
    });
  } catch (error) {
    console.error('Error marking badge as seen:', error);
  }
}

/**
 * Obtiene badges no vistos
 */
export function getUnseenBadges(userBadges: UserBadges): Badge[] {
  return userBadges.badges.filter(b => !b.seen);
}
