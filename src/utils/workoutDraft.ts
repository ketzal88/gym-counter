/**
 * Persistencia del workout EN CURSO (borrador) para que sobreviva al cambio de
 * pestaña (RoutineTracker se desmonta) y a recargas / cierre de la PWA.
 *
 * Se guarda en localStorage con clave por usuario y se valida por `currentDay`
 * al restaurar, para no resucitar el progreso de un día distinto.
 */

export interface WorkoutDraft {
    currentDay: number;
    workoutStartTime: string | null; // ISO
    activeExerciseIndex: number;
    exerciseLogs: Record<string, { reps: string; weight: string; completed: boolean }[]>;
    completedExercises: Record<string, boolean>;
    extraLocation?: 'gym' | 'home'; // greek_god día 4: variante elegida (gym/casa)
    savedAt: string; // ISO — para descartar borradores abandonados
}

const KEY_PREFIX = 'gymcounter_workout_draft_';
// Borradores sin tocar por más de este tiempo se consideran abandonados.
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 h

const keyFor = (userId: string) => `${KEY_PREFIX}${userId}`;

function hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
}

export function saveWorkoutDraft(userId: string, draft: WorkoutDraft): void {
    if (!userId || !hasStorage()) return;
    try {
        localStorage.setItem(keyFor(userId), JSON.stringify(draft));
    } catch {
        // quota llena / modo privado — ignorar, el borrador es best-effort
    }
}

export function loadWorkoutDraft(
    userId: string,
    currentDay: number,
    now: number = Date.now(),
): WorkoutDraft | null {
    if (!userId || !hasStorage()) return null;
    try {
        const raw = localStorage.getItem(keyFor(userId));
        if (!raw) return null;
        const draft = JSON.parse(raw) as WorkoutDraft;
        // Solo restaurar un borrador del MISMO día de protocolo…
        if (!draft || draft.currentDay !== currentDay) return null;
        // …y que no esté abandonado.
        const savedAt = Date.parse(draft.savedAt);
        if (!Number.isNaN(savedAt) && now - savedAt > MAX_AGE_MS) return null;
        return draft;
    } catch {
        return null;
    }
}

export function clearWorkoutDraft(userId: string): void {
    if (!userId || !hasStorage()) return;
    try {
        localStorage.removeItem(keyFor(userId));
    } catch {
        // ignorar
    }
}
