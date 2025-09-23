import { CounterState, GymVisit } from './types';

const STORAGE_KEY = 'gym_counter_data';

// Default state with two users
const defaultState: CounterState = {
  users: [],
  visits: [],
  bodyMeasurements: []
};

// Load data from localStorage
export function loadData(): CounterState {
  if (typeof window === 'undefined') {
    return defaultState;
  }
  
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    return defaultState;
  }
  
  try {
    return JSON.parse(storedData) as CounterState;
  } catch (e) {
    console.error('Failed to parse stored data', e);
    return defaultState;
  }
}

// Save data to localStorage
export function saveData(data: CounterState): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Add a new gym visit
export function addGymVisit(userId: string): CounterState {
  const data = loadData();
  
  const newVisit: GymVisit = {
    id: Date.now().toString(),
    userId,
    date: new Date().toISOString()
  };
  
  const updatedData = {
    ...data,
    visits: [...data.visits, newVisit]
  };
  
  saveData(updatedData);
  return updatedData;
}

// Add a new body measurement (API version)

// Get visits count for each user
export function getVisitCounts(): Record<string, number> {
  const data = loadData();
  
  return data.users.reduce<Record<string, number>>((counts, user) => {
    counts[user.id] = data.visits.filter(v => v.userId === user.id).length;
    return counts;
  }, {});
}

// Get all visits grouped by date (for stats)
export function getVisitsByDate(): Record<string, { [userId: string]: boolean }> {
  const data = loadData();
  const visitsMap: Record<string, { [userId: string]: boolean }> = {};
  
  data.visits.forEach(visit => {
    const dateStr = visit.date.split('T')[0]; // Get YYYY-MM-DD part
    if (!visitsMap[dateStr]) {
      visitsMap[dateStr] = {};
    }
    visitsMap[dateStr][visit.userId] = true;
  });
  
  return visitsMap;
} 
