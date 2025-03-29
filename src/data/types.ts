export interface User {
  id: string;
  name: string;
}

export interface GymVisit {
  id: string;
  userId: string;
  date: string; // ISO string format
}

export interface CounterState {
  users: User[];
  visits: GymVisit[];
} 