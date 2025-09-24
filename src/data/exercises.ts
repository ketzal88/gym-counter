// Lista de ejercicios comunes para tracking de RMs
export const EXERCISE_CATEGORIES = {
  COMPOUND: 'Compound',
  ISOLATION: 'Isolation',
  CARDIO: 'Cardio',
  FUNCTIONAL: 'Functional'
} as const;

export const EXERCISES = [
  // Compound exercises
  { name: 'Sentadilla', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Peso muerto', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Press de banca', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Press militar', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Remo con barra', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Dominadas', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Fondos en paralelas', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Peso muerto rumano', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Zancadas', category: EXERCISE_CATEGORIES.COMPOUND },
  { name: 'Hip thrust', category: EXERCISE_CATEGORIES.COMPOUND },
  
  // Upper body isolation
  { name: 'Curl de bíceps', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Tríceps en polea', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Elevaciones laterales', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Elevaciones frontales', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Remo al mentón', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Pájaros', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Press francés', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Martillo', category: EXERCISE_CATEGORIES.ISOLATION },
  
  // Lower body isolation
  { name: 'Extensiones de cuádriceps', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Curl femoral', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Elevaciones de pantorrillas', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Abductores', category: EXERCISE_CATEGORIES.ISOLATION },
  { name: 'Aductores', category: EXERCISE_CATEGORIES.ISOLATION },
  
  // Core
  { name: 'Plancha', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  { name: 'Russian twists', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  { name: 'Mountain climbers', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  { name: 'Burpees', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  
  // Functional
  { name: 'Thruster', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  { name: 'Clean & Jerk', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  { name: 'Snatch', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  { name: 'Kettlebell swing', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  { name: 'Turkish get-up', category: EXERCISE_CATEGORIES.FUNCTIONAL },
  
  // Cardio
  { name: 'Running (5K)', category: EXERCISE_CATEGORIES.CARDIO },
  { name: 'Running (10K)', category: EXERCISE_CATEGORIES.CARDIO },
  { name: 'Bicicleta (30 min)', category: EXERCISE_CATEGORIES.CARDIO },
  { name: 'Remo ergómetro (2000m)', category: EXERCISE_CATEGORIES.CARDIO },
] as const;

export type ExerciseName = typeof EXERCISES[number]['name'];
export type ExerciseCategory = typeof EXERCISE_CATEGORIES[keyof typeof EXERCISE_CATEGORIES];

// Función para obtener ejercicios por categoría
export function getExercisesByCategory(category: ExerciseCategory) {
  return EXERCISES.filter(exercise => exercise.category === category);
}

// Función para buscar ejercicios
export function searchExercises(query: string) {
  const lowercaseQuery = query.toLowerCase();
  return EXERCISES.filter(exercise => 
    exercise.name.toLowerCase().includes(lowercaseQuery)
  );
}
