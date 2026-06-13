import { describe, it, expect, beforeEach } from 'vitest';
import { saveWorkoutDraft, loadWorkoutDraft, clearWorkoutDraft, WorkoutDraft } from '@/utils/workoutDraft';

// Minimal localStorage stand-in so these tests run under the default (node) env.
class FakeStorage {
    private store = new Map<string, string>();
    getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
    setItem(k: string, v: string) { this.store.set(k, String(v)); }
    removeItem(k: string) { this.store.delete(k); }
    clear() { this.store.clear(); }
}

const UID = 'user-123';
const NOW = Date.parse('2026-06-12T10:00:00.000Z');

function draftFor(day: number, savedAt = new Date(NOW).toISOString()): WorkoutDraft {
    return {
        currentDay: day,
        workoutStartTime: new Date(NOW - 5 * 60 * 1000).toISOString(),
        activeExerciseIndex: 3,
        exerciseLogs: { bench: [{ reps: '5', weight: '60', completed: true }] },
        completedExercises: { warmup_0: true },
        savedAt,
    };
}

beforeEach(() => {
    (globalThis as unknown as { localStorage: FakeStorage }).localStorage = new FakeStorage();
});

describe('workoutDraft', () => {
    it('round-trips a draft for the same protocol day', () => {
        saveWorkoutDraft(UID, draftFor(7));
        const loaded = loadWorkoutDraft(UID, 7, NOW);
        expect(loaded).not.toBeNull();
        expect(loaded!.activeExerciseIndex).toBe(3);
        expect(loaded!.exerciseLogs.bench[0].weight).toBe('60');
        expect(loaded!.completedExercises.warmup_0).toBe(true);
    });

    it('does NOT restore a draft from a different day (currentDay advanced)', () => {
        saveWorkoutDraft(UID, draftFor(7));
        expect(loadWorkoutDraft(UID, 8, NOW)).toBeNull();
    });

    it('does NOT restore an abandoned (stale) draft', () => {
        const stale = draftFor(7, new Date(NOW - 13 * 60 * 60 * 1000).toISOString());
        saveWorkoutDraft(UID, stale);
        expect(loadWorkoutDraft(UID, 7, NOW)).toBeNull();
    });

    it('restores a draft that is recent enough', () => {
        const fresh = draftFor(7, new Date(NOW - 30 * 60 * 1000).toISOString());
        saveWorkoutDraft(UID, fresh);
        expect(loadWorkoutDraft(UID, 7, NOW)).not.toBeNull();
    });

    it('clearWorkoutDraft removes it', () => {
        saveWorkoutDraft(UID, draftFor(7));
        clearWorkoutDraft(UID);
        expect(loadWorkoutDraft(UID, 7, NOW)).toBeNull();
    });

    it('is scoped per user', () => {
        saveWorkoutDraft(UID, draftFor(7));
        expect(loadWorkoutDraft('other-user', 7, NOW)).toBeNull();
    });

    it('returns null on missing or corrupt data and no-ops without a userId', () => {
        expect(loadWorkoutDraft(UID, 7, NOW)).toBeNull();
        (globalThis as unknown as { localStorage: FakeStorage }).localStorage.setItem(
            'gymcounter_workout_draft_' + UID, '{not json',
        );
        expect(loadWorkoutDraft(UID, 7, NOW)).toBeNull();
        expect(() => saveWorkoutDraft('', draftFor(7))).not.toThrow();
    });
});
