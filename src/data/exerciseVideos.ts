/**
 * Mapping de ejercicios a videos de YouTube
 *
 * Cada key es el ID del ejercicio (coincide con los usados en protocolEngine.ts)
 * El value es el ID del video de YouTube (o URL completa)
 *
 * Videos seleccionados de canales fitness confiables:
 * - AthleanX
 * - Jeff Nippard
 * - Omar Isuf
 * - Alan Thrall
 * - Squat University
 */

export interface ExerciseVideoData {
  videoId: string; // YouTube video ID
  duration?: string; // Duración aproximada (ej: "3:45")
  channel?: string; // Canal de YouTube
  title?: string; // Título del video (opcional)
}

export const EXERCISE_VIDEOS: Record<string, ExerciseVideoData> = {
  // LEVANTAMIENTOS PRINCIPALES
  'bench_press': {
    videoId: 'gRVjAtPip0Y',
    duration: '10:22',
    channel: 'AthleanX',
    title: 'How To Bench Press For A Bigger Chest (4 Steps)'
  },
  'squat': {
    videoId: 'ultWZbUMPL8',
    duration: '14:37',
    channel: 'Alan Thrall',
    title: 'How to Squat: Layne Norton\'s Squat Tutorial'
  },
  'deadlift': {
    videoId: 'op9kVnSso6Q',
    duration: '15:56',
    channel: 'Alan Thrall',
    title: 'How To Deadlift: Layne Norton\'s Deadlift Tutorial'
  },
  'ohp': {
    videoId: 'wol7Hko8RhY',
    duration: '9:37',
    channel: 'AthleanX',
    title: 'How To Build Boulder Shoulders (OVERHEAD PRESS!)'
  },
  'military_press': {
    videoId: 'wol7Hko8RhY',
    duration: '9:37',
    channel: 'AthleanX',
    title: 'How To Build Boulder Shoulders (OVERHEAD PRESS!)'
  },

  // PULL-UPS Y VARIACIONES
  'pullups': {
    videoId: 'eGo4IYlbE5g',
    duration: '7:45',
    channel: 'Calisthenicmovement',
    title: 'How to Do a Pull Up | Beginners Guide'
  },
  'pullups_st': {
    videoId: 'eGo4IYlbE5g',
    duration: '7:45',
    channel: 'Calisthenicmovement',
    title: 'How to Do a Pull Up | Beginners Guide'
  },
  'chinups': {
    videoId: 'brhRXlOhkAM',
    duration: '8:20',
    channel: 'Calisthenicmovement',
    title: 'Chin Ups Tutorial - How to Do It Correctly'
  },
  'lat_pulldowns': {
    videoId: 'CAwf7n6Luuc',
    duration: '6:15',
    channel: 'Jeff Nippard',
    title: 'How To: Lat Pulldown'
  },

  // PRESS DE BANCA VARIACIONES
  'incline_bench': {
    videoId: '11gY7Q5D5wo',
    duration: '8:30',
    channel: 'Jeff Nippard',
    title: 'How To: Incline Barbell Bench Press'
  },
  'close_grip_bench': {
    videoId: 'nEF0bv2FW94',
    duration: '6:45',
    channel: 'AthleanX',
    title: 'Close Grip Bench Press (CHEST or TRICEPS!?)'
  },
  'dumbbell_bench': {
    videoId: 'QsYre__-aro',
    duration: '7:12',
    channel: 'Jeff Nippard',
    title: 'How To: Dumbbell Bench Press'
  },

  // ACCESORIOS DE PECHO
  'dips': {
    videoId: '2z8JmcrW-As',
    duration: '9:15',
    channel: 'Calisthenicmovement',
    title: 'How to Do Perfect Dips - Beginner to Advanced'
  },
  'chest_dips': {
    videoId: '2z8JmcrW-As',
    duration: '9:15',
    channel: 'Calisthenicmovement',
    title: 'How to Do Perfect Dips - Beginner to Advanced'
  },
  'cable_flyes': {
    videoId: '0G2_XV7slIg',
    duration: '5:40',
    channel: 'Jeff Nippard',
    title: 'How To: Cable Chest Fly'
  },

  // SENTADILLAS VARIACIONES
  'front_squat': {
    videoId: 'wzqXpKQDTyM',
    duration: '12:30',
    channel: 'Alan Thrall',
    title: 'How to Front Squat'
  },
  'goblet_squat': {
    videoId: 'qaQPfi8f27E',
    duration: '6:50',
    channel: 'Squat University',
    title: 'The Goblet Squat'
  },
  'bulgarian_split_squat': {
    videoId: '2C-uNgKwPLE',
    duration: '8:25',
    channel: 'Jeff Nippard',
    title: 'How To: Bulgarian Split Squat'
  },

  // PESO MUERTO VARIACIONES
  'romanian_deadlift': {
    videoId: 'CQp5I9KgdXc',
    duration: '7:45',
    channel: 'Jeff Nippard',
    title: 'How To: Romanian Deadlift (RDL)'
  },
  'sumo_deadlift': {
    videoId: 'D_erhAjPkXg',
    duration: '9:10',
    channel: 'Omar Isuf',
    title: 'HOW TO SUMO DEADLIFT'
  },

  // ACCESORIOS DE ESPALDA
  'barbell_rows': {
    videoId: 'FWJR5Ve8bnQ',
    duration: '10:15',
    channel: 'Jeff Nippard',
    title: 'How To: Barbell Row'
  },
  'dumbbell_rows': {
    videoId: 'roCP6wCXPqo',
    duration: '6:30',
    channel: 'Jeff Nippard',
    title: 'How To: Dumbbell Row'
  },
  't_bar_rows': {
    videoId: 'j3Igk5J7ItE',
    duration: '7:00',
    channel: 'Jeff Nippard',
    title: 'How To: T-Bar Row'
  },
  'face_pulls': {
    videoId: 'rep-qVOkqgk',
    duration: '6:50',
    channel: 'AthleanX',
    title: 'Face Pulls - Stop Doing Them WRONG!'
  },

  // HOMBROS ACCESORIOS
  'lateral_raises': {
    videoId: '3VcKaXpzqRo',
    duration: '8:20',
    channel: 'Jeff Nippard',
    title: 'How To: Dumbbell Lateral Raise'
  },
  'front_raises': {
    videoId: 'OjYcxQJQPWs',
    duration: '5:45',
    channel: 'Jeff Nippard',
    title: 'How To: Front Raise'
  },
  'rear_delt_flyes': {
    videoId: 'ttvfGg9d76c',
    duration: '7:10',
    channel: 'Jeff Nippard',
    title: 'How To: Rear Delt Dumbbell Fly'
  },

  // BRAZOS - BÍCEPS
  'barbell_curls': {
    videoId: 'kwG2ipFRgfo',
    duration: '9:30',
    channel: 'AthleanX',
    title: 'How To Get Bigger Biceps (CURLS LIKE THIS!)'
  },
  'dumbbell_curls': {
    videoId: 'sAq_ocpRh_I',
    duration: '6:20',
    channel: 'Jeff Nippard',
    title: 'How To: Dumbbell Bicep Curl'
  },
  'hammer_curls': {
    videoId: 'TwD-YGVP4Bk',
    duration: '5:50',
    channel: 'Jeff Nippard',
    title: 'How To: Hammer Curl'
  },

  // BRAZOS - TRÍCEPS
  'tricep_extensions': {
    videoId: '6SS6K3lAwZ8',
    duration: '8:45',
    channel: 'AthleanX',
    title: 'Stop Doing Tricep Extensions Like This (5 MISTAKES!)'
  },
  'skull_crushers': {
    videoId: 'd_KZxkY_0cM',
    duration: '7:30',
    channel: 'Jeff Nippard',
    title: 'How To: Lying Triceps Extension (Skullcrusher)'
  },
  'tricep_pushdowns': {
    videoId: '2-LAMcpzODU',
    duration: '6:15',
    channel: 'Jeff Nippard',
    title: 'How To: Tricep Pushdown'
  },

  // PIERNAS - ACCESORIOS
  'leg_press': {
    videoId: 'IZxyjW7MPJQ',
    duration: '8:10',
    channel: 'Jeff Nippard',
    title: 'How To: Leg Press'
  },
  'leg_curls': {
    videoId: 'ELOCsoDSmrg',
    duration: '6:45',
    channel: 'Jeff Nippard',
    title: 'How To: Leg Curl'
  },
  'leg_extensions': {
    videoId: 'YyvSfVjQeL0',
    duration: '7:20',
    channel: 'Jeff Nippard',
    title: 'How To: Leg Extension'
  },
  'calf_raises': {
    videoId: 'gwLzBJYoWlI',
    duration: '6:00',
    channel: 'Jeff Nippard',
    title: 'How To: Standing Calf Raise'
  },

  // CORE
  'planks': {
    videoId: 'ASdvN_XEl_c',
    duration: '8:50',
    channel: 'Calisthenicmovement',
    title: 'How to Do a Perfect Plank - Tutorial & Benefits'
  },
  'ab_rollouts': {
    videoId: 'fJVlmHyO-Qg',
    duration: '6:30',
    channel: 'AthleanX',
    title: 'Ab Wheel Rollout - Best Ab Exercise?'
  },
  'hanging_leg_raises': {
    videoId: 'hdng3Nm1x_E',
    duration: '7:15',
    channel: 'Calisthenicmovement',
    title: 'Hanging Leg Raises Tutorial'
  },

  // CARDIO/CONDITIONING
  'burpees': {
    videoId: 'auBLPXO8Fww',
    duration: '5:20',
    channel: 'Fitness Blender',
    title: 'How to do a Burpee - Proper Form'
  },
  'box_jumps': {
    videoId: 'NBY9-kTuHEk',
    duration: '6:45',
    channel: 'Squat University',
    title: 'How to Box Jump Properly'
  },
  'battle_ropes': {
    videoId: '4JV5tPvOJ4E',
    duration: '8:10',
    channel: 'Funk Roberts',
    title: 'Battle Ropes Tutorial - 10 Exercises'
  },
};

// Alias map: protocol engine IDs → exerciseVideos keys
const EXERCISE_ID_ALIASES: Record<string, string> = {
  'bench': 'bench_press',
  'ohp_acc': 'ohp',
  'bb_row': 'barbell_rows',
  'rdl': 'romanian_deadlift',
  'inc_press': 'incline_bench',
  'pull_var': 'lat_pulldowns',
  'barbell_curl': 'barbell_curls',
  'triceps_pushdown': 'tricep_pushdowns',
  'front_sq': 'front_squat',
  'front_sq_light': 'front_squat',
  'dips_w': 'dips',
  'leg_raises': 'hanging_leg_raises',
  'pullups_vol': 'pullups',
  'bench_var': 'bench_press',
  'row_heavy': 'barbell_rows',
  'push_press': 'ohp',
  'ring_dips': 'dips',
  'split_sq': 'bulgarian_split_squat',
  'tempo_rdl': 'romanian_deadlift',
  'db_shoulder_press': 'military_press',
  'pushups_vol': 'dips', // closest match
  'chest_dips': 'dips',
};

function resolveExerciseId(exerciseId: string): string {
  return EXERCISE_ID_ALIASES[exerciseId] || exerciseId;
}

/**
 * Obtiene los datos del video para un ejercicio (resuelve aliases)
 */
export function getExerciseVideoData(exerciseId: string): ExerciseVideoData | null {
  const resolved = resolveExerciseId(exerciseId);
  return EXERCISE_VIDEOS[resolved] || null;
}

/**
 * Verifica si un ejercicio tiene video disponible
 */
export function hasVideo(exerciseId: string): boolean {
  return getExerciseVideoData(exerciseId) !== null;
}

/**
 * Obtiene la URL completa del video de YouTube
 */
export function getYouTubeUrl(exerciseId: string): string | null {
  const videoData = getExerciseVideoData(exerciseId);
  if (!videoData) return null;
  return `https://www.youtube.com/watch?v=${videoData.videoId}`;
}

/**
 * Obtiene la URL del embed de YouTube
 */
export function getYouTubeEmbedUrl(exerciseId: string): string | null {
  const videoData = getExerciseVideoData(exerciseId);
  if (!videoData) return null;
  return `https://www.youtube.com/embed/${videoData.videoId}`;
}

/**
 * Obtiene la URL del thumbnail del video
 */
export function getYouTubeThumbnail(exerciseId: string, quality: 'default' | 'hq' | 'maxres' = 'hq'): string | null {
  const videoData = getExerciseVideoData(exerciseId);
  if (!videoData) return null;

  const qualityMap = {
    'default': 'default',
    'hq': 'hqdefault',
    'maxres': 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoData.videoId}/${qualityMap[quality]}.jpg`;
}
