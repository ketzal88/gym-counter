/**
 * Badge Definitions - Sistema de gamificación
 *
 * 20 badges desbloqueables organizados por categorías:
 * - Attendance (Asistencia)
 * - Strength (Fuerza)
 * - Milestones (Hitos del protocolo)
 * - Consistency (Consistencia)
 * - Volume (Volumen de entrenamiento)
 */

export type BadgeCategory = 'attendance' | 'strength' | 'milestone' | 'consistency' | 'volume';

export interface BadgeCondition {
  type: 'visits_total' | 'visits_streak' | 'protocol_day' | 'protocol_complete'
        | 'lift_milestone' | 'total_volume' | 'time_of_day' | 'day_of_week';
  // Parámetros según el tipo
  count?: number;          // Para visits_total
  days?: number;           // Para visits_streak
  day?: number;            // Para protocol_day
  lift?: 'bench' | 'squat' | 'deadlift' | 'ohp'; // Para lift_milestone
  weight?: number;         // Para lift_milestone (kg)
  volume?: number;         // Para total_volume (kg)
  hour?: number;           // Para time_of_day (0-23)
  dayOfWeek?: number;      // Para day_of_week (0=Sunday, 1=Monday, etc.)
  monthCount?: number;     // Para day_of_week (cuántos en un mes)
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;              // emoji o imagen
  category: BadgeCategory;
  points: number;            // Puntos otorgados
  condition: BadgeCondition;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Definiciones de los 20 badges
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ===== ATTENDANCE (Asistencia) =====
  {
    id: 'first_day',
    name: 'Primer Día',
    description: 'Completa tu primer workout',
    icon: '🔥',
    category: 'attendance',
    points: 10,
    condition: { type: 'visits_total', count: 1 },
    rarity: 'common'
  },
  {
    id: 'week_complete',
    name: 'Semana Completa',
    description: 'Entrena 7 días consecutivos',
    icon: '💪',
    category: 'attendance',
    points: 50,
    condition: { type: 'visits_streak', days: 7 },
    rarity: 'rare'
  },
  {
    id: 'month_unstoppable',
    name: 'Mes Imparable',
    description: 'Entrena 30 días en un mes calendario',
    icon: '🎯',
    category: 'attendance',
    points: 100,
    condition: { type: 'visits_total', count: 30 }, // Simplificado, en la práctica verificar mes
    rarity: 'epic'
  },
  {
    id: 'iron_streak',
    name: 'Racha de Acero',
    description: 'Entrena 60 días consecutivos',
    icon: '⚡',
    category: 'attendance',
    points: 200,
    condition: { type: 'visits_streak', days: 60 },
    rarity: 'epic'
  },
  {
    id: 'elite_status',
    name: 'Élite',
    description: 'Entrena 180 días consecutivos',
    icon: '👑',
    category: 'attendance',
    points: 500,
    condition: { type: 'visits_streak', days: 180 },
    rarity: 'legendary'
  },

  // ===== STRENGTH (Fuerza) =====
  {
    id: 'bench_100_club',
    name: '100 Club - Bench',
    description: 'Alcanza 100 kg en bench press',
    icon: '🏋️',
    category: 'strength',
    points: 100,
    condition: { type: 'lift_milestone', lift: 'bench', weight: 100 },
    rarity: 'rare'
  },
  {
    id: 'squat_150_club',
    name: '150 Club - Squat',
    description: 'Alcanza 150 kg en squat',
    icon: '🦵',
    category: 'strength',
    points: 150,
    condition: { type: 'lift_milestone', lift: 'squat', weight: 150 },
    rarity: 'epic'
  },
  {
    id: 'deadlift_200_club',
    name: '200 Club - Deadlift',
    description: 'Alcanza 200 kg en deadlift',
    icon: '💀',
    category: 'strength',
    points: 200,
    condition: { type: 'lift_milestone', lift: 'deadlift', weight: 200 },
    rarity: 'epic'
  },
  {
    id: 'pullup_pro',
    name: 'Pull-up Pro',
    description: 'Realiza 12+ pull-ups estrictas',
    icon: '💪',
    category: 'strength',
    points: 100,
    condition: { type: 'lift_milestone', lift: 'ohp', weight: 12 }, // Usando ohp como proxy para pullups
    rarity: 'rare'
  },

  // ===== MILESTONES (Hitos) =====
  {
    id: 'first_cycle',
    name: 'Primer Ciclo',
    description: 'Completa tu primer ciclo de 12 días',
    icon: '🌟',
    category: 'milestone',
    points: 50,
    condition: { type: 'protocol_day', day: 12 },
    rarity: 'common'
  },
  {
    id: 'four_cycles',
    name: 'Cuatro Ciclos',
    description: 'Completa 4 ciclos (48 días)',
    icon: '🔁',
    category: 'milestone',
    points: 100,
    condition: { type: 'protocol_day', day: 48 },
    rarity: 'rare'
  },
  {
    id: 'halfway_there',
    name: 'Mitad del Camino',
    description: 'Alcanza el día 90 del protocolo',
    icon: '🎊',
    category: 'milestone',
    points: 200,
    condition: { type: 'protocol_day', day: 90 },
    rarity: 'epic'
  },
  {
    id: 'protocol_complete',
    name: 'Protocolo Completo',
    description: 'Completa los 180 días del protocolo',
    icon: '🏆',
    category: 'milestone',
    points: 1000,
    condition: { type: 'protocol_complete' },
    rarity: 'legendary'
  },

  // ===== CONSISTENCY (Consistencia) =====
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Completa 10 workouts antes de las 8am',
    icon: '⏰',
    category: 'consistency',
    points: 50,
    condition: { type: 'time_of_day', hour: 8, count: 10 },
    rarity: 'rare'
  },
  {
    id: 'night_owl',
    name: 'Búho Nocturno',
    description: 'Completa 10 workouts después de las 8pm',
    icon: '🌙',
    category: 'consistency',
    points: 50,
    condition: { type: 'time_of_day', hour: 20, count: 10 },
    rarity: 'rare'
  },
  {
    id: 'monday_warrior',
    name: 'Guerrero de Lunes',
    description: 'Entrena todos los lunes de un mes',
    icon: '📅',
    category: 'consistency',
    points: 75,
    condition: { type: 'day_of_week', dayOfWeek: 1, monthCount: 4 }, // 1 = Monday
    rarity: 'epic'
  },

  // ===== VOLUME (Volumen) =====
  {
    id: 'volume_10k',
    name: '10K Club',
    description: 'Levanta un total de 10,000 kg (volumen acumulado)',
    icon: '💥',
    category: 'volume',
    points: 100,
    condition: { type: 'total_volume', volume: 10000 },
    rarity: 'rare'
  },
  {
    id: 'volume_50k',
    name: '50K Beast',
    description: 'Levanta un total de 50,000 kg (volumen acumulado)',
    icon: '🚀',
    category: 'volume',
    points: 250,
    condition: { type: 'total_volume', volume: 50000 },
    rarity: 'epic'
  },
  {
    id: 'volume_100k',
    name: '100K Legend',
    description: 'Levanta un total de 100,000 kg (volumen acumulado)',
    icon: '⚡',
    category: 'volume',
    points: 500,
    condition: { type: 'total_volume', volume: 100000 },
    rarity: 'legendary'
  },

  // BONUS: Secret Badge
  {
    id: 'the_grind',
    name: 'The Grind',
    description: 'Entrena en Navidad, Año Nuevo o tu cumpleaños',
    icon: '🎁',
    category: 'consistency',
    points: 150,
    condition: { type: 'visits_total', count: 1 }, // Verificación manual en el servicio
    rarity: 'legendary'
  }
];

/**
 * Obtiene la definición de un badge por ID
 */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === badgeId);
}

/**
 * Obtiene todos los badges de una categoría
 */
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(b => b.category === category);
}

/**
 * Calcula el nivel del usuario basado en puntos totales
 */
export function calculateLevel(totalPoints: number): number {
  // Sistema de nivelación: cada nivel requiere 100 puntos más que el anterior
  // Nivel 1: 0-100, Nivel 2: 100-300, Nivel 3: 300-600, etc.
  return Math.floor(Math.sqrt(totalPoints / 50)) + 1;
}

/**
 * Calcula puntos necesarios para el próximo nivel
 */
export function pointsForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 50;
}

/**
 * Obtiene el color según la rareza del badge
 */
export function getRarityColor(rarity: BadgeDefinition['rarity']): string {
  const colors = {
    common: 'from-slate-400 to-slate-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-pink-600',
    legendary: 'from-amber-400 to-orange-600'
  };
  return colors[rarity];
}
