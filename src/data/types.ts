export interface User {
  id: string;
  name: string;
}

export interface GymVisit {
  id: string;
  userId: string;
  date: string; // ISO string format
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string; // ISO string
  muscle: number; // percentage
  fat: number; // percentage
}

export interface CounterState {
  users: User[];
  visits: GymVisit[];
  bodyMeasurements?: BodyMeasurement[];
} 