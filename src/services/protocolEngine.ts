import { UserTrainingState } from './db';

// Using types from db, keeping LiftState slightly flexible or importing it if needed.
// But we can just use UserTrainingState['liftState']
export type LiftState = UserTrainingState['liftState'];

export interface ProtocolExercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight?: number; // Calculated weight for main lifts
    suggestedWeight?: number; // From history
    suggestedReps?: string; // From history
    blockType: 'warmup' | 'strength' | 'conditioning';
    exerciseType?: 'barbell' | 'dumbbell' | 'bodyweight' | 'bodyweight_weighted';
    conditioningMetadata?: {
        format: 'EMOM' | 'AMRAP' | 'For Time' | 'Rounds' | 'Tabata' | 'Other';
        duration: string;
        instructions: string;
    };
    videoUrl?: string; // YouTube video ID or full URL
    videoDuration?: string; // Duration like "2:34"
}

export interface ProtocolWorkout {
    dayNumber: number;
    dayType: string;
    cycleIndex: number;
    isDeload: boolean;
    mainLift?: keyof LiftState;
    exercises: ProtocolExercise[];
    note?: string;
    unlockResult?: Partial<LiftState>;
    locationChoice?: boolean; // greek_god: este día ofrece elección gimnasio/casa
    extraLocation?: 'gym' | 'home';
    phase?: 1 | 2 | 3; // postpartum: fase de progresión activa para este día
}

export const WARMUP = [
    { name: 'Jumping Jacks', reps: '20' },
    { name: 'Sentadillas Profundas', reps: '10' },
    { name: 'Estocadas con Rotación', reps: '10' },
    { name: 'Scap Pull Ups', reps: '10' },
    { name: 'Push Ups', reps: '15' }
];

export const TEMPLATES: Record<number, {
    type: string,
    mainLift?: keyof LiftState,
    accessories: {
        id: string,
        name: string,
        sets: number,
        reps: string,
        exerciseType?: ProtocolExercise['exerciseType'],
        blockType?: ProtocolExercise['blockType'],
        conditioning?: ProtocolExercise['conditioningMetadata']
    }[]
}> = {
    1: {
        type: "Upper Strength (Bench)",
        mainLift: "bench",
        accessories: [
            { id: "pullups_st", name: "Pull Ups (Strict)", sets: 4, reps: "8", exerciseType: "bodyweight", blockType: "strength" },
            { id: "ohp_acc", name: "Overhead Press", sets: 3, reps: "8", exerciseType: "barbell", blockType: "strength" },
            { id: "bb_row", name: "Barbell Row", sets: 3, reps: "8", exerciseType: "barbell", blockType: "strength" },
            {
                id: "finisher_emom", name: "Finisher: EMOM 8", sets: 1, reps: "8 min", blockType: "conditioning", conditioning: {
                    format: "EMOM",
                    duration: "8 min",
                    instructions: "Minuto par: 8 Burpees\nMinuto impar: 10 Toes to Bar / Leg Raises"
                }
            }
        ]
    },
    2: {
        type: "Lower Strength (Squat)",
        mainLift: "squat",
        accessories: [
            { id: "rdl", name: "Romanian Deadlift", sets: 3, reps: "8", exerciseType: "barbell", blockType: "strength" },
            { id: "lunges", name: "Lunges / Step-ups", sets: 3, reps: "10/leg", exerciseType: "dumbbell", blockType: "strength" },
            { id: "core_carry", name: "Core / Farmers Carry", sets: 3, reps: "8-10 min", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    3: {
        type: "Short Metcon (15 min)",
        accessories: [
            {
                id: "metcon_15", name: "AMRAP 15", sets: 1, reps: "15 min", blockType: "conditioning", conditioning: {
                    format: "AMRAP",
                    duration: "15 min",
                    instructions: "400m Run / 1000m Row\n20 Kettlebell Swings\n15 Wall Balls / Goblet Squats"
                }
            }
        ]
    },
    4: {
        type: "Upper Volume",
        accessories: [
            { id: "inc_press", name: "Incline Press", sets: 4, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "pull_var", name: "Pull Variation (Lat Pulldowns)", sets: 4, reps: "8", exerciseType: "barbell", blockType: "strength" },
            { id: "db_shoulder_press", name: "Dumbbell Shoulder Press", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "lateral_raises", name: "Lateral Raises", sets: 3, reps: "15", exerciseType: "dumbbell", blockType: "strength" },
            { id: "barbell_curl", name: "Barbell Curl", sets: 3, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "triceps_pushdown", name: "Triceps Rope Pushdown", sets: 3, reps: "12", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    5: {
        type: "Olympic Technique",
        accessories: [
            { id: "oly_tech", name: "Clean/Snatch Tech", sets: 1, reps: "10 min", exerciseType: "barbell", blockType: "strength" },
            { id: "oly_light", name: "Hang Clean / Snatch", sets: 5, reps: "3", exerciseType: "barbell", blockType: "strength" },
            { id: "front_sq_light", name: "Front Squat", sets: 3, reps: "5", exerciseType: "barbell", blockType: "strength" },
            {
                id: "cond_int", name: "Intervalos Cortos", sets: 1, reps: "10 min", blockType: "conditioning", conditioning: {
                    format: "Other",
                    duration: "10 min",
                    instructions: "Sprints 30s ON / 30s OFF"
                }
            }
        ]
    },
    6: {
        type: "Lower Power (Deadlift)",
        mainLift: "deadlift",
        accessories: [
            { id: "box_jumps", name: "Box Jumps", sets: 5, reps: "5", exerciseType: "bodyweight", blockType: "strength" },
            { id: "split_sq", name: "Split Squat", sets: 3, reps: "8", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    7: {
        type: "Strict Calisthenics",
        accessories: [
            { id: "pushups_vol", name: "Push Ups", sets: 4, reps: "AMRAP-2", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pullups_vol", name: "Pull Ups", sets: 4, reps: "AMRAP-2", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pike_pushups", name: "Pike Pushups", sets: 3, reps: "8-10", exerciseType: "bodyweight", blockType: "strength" },
            { id: "leg_raises", name: "Hanging Leg Raises", sets: 3, reps: "10-12", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    8: {
        type: "Long WOD",
        accessories: [
            {
                id: "chipper", name: "For Time (Chipper)", sets: 1, reps: "1", blockType: "conditioning", conditioning: {
                    format: "For Time",
                    duration: "Variando",
                    instructions: "1km Run\n50 Air Squats\n40 Situps\n30 Pushups\n20 Pullups\n10 Burpees"
                }
            }
        ]
    },
    9: {
        type: "Upper Strength Variation",
        accessories: [
            { id: "bench_var", name: "Paused Bench", sets: 4, reps: "6", exerciseType: "barbell", blockType: "strength" },
            { id: "row_heavy", name: "Heavy Row", sets: 4, reps: "6", exerciseType: "barbell", blockType: "strength" },
            { id: "push_press", name: "Push Press", sets: 4, reps: "5", exerciseType: "barbell", blockType: "strength" },
            { id: "dips_w", name: "Dips", sets: 3, reps: "AMRAP", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    10: {
        type: "Lower Variation",
        accessories: [
            { id: "front_sq", name: "Front Squat", sets: 4, reps: "6", exerciseType: "barbell", blockType: "strength" },
            { id: "tempo_rdl", name: "Tempo RDL", sets: 3, reps: "8", exerciseType: "barbell", blockType: "strength" },
            { id: "single_leg", name: "Single Leg Work", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    11: {
        type: "Gymnastics + Core",
        accessories: [
            { id: "ttb", name: "Toes to Bar / Leg Raises", sets: 4, reps: "8-12", exerciseType: "bodyweight", blockType: "strength" },
            { id: "ring_dips", name: "Ring Dips / Dips", sets: 3, reps: "6-10", exerciseType: "bodyweight", blockType: "strength" },
            { id: "hs_hold", name: "Handstand Hold", sets: 3, reps: "30s", exerciseType: "bodyweight", blockType: "strength" },
            { id: "core_circuit", name: "Core Circuit", sets: 3, reps: "1 round", blockType: "strength", exerciseType: "bodyweight" }
        ]
    },
    12: {
        type: "Benchmark / Test",
        accessories: [
            { id: "max_pushups", name: "Max Push Ups in 2 min", sets: 1, reps: "Max", exerciseType: "bodyweight", blockType: "strength" },
            { id: "max_pullups", name: "Max Pull Ups", sets: 1, reps: "Max", exerciseType: "bodyweight", blockType: "strength" },
            {
                id: "cardio_test", name: "2km Time Trial", sets: 1, reps: "Time", blockType: "conditioning", conditioning: {
                    format: "For Time",
                    duration: "Max Effort",
                    instructions: "Remo, Bici o Correr 2km lo más rápido posible."
                }
            }
        ]
    }
};

// ============================================================
// TEMPLATES: TONIFICAR ABDOMEN (ciclo de 6 días)
// ============================================================
export const TEMPLATES_TONED_ABS: Record<number, {
    type: string,
    mainLift?: keyof LiftState,
    accessories: {
        id: string,
        name: string,
        sets: number,
        reps: string,
        exerciseType?: ProtocolExercise['exerciseType'],
        blockType?: ProtocolExercise['blockType'],
        conditioning?: ProtocolExercise['conditioningMetadata']
    }[]
}> = {
    1: {
        type: "Core Strength",
        accessories: [
            { id: "weighted_crunch", name: "Crunch con Peso", sets: 4, reps: "15", exerciseType: "dumbbell", blockType: "strength" },
            { id: "russian_twist", name: "Russian Twist", sets: 3, reps: "20", exerciseType: "dumbbell", blockType: "strength" },
            { id: "hanging_leg_raise", name: "Hanging Leg Raises", sets: 4, reps: "12", exerciseType: "bodyweight", blockType: "strength" },
            { id: "cable_woodchop", name: "Cable Woodchops", sets: 3, reps: "12/lado", exerciseType: "dumbbell", blockType: "strength" },
            { id: "plank_hold", name: "Plancha", sets: 3, reps: "45s", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    2: {
        type: "Lower + Core",
        mainLift: "squat",
        accessories: [
            { id: "rdl_abs", name: "Romanian Deadlift", sets: 3, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "hip_thrust_abs", name: "Hip Thrust", sets: 3, reps: "12", exerciseType: "barbell", blockType: "strength" },
            { id: "ab_wheel", name: "Ab Wheel Rollout", sets: 3, reps: "10", exerciseType: "bodyweight", blockType: "strength" },
            { id: "dead_bug", name: "Dead Bug", sets: 3, reps: "12/lado", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    3: {
        type: "HIIT Cardio + Abs",
        accessories: [
            {
                id: "tabata_abs", name: "Tabata Core", sets: 1, reps: "20 min", blockType: "conditioning", conditioning: {
                    format: "Tabata",
                    duration: "20 min",
                    instructions: "4 rondas de 4 min (20s ON / 10s OFF):\n1. Mountain Climbers\n2. V-Ups\n3. Flutter Kicks\n4. Burpees\nDescanso 1 min entre rondas"
                }
            }
        ]
    },
    4: {
        type: "Upper + Core",
        mainLift: "bench",
        accessories: [
            { id: "row_abs", name: "Barbell Row", sets: 3, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "pallof_press", name: "Pallof Press", sets: 3, reps: "12/lado", exerciseType: "dumbbell", blockType: "strength" },
            { id: "side_plank", name: "Plancha Lateral", sets: 3, reps: "30s/lado", exerciseType: "bodyweight", blockType: "strength" },
            { id: "bird_dog", name: "Bird Dog", sets: 3, reps: "12/lado", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    5: {
        type: "Core Power",
        accessories: [
            { id: "hanging_leg_raise_2", name: "Hanging Leg Raises", sets: 4, reps: "12", exerciseType: "bodyweight", blockType: "strength" },
            { id: "cable_crunch", name: "Cable Crunch", sets: 4, reps: "15", exerciseType: "dumbbell", blockType: "strength" },
            { id: "dragon_flag", name: "Dragon Flag (Progresión)", sets: 3, reps: "6-8", exerciseType: "bodyweight", blockType: "strength" },
            { id: "plank_variations", name: "Plancha con Variaciones", sets: 3, reps: "40s", exerciseType: "bodyweight", blockType: "strength" },
            { id: "bicycle_crunch", name: "Bicycle Crunch", sets: 3, reps: "20", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    6: {
        type: "Full Body Circuit + Core",
        accessories: [
            {
                id: "metcon_core", name: "Metcon Core", sets: 1, reps: "1", blockType: "conditioning", conditioning: {
                    format: "For Time",
                    duration: "20-25 min",
                    instructions: "3 rondas:\n15 KB Swings\n10 Ball Slams\n5 Turkish Get-ups (cada lado)\n15 Sit-ups\n200m Run"
                }
            }
        ]
    }
};

// ============================================================
// TEMPLATES: GLUTE BUILDING (ciclo de 6 días)
// ============================================================
export const TEMPLATES_GLUTE_BUILDING: Record<number, {
    type: string,
    mainLift?: keyof LiftState,
    accessories: {
        id: string,
        name: string,
        sets: number,
        reps: string,
        exerciseType?: ProtocolExercise['exerciseType'],
        blockType?: ProtocolExercise['blockType'],
        conditioning?: ProtocolExercise['conditioningMetadata']
    }[]
}> = {
    1: {
        type: "Glute Strength (Hip Thrust)",
        mainLift: "hip_thrust",
        accessories: [
            { id: "glute_bridge", name: "Glute Bridge", sets: 3, reps: "15", exerciseType: "barbell", blockType: "strength" },
            { id: "cable_kickback", name: "Cable Kickback", sets: 3, reps: "12/pierna", exerciseType: "dumbbell", blockType: "strength" },
            { id: "abductor_machine", name: "Abductor Machine", sets: 3, reps: "15", exerciseType: "dumbbell", blockType: "strength" },
            { id: "fire_hydrant", name: "Fire Hydrant con Banda", sets: 3, reps: "15/lado", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    2: {
        type: "Quad Dominant (Squat)",
        mainLift: "squat",
        accessories: [
            { id: "bulgarian_split", name: "Bulgarian Split Squat", sets: 3, reps: "10/pierna", exerciseType: "dumbbell", blockType: "strength" },
            { id: "leg_press", name: "Leg Press", sets: 3, reps: "12", exerciseType: "dumbbell", blockType: "strength" },
            { id: "step_ups", name: "Step-ups", sets: 3, reps: "10/pierna", exerciseType: "dumbbell", blockType: "strength" },
            { id: "leg_curl", name: "Leg Curl", sets: 3, reps: "12", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    3: {
        type: "Glute Activation + Cardio",
        accessories: [
            { id: "band_walk", name: "Band Walks", sets: 3, reps: "20 pasos", exerciseType: "bodyweight", blockType: "strength" },
            { id: "clamshell", name: "Clamshells con Banda", sets: 3, reps: "15/lado", exerciseType: "bodyweight", blockType: "strength" },
            {
                id: "hiit_glute", name: "HIIT Sprints", sets: 1, reps: "15 min", blockType: "conditioning", conditioning: {
                    format: "Other",
                    duration: "15 min",
                    instructions: "Sprint 30s / Caminata 60s\nAlternar entre correr y Stairmaster si hay disponible"
                }
            }
        ]
    },
    4: {
        type: "Posterior Chain (RDL)",
        mainLift: "deadlift",
        accessories: [
            { id: "good_morning", name: "Good Morning", sets: 3, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "cable_pull_through", name: "Cable Pull-through", sets: 3, reps: "12", exerciseType: "dumbbell", blockType: "strength" },
            { id: "nordic_curl", name: "Nordic Curl (Progresión)", sets: 3, reps: "6-8", exerciseType: "bodyweight", blockType: "strength" },
            { id: "single_leg_rdl", name: "Single Leg RDL", sets: 3, reps: "10/pierna", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    5: {
        type: "Glute Volume",
        accessories: [
            { id: "hip_thrust_var", name: "Hip Thrust Pausa", sets: 4, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "sumo_deadlift", name: "Sumo Deadlift", sets: 3, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "frog_pump", name: "Frog Pump", sets: 3, reps: "20", exerciseType: "bodyweight", blockType: "strength" },
            { id: "donkey_kick", name: "Donkey Kicks con Banda", sets: 3, reps: "15/lado", exerciseType: "bodyweight", blockType: "strength" },
            { id: "hip_abduction", name: "Hip Abduction Cable", sets: 3, reps: "12/lado", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    6: {
        type: "Lower Body Metcon",
        accessories: [
            {
                id: "metcon_glute", name: "Lower Body For Time", sets: 1, reps: "1", blockType: "conditioning", conditioning: {
                    format: "For Time",
                    duration: "20-25 min",
                    instructions: "3 rondas:\n20 Walking Lunges\n15 KB Swings\n12 Box Jumps\n15 Goblet Squats\n200m Run"
                }
            }
        ]
    }
};

// ============================================================
// TEMPLATES: FAT BURN / BAJAR DE PESO FUERTE (ciclo de 6 días)
// ============================================================
export const TEMPLATES_FAT_BURN: Record<number, {
    type: string,
    mainLift?: keyof LiftState,
    accessories: {
        id: string,
        name: string,
        sets: number,
        reps: string,
        exerciseType?: ProtocolExercise['exerciseType'],
        blockType?: ProtocolExercise['blockType'],
        conditioning?: ProtocolExercise['conditioningMetadata']
    }[]
}> = {
    1: {
        type: "Full Body Strength A",
        mainLift: "squat",
        accessories: [
            { id: "bench_fb", name: "Bench Press", sets: 3, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "row_fb", name: "Barbell Row", sets: 3, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "shoulder_press_fb", name: "Shoulder Press", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "plank_fb", name: "Plancha", sets: 3, reps: "45s", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    2: {
        type: "HIIT Cardio",
        accessories: [
            {
                id: "tabata_fat", name: "Tabata Full Body", sets: 1, reps: "20 min", blockType: "conditioning", conditioning: {
                    format: "Tabata",
                    duration: "20 min",
                    instructions: "5 rondas de 4 min (20s ON / 10s OFF):\n1. Burpees\n2. Jump Squats\n3. Mountain Climbers\n4. High Knees\nDescanso 1 min entre rondas"
                }
            }
        ]
    },
    3: {
        type: "Full Body Strength B",
        mainLift: "deadlift",
        accessories: [
            { id: "incline_fb", name: "Incline Press", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "lat_pulldown_fb", name: "Lat Pulldown", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "lunges_fb", name: "Lunges", sets: 3, reps: "10/pierna", exerciseType: "dumbbell", blockType: "strength" },
            { id: "russian_twist_fb", name: "Russian Twist", sets: 3, reps: "20", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    4: {
        type: "Metabolic Circuit",
        accessories: [
            {
                id: "amrap_fat", name: "AMRAP 25", sets: 1, reps: "25 min", blockType: "conditioning", conditioning: {
                    format: "AMRAP",
                    duration: "25 min",
                    instructions: "15 KB Swings\n10 Box Jumps\n12 Wall Balls\n10 Rope Slams / Battle Ropes\n200m Run"
                }
            }
        ]
    },
    5: {
        type: "Upper + Cardio Intervals",
        mainLift: "bench",
        accessories: [
            { id: "row_upper_fb", name: "Barbell Row", sets: 3, reps: "10", exerciseType: "barbell", blockType: "strength" },
            { id: "lateral_raise_fb", name: "Lateral Raises", sets: 3, reps: "15", exerciseType: "dumbbell", blockType: "strength" },
            {
                id: "emom_fat", name: "EMOM Cardio", sets: 1, reps: "10 min", blockType: "conditioning", conditioning: {
                    format: "EMOM",
                    duration: "10 min",
                    instructions: "Minuto par: 15 Burpees\nMinuto impar: 20 Jump Squats"
                }
            }
        ]
    },
    6: {
        type: "Long Endurance + Core",
        accessories: [
            {
                id: "endurance_fat", name: "Cardio Steady State", sets: 1, reps: "30-45 min", blockType: "conditioning", conditioning: {
                    format: "Other",
                    duration: "30-45 min",
                    instructions: "Cardio a ritmo constante (zona 2-3):\nCorrer, Bici, Elíptica o Remo\nMantener frecuencia cardíaca moderada-alta"
                }
            },
            { id: "core_finisher_fb", name: "Core Finisher", sets: 3, reps: "1 round", blockType: "strength", exerciseType: "bodyweight" }
        ]
    }
};

// ============================================================
// TEMPLATES: FÍSICO GRIEGO (Greek God) — Full Body 3 días
// Basado en la research del físico griego + calistenia avanzada.
// Calistenia (peso corporal) + 2 mancuernas. Skills SIEMPRE al
// principio (sistema nervioso fresco): planche/front lever (brazo
// extendido) y muscle-up (brazo flexionado). Énfasis en empuje
// vertical y deltoides laterales para hombros anchos (Adonis Index).
// ============================================================
export const TEMPLATES_GREEK_GOD: Record<number, {
    type: string,
    mainLift?: keyof LiftState,
    accessories: {
        id: string,
        name: string,
        sets: number,
        reps: string,
        exerciseType?: ProtocolExercise['exerciseType'],
        blockType?: ProtocolExercise['blockType'],
        conditioning?: ProtocolExercise['conditioningMetadata']
    }[]
}> = {
    1: {
        // DÍA A — Énfasis Empuje + Planche
        type: "Empuje + Planche",
        accessories: [
            { id: "greek_planche", name: "Planche (progresión a tu nivel)", sets: 5, reps: "10-15 seg", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_muscleup_a", name: "Muscle-up (explosivo)", sets: 4, reps: "2-4", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_pseudo_planche", name: "Pseudo Planche Push-ups", sets: 4, reps: "6-10", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_weighted_pullups", name: "Pull-ups con Peso", sets: 4, reps: "5-8", exerciseType: "bodyweight_weighted", blockType: "strength" },
            { id: "greek_pike_pushups", name: "Pike Push-ups / HSPU pared", sets: 3, reps: "6-10", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_lateral_raises_a", name: "Lateral Raises (última serie drop set)", sets: 4, reps: "12-20", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    2: {
        // DÍA B — Énfasis Tracción + Front Lever
        type: "Tracción + Front Lever",
        accessories: [
            { id: "greek_front_lever", name: "Front Lever (tuck → adv → straddle)", sets: 5, reps: "8-12 seg", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_muscleup_b", name: "Muscle-up / High Pulls explosivos", sets: 4, reps: "3-5", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_weighted_dips", name: "Weighted Dips", sets: 4, reps: "6-10", exerciseType: "bodyweight_weighted", blockType: "strength" },
            { id: "greek_archer_pullups", name: "Archer Pull-ups / Pull-ups con peso", sets: 4, reps: "5-8/lado", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_australian_rows", name: "Australian / Inverted Rows", sets: 3, reps: "10-15", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_lateral_raises_b", name: "Lateral Raises (lean-away, un brazo)", sets: 4, reps: "12-20", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    3: {
        // DÍA C — Full Body / Balance + Skills mixtos
        type: "Full Body + Skills",
        accessories: [
            { id: "greek_skill_weakest", name: "Skill más atrasado (planche o front lever)", sets: 5, reps: "10-12 seg", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_muscleup_transitions", name: "Muscle-up Transitions (negativos)", sets: 4, reps: "3-5", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_archer_pushups", name: "Archer / Decline Push-ups", sets: 4, reps: "8-12", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_chinups", name: "Chin-ups (supinado)", sets: 4, reps: "6-10", exerciseType: "bodyweight", blockType: "strength" },
            { id: "greek_bulgarian_split", name: "Bulgarian Split Squat (mancuernas)", sets: 3, reps: "8-12/pierna", exerciseType: "dumbbell", blockType: "strength" },
            { id: "greek_lateral_raises_c", name: "Lateral Raises (drop set al fallo)", sets: 3, reps: "12-20", exerciseType: "dumbbell", blockType: "strength" },
            { id: "greek_calf_raises", name: "Standing Calf Raises (una pierna)", sets: 4, reps: "15-20/pierna", exerciseType: "dumbbell", blockType: "strength" }
        ]
    },
    4: {
        // DÍA D — Sesión Extra (Full Body) · VARIANTE GIMNASIO (equipo completo)
        type: "Sesión Extra · Gimnasio",
        accessories: [
            { id: "greek_x_pulldown", name: "Lat Pulldown / Pull-ups", sets: 4, reps: "8-12", exerciseType: "dumbbell", blockType: "strength" },
            { id: "greek_x_incline_db", name: "Incline Dumbbell Press", sets: 4, reps: "8-12", exerciseType: "dumbbell", blockType: "strength" },
            { id: "greek_x_lateral", name: "Lateral Raises (cable o mancuerna)", sets: 4, reps: "12-20", exerciseType: "dumbbell", blockType: "strength" },
            { id: "greek_x_row", name: "Seated Row / Machine Row", sets: 3, reps: "10-12", exerciseType: "dumbbell", blockType: "strength" },
            { id: "greek_x_arms", name: "Curl + Tríceps Pushdown", sets: 3, reps: "10-12", exerciseType: "dumbbell", blockType: "strength" },
            {
                id: "greek_x_rope", name: "Finisher: Soga (intervalos)", sets: 1, reps: "8-10 min", blockType: "conditioning", conditioning: {
                    format: "Other",
                    duration: "8-10 min",
                    instructions: "Saltar la soga 40s ON / 20s OFF.\nSi no hay soga: bici o remo a ritmo fuerte."
                }
            }
        ]
    }
};

// VARIANTE CASA del Día D — sin barra: solo peso corporal + 2 mancuernas + soga.
// "Ejercicios que no necesiten nada": nada de pull-ups/dips (requieren barra).
export const TEMPLATES_GREEK_EXTRA_HOME: { type: string, accessories: typeof TEMPLATES_GREEK_GOD[1]['accessories'] } = {
    type: "Sesión Extra · Casa",
    accessories: [
        { id: "greek_xh_pseudo_planche", name: "Pseudo Planche / Archer Push-ups", sets: 4, reps: "8-12", exerciseType: "bodyweight", blockType: "strength" },
        { id: "greek_xh_ohp", name: "Overhead Press (mancuernas)", sets: 4, reps: "8-12", exerciseType: "dumbbell", blockType: "strength" },
        { id: "greek_xh_lateral", name: "Lateral Raises (mancuernas)", sets: 4, reps: "12-20", exerciseType: "dumbbell", blockType: "strength" },
        { id: "greek_xh_db_row", name: "Bent-over Rows (mancuernas)", sets: 4, reps: "10-12", exerciseType: "dumbbell", blockType: "strength" },
        { id: "greek_xh_curls", name: "Curl Bíceps + Hammer (mancuernas)", sets: 3, reps: "10-12", exerciseType: "dumbbell", blockType: "strength" },
        { id: "greek_xh_bulgarian", name: "Bulgarian Split Squat (mancuernas)", sets: 3, reps: "8-12/pierna", exerciseType: "dumbbell", blockType: "strength" },
        { id: "greek_xh_core", name: "Core: Plank / Hollow / V-ups", sets: 3, reps: "30-45 seg", exerciseType: "bodyweight", blockType: "strength" },
        {
            id: "greek_xh_rope", name: "Finisher: Soga (intervalos)", sets: 1, reps: "8-10 min", blockType: "conditioning", conditioning: {
                format: "Other",
                duration: "8-10 min",
                instructions: "Saltar la soga 40s ON / 20s OFF x 8-10 min.\nAlternar pies / doble salto si te sobra."
            }
        }
    ]
};

// Warmup específico para el plan Físico Griego (muñecas/escápulas/hombros).
// Los skills cargan muñecas/codos/hombros de forma extrema: no negociable.
export const WARMUP_GREEK = [
    { name: 'Saltar la cuerda / Jumping Jacks', reps: '60 seg' },
    { name: 'Círculos y flexión/extensión de muñeca', reps: '10' },
    { name: 'Scapular Pull-ups', reps: '8' },
    { name: 'Band Pull-aparts / Círculos de Hombro', reps: '15' },
    { name: 'Planche Leans + Hollow Body (activación)', reps: '20 seg' }
];

// ============================================================
// Warmup específico para rutinas de mujeres
// ============================================================
export const WARMUP_WOMEN = [
    { name: 'Jumping Jacks', reps: '20' },
    { name: 'Sentadillas sin Peso', reps: '15' },
    { name: 'Glute Bridge', reps: '12' },
    { name: 'Estocadas con Rotación', reps: '10' },
    { name: 'Cat-Cow Stretch', reps: '10' }
];

// ============================================================
// TEMPLATES: RECUPERACIÓN POSPARTO (diástasis-safe) — ciclo A/B/C (3 días)
// 12 semanas en 3 fases reales que cambian la rutina (ver getPostpartumPhase):
//   Fase 1 (sesiones 1-9): SOLO Rutina A (reconexión, sin peso)
//   Fase 2 (10-24): A/B/C con mancuernas livianas
//   Fase 3 (25-36): A/B/C, cargas/rango mayores
// Sin mainLift (nada de 1RM de barra) y SIN deload: la progresión es propia y
// se gobierna por señales (sin coning, sin pérdidas), no por peso automático.
// La "Base diaria" de reconexión NO vive acá: es una card diaria del dashboard.
// ============================================================
export const TEMPLATES_POSTPARTUM: Record<number, {
    type: string,
    mainLift?: keyof LiftState,
    accessories: {
        id: string,
        name: string,
        sets: number,
        reps: string,
        exerciseType?: ProtocolExercise['exerciseType'],
        blockType?: ProtocolExercise['blockType'],
        conditioning?: ProtocolExercise['conditioningMetadata']
    }[]
}> = {
    1: {
        // RUTINA A — Core profundo + suelo pélvico (sin peso)
        type: "Rutina A · Core + Suelo pélvico",
        accessories: [
            { id: "pp_a_breath_tva", name: "Respiración + Activación Transverso", sets: 3, reps: "8 resp", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pp_a_pelvic_tilt", name: "Báscula Pélvica", sets: 3, reps: "10", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pp_a_heel_slides", name: "Heel Slides (deslizar talón)", sets: 3, reps: "8/pierna", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pp_a_deadbug_1leg", name: "Toe Taps / Dead Bug 1 pierna", sets: 3, reps: "8/lado", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pp_a_glute_bridge", name: "Puente de Glúteos", sets: 3, reps: "12", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pp_a_bird_dog", name: "Bird Dog (perro-pájaro)", sets: 3, reps: "8/lado", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pp_a_side_plank_knees", name: "Plancha Lateral de Rodillas", sets: 2, reps: "15-20 seg/lado", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    2: {
        // RUTINA B — Tren inferior + core (mancuernas)
        type: "Rutina B · Tren inferior + Core",
        accessories: [
            { id: "pp_b_goblet_squat", name: "Sentadilla Goblet", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "pp_b_rdl", name: "Peso Muerto Rumano", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "pp_b_lunges", name: "Zancadas / Lunges", sets: 3, reps: "8/pierna", exerciseType: "dumbbell", blockType: "strength" },
            { id: "pp_b_hip_thrust", name: "Puente de Glúteos con Carga", sets: 3, reps: "12", exerciseType: "dumbbell", blockType: "strength" },
            { id: "pp_b_dead_bug", name: "Dead Bug", sets: 3, reps: "8/lado", exerciseType: "bodyweight", blockType: "strength" },
            { id: "pp_b_bird_dog", name: "Bird Dog", sets: 3, reps: "8/lado", exerciseType: "bodyweight", blockType: "strength" }
        ]
    },
    3: {
        // RUTINA C — Tren superior + core anti-rotación (mancuernas)
        type: "Rutina C · Tren superior + Core",
        accessories: [
            { id: "pp_c_row", name: "Remo Inclinado", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "pp_c_shoulder_press", name: "Press de Hombro Sentada", sets: 3, reps: "8-10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "pp_c_floor_press", name: "Press de Pecho en el Piso (Floor Press)", sets: 3, reps: "10", exerciseType: "dumbbell", blockType: "strength" },
            { id: "pp_c_farmer_carry", name: "Farmer Carry (caminar con peso)", sets: 3, reps: "30-40 seg", exerciseType: "dumbbell", blockType: "strength" },
            { id: "pp_c_side_plank_knees", name: "Plancha Lateral de Rodillas", sets: 2, reps: "20 seg/lado", exerciseType: "bodyweight", blockType: "strength" }
        ]
    }
};

// Warmup del plan posparto: mini reconexión antes de la rutina (la Base diaria completa
// vive como card del dashboard). Exhalar en el esfuerzo, cero coning.
export const WARMUP_POSTPARTUM = [
    { name: 'Respiración Diafragmática 360°', reps: '6-8 resp' },
    { name: 'Activación Transverso (drawing-in)', reps: '8' },
    { name: 'Báscula Pélvica', reps: '8' }
];

// Los 4 ejercicios de la "Base diaria" de reconexión (card diaria del dashboard).
// No pasan por el motor de workouts: se hacen casi todos los días, incluso los de descanso.
export const POSTPARTUM_DAILY_BASE = [
    { id: 'pp_base_breath', name: 'Respiración diafragmática 360°', reps: '8-10 respiraciones' },
    { id: 'pp_base_tva', name: 'Activación del transverso (drawing-in)', reps: '10 reps · sostener 3-5 seg' },
    { id: 'pp_base_pelvic_tilt', name: 'Báscula pélvica (posterior)', reps: '10 reps · sostener 5 seg' },
    { id: 'pp_base_pelvic_floor', name: 'Conexión de suelo pélvico (Kegel suave)', reps: '10 reps' }
] as const;

// ============================================================
// DAY LABELS por variante
// ============================================================
export const DAY_LABELS_TONED_ABS: Record<number, string> = {
    1: "Core Strength",
    2: "Lower + Core",
    3: "HIIT Cardio + Abs",
    4: "Upper + Core",
    5: "Core Power",
    6: "Full Body Circuit + Core"
};

export const DAY_LABELS_GLUTE_BUILDING: Record<number, string> = {
    1: "Glute Strength (Hip Thrust)",
    2: "Quad Dominant (Squat)",
    3: "Glute Activation + Cardio",
    4: "Posterior Chain (RDL)",
    5: "Glute Volume",
    6: "Lower Body Metcon"
};

export const DAY_LABELS_FAT_BURN: Record<number, string> = {
    1: "Full Body Strength A",
    2: "HIIT Cardio",
    3: "Full Body Strength B",
    4: "Metabolic Circuit",
    5: "Upper + Cardio Intervals",
    6: "Long Endurance + Core"
};

export const DAY_LABELS_GREEK_GOD: Record<number, string> = {
    1: "Empuje + Planche",
    2: "Tracción + Front Lever",
    3: "Full Body + Skills",
    4: "Sesión Extra (Full Body)"
};

export const DAY_LABELS_POSTPARTUM: Record<number, string> = {
    1: "Rutina A · Core + Suelo pélvico",
    2: "Rutina B · Tren inferior + Core",
    3: "Rutina C · Tren superior + Core"
};

export const DAY_LABELS: Record<number, string> = {
    1: "Upper Strength (Bench)",
    2: "Lower Strength (Squat)",
    3: "Short Metcon",
    4: "Upper Volume",
    5: "Olympic Technique",
    6: "Lower Power (Deadlift)",
    7: "Strict Calisthenics",
    8: "Long WOD",
    9: "Upper Strength Variation",
    10: "Lower Variation",
    11: "Gymnastics + Core",
    12: "Benchmark/Test"
};

// ============================================================
// Mapeo de goal a templates, labels y cycle length
// ============================================================
export type GoalType = 'military_v1' | 'toned_abs' | 'glute_building' | 'fat_burn' | 'greek_god' | 'postpartum';

export const GOAL_CONFIG: Record<GoalType, {
    templates: typeof TEMPLATES,
    dayLabels: Record<number, string>,
    cycleLength: number,
    warmup: typeof WARMUP,
    totalDays: number,
}> = {
    military_v1: {
        templates: TEMPLATES,
        dayLabels: DAY_LABELS,
        cycleLength: 12,
        warmup: WARMUP,
        totalDays: 180,
    },
    toned_abs: {
        templates: TEMPLATES_TONED_ABS,
        dayLabels: DAY_LABELS_TONED_ABS,
        cycleLength: 6,
        warmup: WARMUP_WOMEN,
        totalDays: 180,
    },
    glute_building: {
        templates: TEMPLATES_GLUTE_BUILDING,
        dayLabels: DAY_LABELS_GLUTE_BUILDING,
        cycleLength: 6,
        warmup: WARMUP_WOMEN,
        totalDays: 180,
    },
    fat_burn: {
        templates: TEMPLATES_FAT_BURN,
        dayLabels: DAY_LABELS_FAT_BURN,
        cycleLength: 6,
        warmup: WARMUP_WOMEN,
        totalDays: 180,
    },
    greek_god: {
        templates: TEMPLATES_GREEK_GOD,
        dayLabels: DAY_LABELS_GREEK_GOD,
        cycleLength: 4,
        warmup: WARMUP_GREEK,
        totalDays: 180,
    },
    postpartum: {
        templates: TEMPLATES_POSTPARTUM,
        dayLabels: DAY_LABELS_POSTPARTUM,
        cycleLength: 3,
        warmup: WARMUP_POSTPARTUM,
        totalDays: 36, // 12 semanas × ~3 sesiones/semana
    },
};

// ============================================================
// Fases del plan posparto (el "día" del motor = contador de sesiones).
// ============================================================
export const POSTPARTUM_PHASE_BOUNDS = { phase1End: 9, phase2End: 24 } as const;

export const getPostpartumPhase = (dayNumber: number): 1 | 2 | 3 => {
    if (dayNumber <= POSTPARTUM_PHASE_BOUNDS.phase1End) return 1;
    if (dayNumber <= POSTPARTUM_PHASE_BOUNDS.phase2End) return 2;
    return 3;
};

export const getDayType = (dayNumber: number, cycleLength = 12) => ((dayNumber - 1) % cycleLength) + 1;
export const getCycleIndex = (dayNumber: number, cycleLength = 12) => Math.floor((dayNumber - 1) / cycleLength) + 1;
export const isDeload = (cycleIndex: number) => cycleIndex % 4 === 0;

export const generateWorkout = (dayNumber: number, liftState: LiftState): ProtocolWorkout => {
    const dayTypeIndex = getDayType(dayNumber);
    const cycleIndex = getCycleIndex(dayNumber);
    const deload = isDeload(cycleIndex);

    // Mutate template if deload to change Benchmark day to Recovery
    let template = TEMPLATES[dayTypeIndex];
    if (deload && dayTypeIndex === 12) {
        template = {
            type: "Deload Recovery (Technique + Mobility)",
            accessories: [
                { id: "mobility_flow", name: "Full Body Mobility Flow", sets: 1, reps: "20 min", blockType: "strength", exerciseType: "bodyweight" },
                { id: "zone2", name: "Zone 2 Cardio (Easy)", sets: 1, reps: "30 min", blockType: "conditioning", conditioning: { format: "Other", duration: "30 min", instructions: "Cardio ligero a ritmo constante." } }
            ]
        };
    }

    const workout: ProtocolWorkout = {
        dayNumber,
        dayType: template.type,
        cycleIndex,
        isDeload: deload,
        mainLift: template.mainLift,
        exercises: []
    };

    // Add Warmup
    WARMUP.forEach((w, i) => {
        workout.exercises.push({
            id: `warmup_${i}`,
            name: w.name,
            sets: 1,
            reps: w.reps,
            blockType: 'warmup',
            exerciseType: 'bodyweight'
        });
    });

    // Calculate Main Lift
    if (template.mainLift) {
        const tm = liftState[template.mainLift as keyof LiftState];
        let sets = 5;
        const reps = "5";

        if (dayTypeIndex === 6) { // Deadlift
            sets = 4;
        }

        // Deload reduction
        if (deload) {
            sets = Math.max(2, Math.floor(sets * 0.7));
        }

        workout.exercises.push({
            id: template.mainLift,
            name: template.mainLift.toUpperCase() + (deload ? " (DELOAD)" : " (MAIN)"),
            sets,
            reps,
            weight: tm,
            blockType: 'strength',
            exerciseType: 'barbell'
        });
    }

    // Add Accessories
    if (template.accessories) {
        template.accessories.forEach(acc => {
            let sets = acc.sets;
            let reps = acc.reps;
            let exerciseType = acc.exerciseType || 'barbell';
            let blockType = acc.blockType || 'strength';

            // DYNAMIC PULLUP LOGIC based on level
            if ((acc.id === "pullups_st" || acc.id === "pullups_vol" || acc.id === "max_pullups") && liftState.pullupsLevel > 0) {
                if (liftState.pullupsLevel >= 12 && acc.id !== "max_pullups") {
                    exerciseType = "bodyweight_weighted";
                    reps = "8"; // Default suggested reps for weighted
                } else if (acc.id !== "max_pullups") {
                    exerciseType = "bodyweight";
                    reps = `${liftState.pullupsLevel}`;
                } else {
                    exerciseType = "bodyweight";
                }
            }

            // Conditioning Logic: ensure it's marked
            if (acc.id.startsWith("finisher") || acc.id.startsWith("metcon") || acc.id.startsWith("chipper")) {
                blockType = "conditioning";
            }

            // Deload reduction for accessories
            if (deload) {
                sets = Math.max(2, Math.floor(sets * 0.7));
            }

            workout.exercises.push({
                id: acc.id,
                name: acc.name,
                sets: sets,
                reps: reps,
                exerciseType: exerciseType,
                blockType: blockType,
                conditioningMetadata: acc.conditioning
            });
        });
    }

    if (deload) {
        workout.note = "SEMANA DE DELOAD: Volumen reducido. Enfócate en técnica perfecta y recuperación.";
    }

    return workout;
};

export const evaluateUnlock = (
    performed: { exerciseId: string, sets: { completed: boolean }[] }[],
    liftState: LiftState,
    dayWorkout: ProtocolWorkout
): Partial<LiftState> | null => {
    if (dayWorkout.isDeload) return null;
    if (!dayWorkout.mainLift) return null;

    const mainLiftId = dayWorkout.mainLift;
    const performedMainLift = performed.find(p => p.exerciseId === mainLiftId);

    if (!performedMainLift) return null;

    // Calculate Completion Ratio
    const plannedSets = dayWorkout.exercises.find(e => e.id === mainLiftId)?.sets || 0;
    const completedSets = performedMainLift.sets.filter(s => s.completed).length;

    if (plannedSets === 0) return null;

    const completionRatio = completedSets / plannedSets;

    if (completionRatio >= 0.9) {
        const incrementMap: Record<string, number> = {
            bench: 2.5,
            ohp: 2.5,
            squat: 5,
            deadlift: 5,
            hip_thrust: 5,
        };

        const lift = dayWorkout.mainLift;
        const newState = { ...liftState };
        const unlockChanges: Partial<LiftState> = {};

        if (incrementMap[lift]) {
            unlockChanges[lift] = newState[lift as keyof LiftState] + incrementMap[lift];
        }

        // Increment pullupsLevel only on bench day (upper strength) where pullups are a key accessory
        if (newState.pullupsLevel < 12 && lift === 'bench') {
            unlockChanges.pullupsLevel = newState.pullupsLevel + 1;
        }

        return Object.keys(unlockChanges).length > 0 ? unlockChanges : null;
    }

    return null;
};

/**
 * Aplica multiplicadores de volumen e intensidad a los lift states
 * según la variante de plan del usuario
 */
export function applyMultipliers(
    liftState: LiftState,
    volumeMultiplier: number,
    intensityMultiplier: number
): LiftState {
    return {
        bench: Math.round(liftState.bench * intensityMultiplier * 2) / 2, // Round to nearest 2.5kg
        squat: Math.round(liftState.squat * intensityMultiplier / 5) * 5, // Round to nearest 5kg
        deadlift: Math.round(liftState.deadlift * intensityMultiplier / 5) * 5, // Round to nearest 5kg
        ohp: Math.round(liftState.ohp * intensityMultiplier * 2) / 2, // Round to nearest 2.5kg
        pullupsLevel: liftState.pullupsLevel, // No afectado por multiplicadores
        hip_thrust: Math.round(liftState.hip_thrust * intensityMultiplier / 5) * 5, // Round to nearest 5kg
    };
}

/**
 * Ajusta el número de sets según el multiplicador de volumen
 */
export function adjustVolume(sets: number, volumeMultiplier: number): number {
    return Math.max(1, Math.round(sets * volumeMultiplier));
}

/**
 * Genera un workout del plan posparto según la fase activa.
 * Fase 1 (sesiones 1-9): SOLO Rutina A. Fase 2/3: rota A/B/C.
 * No hay deload ni mainLift; la progresión de carga es manual y guiada por señales.
 */
export function generatePostpartumWorkout(dayNumber: number): ProtocolWorkout {
    const cycleLength = 3;
    const phase = getPostpartumPhase(dayNumber);

    // Fase 1 = reconexión: siempre Rutina A. Fases 2/3 rotan A/B/C.
    const dayTypeIndex = phase === 1 ? 1 : getDayType(dayNumber, cycleLength);
    const template = TEMPLATES_POSTPARTUM[dayTypeIndex];

    const workout: ProtocolWorkout = {
        dayNumber,
        dayType: template.type,
        cycleIndex: getCycleIndex(dayNumber, cycleLength),
        isDeload: false,
        mainLift: undefined,
        exercises: [],
        phase,
    };

    // Warmup (mini reconexión)
    WARMUP_POSTPARTUM.forEach((w, i) => {
        workout.exercises.push({
            id: `warmup_${i}`,
            name: w.name,
            sets: 1,
            reps: w.reps,
            blockType: 'warmup',
            exerciseType: 'bodyweight'
        });
    });

    // Accesorios (todo strength; dumbbell o bodyweight, nunca barra)
    template.accessories.forEach(acc => {
        workout.exercises.push({
            id: acc.id,
            name: acc.name,
            sets: acc.sets,
            reps: acc.reps,
            exerciseType: acc.exerciseType || 'bodyweight',
            blockType: acc.blockType || 'strength',
            conditioningMetadata: acc.conditioning
        });
    });

    return workout;
}

/**
 * Genera un workout según el goal del usuario
 * Soporta military_v1 (12 días), toned_abs, glute_building, fat_burn (6 días)
 */
export function generateWorkoutForGoal(
    dayNumber: number,
    liftState: LiftState,
    goal: GoalType = 'military_v1',
    extraLocation: 'gym' | 'home' = 'gym'
): ProtocolWorkout {
    // Military v1 usa la función original para mantener compatibilidad
    if (goal === 'military_v1') {
        return generateWorkout(dayNumber, liftState);
    }

    // Posparto: fases reales, sin deload, sin mainLift (ver generatePostpartumWorkout)
    if (goal === 'postpartum') {
        return generatePostpartumWorkout(dayNumber);
    }

    const config = GOAL_CONFIG[goal];
    const { templates, cycleLength, warmup } = config;

    const dayTypeIndex = getDayType(dayNumber, cycleLength);
    const cycleIndex = getCycleIndex(dayNumber, cycleLength);
    const deload = isDeload(cycleIndex);

    // Greek God: CUALQUIER día se puede hacer en gimnasio (la sesión programada) o
    // en casa (full body sin barra). El usuario elige cuándo y las veces que quiera.
    const isDeloadRecovery = deload && dayTypeIndex === cycleLength;
    const greekLocationChoice = goal === 'greek_god' && !isDeloadRecovery;

    let template = templates[dayTypeIndex];
    if (greekLocationChoice && extraLocation === 'home') {
        template = TEMPLATES_GREEK_EXTRA_HOME;
    }

    // En deload, el último día del ciclo se convierte en recovery
    if (isDeloadRecovery) {
        template = {
            type: "Deload Recovery (Movilidad + Cardio Suave)",
            accessories: [
                { id: "mobility_flow", name: "Full Body Mobility Flow", sets: 1, reps: "20 min", blockType: "strength", exerciseType: "bodyweight" },
                { id: "zone2", name: "Zone 2 Cardio (Easy)", sets: 1, reps: "20 min", blockType: "conditioning", conditioning: { format: "Other", duration: "20 min", instructions: "Cardio ligero a ritmo constante." } }
            ]
        };
    }

    const workout: ProtocolWorkout = {
        dayNumber,
        dayType: template.type,
        cycleIndex,
        isDeload: deload,
        mainLift: template.mainLift,
        exercises: [],
        locationChoice: greekLocationChoice || undefined,
        extraLocation: greekLocationChoice ? extraLocation : undefined,
    };

    // Add Warmup
    warmup.forEach((w, i) => {
        workout.exercises.push({
            id: `warmup_${i}`,
            name: w.name,
            sets: 1,
            reps: w.reps,
            blockType: 'warmup',
            exerciseType: 'bodyweight'
        });
    });

    // Calculate Main Lift
    if (template.mainLift) {
        const liftKey = template.mainLift as keyof LiftState;
        const tm = liftState[liftKey];
        let sets = 4;
        const reps = liftKey === 'hip_thrust' ? "8" : "5";

        if (deload) {
            sets = Math.max(2, Math.floor(sets * 0.7));
        }

        workout.exercises.push({
            id: template.mainLift,
            name: template.mainLift.toUpperCase().replace('_', ' ') + (deload ? " (DELOAD)" : " (MAIN)"),
            sets,
            reps,
            weight: tm,
            blockType: 'strength',
            exerciseType: 'barbell'
        });
    }

    // Add Accessories
    if (template.accessories) {
        template.accessories.forEach(acc => {
            let sets = acc.sets;
            const reps = acc.reps;
            const exerciseType = acc.exerciseType || 'barbell';
            let blockType = acc.blockType || 'strength';

            if (acc.id.startsWith("metcon") || acc.id.startsWith("tabata") || acc.id.startsWith("hiit") || acc.id.startsWith("amrap") || acc.id.startsWith("emom") || acc.id.startsWith("endurance")) {
                blockType = "conditioning";
            }

            if (deload) {
                sets = Math.max(2, Math.floor(sets * 0.7));
            }

            workout.exercises.push({
                id: acc.id,
                name: acc.name,
                sets,
                reps,
                exerciseType,
                blockType,
                conditioningMetadata: acc.conditioning
            });
        });
    }

    if (deload) {
        workout.note = "SEMANA DE DELOAD: Volumen reducido. Enfócate en técnica perfecta y recuperación.";
    }

    return workout;
}

/**
 * Versión async de generateWorkout que resuelve el goal desde un variantId
 */
export async function generateWorkoutWithVariant(
    dayNumber: number,
    liftState: LiftState,
    variantId?: string
): Promise<ProtocolWorkout> {
    if (!variantId || variantId === 'military_v1') {
        return generateWorkout(dayNumber, liftState);
    }

    // Detectar goal desde variantId (ej: "toned_abs_intermediate_5day" -> "toned_abs")
    const goal = resolveGoalFromVariantId(variantId);
    return generateWorkoutForGoal(dayNumber, liftState, goal);
}

/**
 * Extrae el GoalType desde un variantId
 */
export function resolveGoalFromVariantId(variantId: string): GoalType {
    if (variantId.startsWith('toned_abs')) return 'toned_abs';
    if (variantId.startsWith('glute_building')) return 'glute_building';
    if (variantId.startsWith('fat_burn')) return 'fat_burn';
    if (variantId.startsWith('greek_god')) return 'greek_god';
    if (variantId.startsWith('postpartum')) return 'postpartum';
    if (variantId.startsWith('military') || variantId.startsWith('muscle_gain') || variantId.startsWith('max_strength') || variantId.startsWith('conditioning') || variantId.startsWith('weight_loss')) return 'military_v1';
    return 'military_v1';
}
