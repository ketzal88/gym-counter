export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only for internal use, not exposed to client
  avatar?: string;
  createdAt: Date;
  lastVisit?: Date;
  streak: number;
  totalVisits: number;
  subscription: 'free' | 'premium';
  googleSheetId?: string; // ID of the user's personal Google Sheet
  
  // Body measurements (required)
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  
  // Body composition (optional)
  musclePercentage?: number; // percentage
  fatPercentage?: number; // percentage
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