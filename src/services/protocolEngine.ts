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

export const getDayType = (dayNumber: number) => ((dayNumber - 1) % 12) + 1;
export const getCycleIndex = (dayNumber: number) => Math.floor((dayNumber - 1) / 12) + 1;
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
            // Pullups handling is separate/special or included here?
            // Main Lift logic usually applies to weighted lifts.
            // If main lift is Bodyweight Pullups (not current case), we'd need logic.
            // BUT: instruction said "pullups: +1 rep hasta 12".
            // However, evaluateUnlock triggers on MAIN LIFT completion.
            // Pullups is usually accessory in Day 1.
            // Is there a Day where Pullups is MAIN? 
            // Day 7 is Strict Calisthenics but no "mainLift" defined in template?
            // If Pullups is never Main Lift, it never Unlocks via this function.
            // We need to check if we should unlock pullups based on accessory performance?
            // The instruction "Evaluate Unlock (modo B)" lists pullups in the effect.
            // If pullups is an accessory, we should probably check it independently?
            // For now, let's keep Main Lift logic. If Pullups ever becomes Main, it needs handling.
            // But Day 1 Main is Bench. Day 6 Main is Deadlift. 
            // So Pullups progression is static? No, that's bad.
        };

        // Wait, if Pull Ups is accessory, it won't trigger unlock of Pull Ups level.
        // We need to verify if we should track Accessory Progress.
        // Instruction says: "Unlock si: completionRatio >= 0.9 (del main lift)".
        // "Efecto: bench+2.5... pullups +1".
        // This implies completing the MAIN lift (e.g. Bench) increments PULLUPS too?
        // That sounds weird unless they are coupled.
        // OR, the instruction applies to when Pullups IS the main lift (Day 7?).
        // Checking Day 7 Template: type "Strict Calisthenics", no "mainLift".
        // Checking Day 12 Benchmark: "Max Pull Ups".
        // Maybe we just increment it on successful completion of Day 1 (Bench Day)?
        // Or maybe we should check the pullup accessory specifically?

        // Let's assume for now we only unlock the Main Lift performed.
        // We will add pullups increment ONLY if it's the main lift.

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
    };
}

/**
 * Ajusta el número de sets según el multiplicador de volumen
 */
export function adjustVolume(sets: number, volumeMultiplier: number): number {
    return Math.max(1, Math.round(sets * volumeMultiplier));
}

/**
 * Obtiene los templates para una variante específica
 * NOTA: Por ahora usa TEMPLATES hardcoded. En futuras fases,
 * esto se moverá a cargar desde Firestore collection planVariants
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getTemplatesForVariant(_variantId: string): Promise<typeof TEMPLATES> {
    // TODO: En Fase 2, implementar carga desde Firestore
    // const { getPlanVariant } = await import('./planVariantService');
    // const variant = await getPlanVariant(variantId);
    // return variant?.dayTemplates || TEMPLATES;

    // Por ahora, retornar templates hardcoded
    return TEMPLATES;
}

/**
 * Versión futura de generateWorkout que acepta variantId
 * NOTA: Por ahora mantiene compatibilidad con código existente
 */
export async function generateWorkoutWithVariant(
    dayNumber: number,
    liftState: LiftState,
    variantId?: string
): Promise<ProtocolWorkout> {
    // Si no hay variantId, usar comportamiento default (military_v1)
    if (!variantId || variantId === 'military_v1') {
        return generateWorkout(dayNumber, liftState);
    }

    // TODO: Implementar lógica para variantes dinámicas en próximas fases
    // const { getPlanVariant } = await import('./planVariantService');
    // const variant = await getPlanVariant(variantId);
    //
    // if (variant) {
    //     const adjustedLiftState = applyMultipliers(
    //         liftState,
    //         variant.volumeMultiplier,
    //         variant.intensityMultiplier
    //     );
    //     // Generar workout con templates de la variante
    // }

    // Fallback a comportamiento default
    return generateWorkout(dayNumber, liftState);
}
