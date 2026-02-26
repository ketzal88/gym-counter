import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export { db };
export { deleteDoc, doc, collection, query, where, getDocs, writeBatch, setDoc, updateDoc } from 'firebase/firestore';

export interface Visit {
    id: string;
    userId: string;
    date: string; // ISO string
    timestamp: Date;
}

export interface BodyMeasurement {
    id: string;
    userId: string;
    date: string;
    muscle: number;
    fat: number;
    timestamp: Date;
}

export interface MaxWeight {
    id: string;
    userId: string;
    date: string;
    exercise: string;
    weight: number;
    reps: number;
    timestamp: Date;
}

export interface ExerciseLog {
    exerciseId: string;
    exerciseName: string;
    sets: {
        reps: number;
        weight: number;
        completed: boolean;
    }[];
}

export interface WorkoutLog {
    id: string;
    userId: string;
    routineId: string;
    routineName: string;
    date: string;
    exercises: ExerciseLog[];
    finisherCompleted: boolean;
    timestamp: Date;
    // Protocol Fields
    protocolDay?: number;
    protocolDayType?: string;
    cycleIndex?: number;
    isDeload?: boolean;
    unlockResult?: Partial<UserTrainingState['liftState']> | null;
}

export interface UserTrainingState {
    currentDay: number;
    completedProtocolSessions: number;
    liftState: {
        bench: number;
        squat: number;
        deadlift: number;
        ohp: number;
        pullupsLevel: number;
    };
    benchmarkResults?: {
        maxPushUps?: number;
        maxPullUps?: number;
        cardioTime?: string;
    };
    planVersion: string; // ahora almacena el variantId dinámico
    assignedVariant?: string; // planVariant ID
    protocolCompleted: boolean;

    // Tracking
    planStartedAt?: Date;
    estimatedCompletionDate?: Date; // basado en disponibilidad semanal
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    lastLogin: Date;

    // Onboarding
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: Date;

    // Perfil físico
    weight?: number; // kg
    sex?: 'M' | 'F';
    age?: number;
    height?: number; // cm

    // Perfil fitness
    fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning';
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    weeklyAvailability?: 3 | 4 | 5 | 6; // días por semana
    injuries?: string; // texto libre opcional

    // Plan asignado
    assignedPlan?: string; // ID del plan (ej: "muscle_gain_intermediate_5day")
    planAssignedAt?: Date;

    // Estado de suscripción
    subscriptionStatus?: 'trial' | 'active' | 'expired' | 'cancelled';
    trialStartDate?: Date;
    trialEndDate?: Date;
    subscriptionTier?: 'monthly' | 'annual';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    subscriptionCancelAtPeriodEnd?: boolean;

    // Preferencias
    locale?: 'es' | 'en';
}

// --- VISITS ---

export const subscribeToVisits = (userId: string | null, callback: (visits: Visit[]) => void) => {
    if (!userId) {
        callback([]);
        return () => { };
    }

    const q = query(
        collection(db, 'visits'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const visits = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
        })) as Visit[];
        callback(visits);
    });
};

export const addVisit = async (userId: string, date: Date) => {
    await addDoc(collection(db, 'visits'), {
        userId,
        date: date.toISOString(),
        timestamp: Timestamp.fromDate(date)
    });
};

export const deleteVisit = async (visitId: string) => {
    await deleteDoc(doc(db, 'visits', visitId));
};

/** Subscribes to visits from the current month (not all visits). Used for the leaderboard/social view. */
export const subscribeToCurrentMonthVisits = (callback: (visits: Visit[]) => void) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const q = query(
        collection(db, 'visits'),
        where('timestamp', '>=', startOfMonth),
        orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const visits = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
        })) as Visit[];
        callback(visits);
    }, (error) => {
        console.error("Error subscribing to all visits:", error);
    });
};

export const subscribeToAllUsers = (callback: (users: UserProfile[]) => void) => {
    const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data(),
            lastLogin: doc.data().lastLogin?.toDate(),
        })) as UserProfile[];
        callback(users);
    }, (error) => {
        console.error("Error subscribing to users:", error);
    });
};

// --- BODY MEASUREMENTS ---

export const subscribeToBodyMeasurements = (userId: string, callback: (measurements: BodyMeasurement[]) => void) => {
    const q = query(
        collection(db, 'measurements'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const measurements = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
        })) as BodyMeasurement[];
        callback(measurements);
    });
};

export const addBodyMeasurement = async (userId: string, date: Date, muscle: number, fat: number) => {
    await addDoc(collection(db, 'measurements'), {
        userId,
        date: date.toISOString(),
        muscle,
        fat,
        timestamp: Timestamp.fromDate(date)
    });
};

// --- MAX WEIGHTS ---

export const subscribeToMaxWeights = (userId: string, callback: (weights: MaxWeight[]) => void) => {
    const q = query(
        collection(db, 'maxWeights'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const weights = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
        })) as MaxWeight[];
        callback(weights);
    });
};

export const addMaxWeight = async (userId: string, date: Date, exercise: string, weight: number, reps: number) => {
    await addDoc(collection(db, 'maxWeights'), {
        userId,
        date: date.toISOString(),
        exercise,
        weight,
        reps,
        timestamp: Timestamp.fromDate(date)
    });
};

// --- WORKOUT LOGS ---

export const addWorkoutLog = async (workout: Omit<WorkoutLog, 'id' | 'timestamp'>) => {
    await addDoc(collection(db, 'workouts'), {
        ...workout,
        timestamp: Timestamp.fromDate(new Date())
    });
};

export const subscribeToWorkoutLogs = (userId: string, callback: (workouts: WorkoutLog[]) => void) => {
    const q = query(
        collection(db, 'workouts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const workouts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
        })) as WorkoutLog[];
        callback(workouts);
    });
};

// --- USER TRAINING STATE ---

export const initializeUserTrainingState = async (userId: string, initialLifts: UserTrainingState['liftState']) => {
    const { setDoc, doc } = await import('firebase/firestore');
    const initialState: UserTrainingState = {
        currentDay: 1,
        completedProtocolSessions: 0,
        liftState: initialLifts,
        planVersion: 'military_v1',
        protocolCompleted: false
    };
    await setDoc(doc(db, 'userTrainingState', userId), initialState);
    return initialState;
};

export const subscribeToUserTrainingState = (userId: string, callback: (state: UserTrainingState | null) => void) => {
    return onSnapshot(doc(db, 'userTrainingState', userId), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as UserTrainingState);
        } else {
            callback(null);
        }
    });
};

export const updateUserTrainingState = async (userId: string, updates: Partial<UserTrainingState>) => {
    const { updateDoc, doc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'userTrainingState', userId), updates);
};

/**
 * Actualiza campos del perfil de un usuario (solo para admin)
 * ADVERTENCIA: Esta función debe usarse solo por usuarios admin autorizados
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const { updateDoc, doc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'users', userId), updates);
};

// --- PLAN VARIANTS ---

export interface PlanVariant {
    id: string; // ej: "muscle_gain_intermediate_5day"
    name: string; // ej: "Ganancia Muscular - Intermedio (5 días)"
    goal: 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning';
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    weeklyDays: 3 | 4 | 5 | 6;

    // Configuración del plan
    totalDays: number; // 180
    cycleLength: number; // 12 días (puede variar)
    deloadFrequency: number; // cada 4 ciclos

    // Modificadores de volumen/intensidad
    volumeMultiplier: number; // 0.7 principiante, 1.0 intermedio, 1.2 avanzado
    intensityMultiplier: number; // ajusta pesos calculados

    // Complejidad de ejercicios
    exerciseComplexity: 'basic' | 'standard' | 'advanced';

    // Templates de días (estructura similar a TEMPLATES actual pero por variante)
    dayTemplates: Record<number, any>; // DayTemplateConfig from protocolEngine

    metadata: {
        description: string;
        targetAudience: string;
        createdAt: Date;
        updatedAt: Date;
    };
}

// --- SUBSCRIPTION EVENTS ---

export interface SubscriptionEvent {
    id: string;
    userId: string;
    eventType: 'trial_started' | 'trial_expired' | 'subscription_created'
        | 'subscription_updated' | 'subscription_cancelled' | 'payment_failed';
    timestamp: Date;
    data: Record<string, any>; // detalles específicos del evento
    stripeEventId?: string;
}

// --- USER BADGES (Gamification - Fase 5) ---

export interface Badge {
    id: string;
    unlockedAt: Date;
    seen: boolean; // Para mostrar notificación de nuevo badge
}

export interface UserBadges {
    userId: string;
    badges: Badge[];
    totalPoints: number;
    level: number; // 1-50 basado en puntos
    lastBadgeUnlocked?: Date;
}

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string; // emoji o URL de imagen
    category: 'attendance' | 'strength' | 'volume' | 'milestone' | 'consistency';
    points: number; // Puntos otorgados al desbloquear
    condition: BadgeCondition; // Lógica para desbloquear
}

export type BadgeCondition =
    | { type: 'visits_total', count: number }
    | { type: 'visits_streak', days: number }
    | { type: 'protocol_day', day: number }
    | { type: 'protocol_complete' }
    | { type: 'lift_milestone', lift: 'bench' | 'squat' | 'deadlift' | 'ohp', weight: number }
    | { type: 'total_volume', volume: number };
