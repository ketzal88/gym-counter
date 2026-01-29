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
export { deleteDoc, doc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

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
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    lastLogin: Date;
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

export const subscribeToAllVisits = (callback: (visits: Visit[]) => void) => {
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
