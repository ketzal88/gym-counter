'use client';

import { useState, useEffect } from 'react';
import { User } from '@/data/types';
import { addGymVisit, getVisitCounts, loadData } from '@/data/storage';

export default function Counter() {
  const [users, setUsers] = useState<User[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  
  // Load initial data
  useEffect(() => {
    const data = loadData();
    setUsers(data.users);
    setCounts(getVisitCounts());
  }, []);
  
  // Handle adding a new visit
  const handleAddVisit = (userId: string) => {
    addGymVisit(userId);
    setCounts(getVisitCounts());
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Gym Counter</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {users.map(user => (
          <div 
            key={user.id} 
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium mb-2 text-gray-800">{user.name}</h3>
              <div className="text-4xl font-bold mb-4 text-gray-900">{counts[user.id] || 0}</div>
              <button
                onClick={() => handleAddVisit(user.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                I went to the gym! +1
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 