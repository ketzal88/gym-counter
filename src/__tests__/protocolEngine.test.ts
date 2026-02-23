import { describe, it, expect } from 'vitest';
import {
    getDayType,
    getCycleIndex,
    isDeload,
    generateWorkout,
    evaluateUnlock,
    DAY_LABELS,
    TEMPLATES,
} from '@/services/protocolEngine';

const mockLiftState = {
    bench: 60,
    squat: 80,
    deadlift: 100,
    ohp: 40,
    pullupsLevel: 5,
};

describe('getDayType', () => {
    it('returns 1-12 cycling through days', () => {
        expect(getDayType(1)).toBe(1);
        expect(getDayType(12)).toBe(12);
        expect(getDayType(13)).toBe(1);
        expect(getDayType(24)).toBe(12);
    });

    it('handles day 180 correctly', () => {
        expect(getDayType(180)).toBe(12);
    });
});

describe('getCycleIndex', () => {
    it('returns correct cycle for various days', () => {
        expect(getCycleIndex(1)).toBe(1);
        expect(getCycleIndex(12)).toBe(1);
        expect(getCycleIndex(13)).toBe(2);
        expect(getCycleIndex(48)).toBe(4);
        expect(getCycleIndex(180)).toBe(15);
    });
});

describe('isDeload', () => {
    it('returns true for every 4th cycle', () => {
        expect(isDeload(1)).toBe(false);
        expect(isDeload(2)).toBe(false);
        expect(isDeload(3)).toBe(false);
        expect(isDeload(4)).toBe(true);
        expect(isDeload(8)).toBe(true);
        expect(isDeload(12)).toBe(true);
    });
});

describe('TEMPLATES', () => {
    it('has all 12 day types defined', () => {
        for (let i = 1; i <= 12; i++) {
            expect(TEMPLATES[i]).toBeDefined();
            expect(TEMPLATES[i].type).toBeTruthy();
        }
    });

    it('DAY_LABELS matches TEMPLATES', () => {
        for (let i = 1; i <= 12; i++) {
            expect(DAY_LABELS[i]).toBeTruthy();
        }
    });

    it('Day 4 has individual shoulder/arm exercises (not generic block)', () => {
        const day4 = TEMPLATES[4];
        const exerciseNames = day4.accessories.map(a => a.name);
        expect(exerciseNames).not.toContain('Shoulders + Arms');
        expect(exerciseNames).toContain('Dumbbell Shoulder Press');
        expect(exerciseNames).toContain('Lateral Raises');
        expect(exerciseNames).toContain('Barbell Curl');
        expect(exerciseNames).toContain('Triceps Rope Pushdown');
    });
});

describe('generateWorkout', () => {
    it('generates workout with warmup exercises', () => {
        const workout = generateWorkout(1, mockLiftState);
        const warmupExercises = workout.exercises.filter(e => e.blockType === 'warmup');
        expect(warmupExercises.length).toBe(5);
    });

    it('includes main lift for bench day (day 1)', () => {
        const workout = generateWorkout(1, mockLiftState);
        expect(workout.mainLift).toBe('bench');
        const mainEx = workout.exercises.find(e => e.id === 'bench');
        expect(mainEx).toBeDefined();
        expect(mainEx!.weight).toBe(60);
    });

    it('includes main lift for squat day (day 2)', () => {
        const workout = generateWorkout(2, mockLiftState);
        expect(workout.mainLift).toBe('squat');
    });

    it('has no main lift for metcon day (day 3)', () => {
        const workout = generateWorkout(3, mockLiftState);
        expect(workout.mainLift).toBeUndefined();
    });

    it('reduces sets during deload (cycle 4 = day 37-48)', () => {
        const normalWorkout = generateWorkout(1, mockLiftState);
        const deloadWorkout = generateWorkout(37, mockLiftState); // cycle 4, day type 1

        const normalMainSets = normalWorkout.exercises.find(e => e.id === 'bench')?.sets || 0;
        const deloadMainSets = deloadWorkout.exercises.find(e => e.id === 'bench')?.sets || 0;
        expect(deloadMainSets).toBeLessThan(normalMainSets);
    });

    it('adds deload note during deload weeks', () => {
        const workout = generateWorkout(37, mockLiftState);
        expect(workout.isDeload).toBe(true);
        expect(workout.note).toContain('DELOAD');
    });

    it('replaces day 12 with recovery during deload', () => {
        const workout = generateWorkout(48, mockLiftState); // cycle 4, day 12
        expect(workout.dayType).toContain('Deload Recovery');
    });
});

describe('evaluateUnlock', () => {
    it('returns increment when completion ratio >= 0.9', () => {
        const workout = generateWorkout(1, mockLiftState);
        const performed = [{
            exerciseId: 'bench',
            sets: Array(5).fill({ completed: true }),
        }];

        const result = evaluateUnlock(performed, mockLiftState, workout);
        expect(result).not.toBeNull();
        expect(result!.bench).toBe(62.5); // 60 + 2.5
    });

    it('increments pullups only on bench day', () => {
        const workout = generateWorkout(1, mockLiftState);
        const performed = [{
            exerciseId: 'bench',
            sets: Array(5).fill({ completed: true }),
        }];

        const result = evaluateUnlock(performed, mockLiftState, workout);
        expect(result!.pullupsLevel).toBe(6); // 5 + 1
    });

    it('does NOT increment pullups on squat day', () => {
        const workout = generateWorkout(2, mockLiftState);
        const performed = [{
            exerciseId: 'squat',
            sets: Array(5).fill({ completed: true }),
        }];

        const result = evaluateUnlock(performed, mockLiftState, workout);
        expect(result).not.toBeNull();
        expect(result!.pullupsLevel).toBeUndefined();
    });

    it('returns null during deload', () => {
        const workout = generateWorkout(37, mockLiftState);
        const performed = [{
            exerciseId: 'bench',
            sets: Array(5).fill({ completed: true }),
        }];

        const result = evaluateUnlock(performed, mockLiftState, workout);
        expect(result).toBeNull();
    });

    it('returns null when completion < 90%', () => {
        const workout = generateWorkout(1, mockLiftState);
        const performed = [{
            exerciseId: 'bench',
            sets: [{ completed: true }, { completed: true }, { completed: false }, { completed: false }, { completed: false }],
        }];

        const result = evaluateUnlock(performed, mockLiftState, workout);
        expect(result).toBeNull();
    });
});
