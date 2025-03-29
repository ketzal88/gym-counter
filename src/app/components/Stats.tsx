'use client';

import { useState, useEffect } from 'react';
import { getVisitsByDate, loadData } from '@/data/storage';
import { User } from '@/data/types';

export default function Stats() {
  const [users, setUsers] = useState<User[]>([]);
  const [visitsByDate, setVisitsByDate] = useState<Record<string, { [userId: string]: boolean }>>({});
  
  useEffect(() => {
    const data = loadData();
    setUsers(data.users);
    setVisitsByDate(getVisitsByDate());
  }, []);
  
  // Get sorted dates (most recent first)
  const sortedDates = Object.keys(visitsByDate).sort().reverse();
  
  // Format date to a more readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getConsecutiveDays = () => {
    if (!sortedDates.length) return 0;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // If today doesn't have a visit, return 0
    if (sortedDates[0] !== today) return 0;
    
    let consecutiveDays = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDateObj = new Date(sortedDates[i-1]);
      const prevDateObj = new Date(sortedDates[i]);
      
      // Check if dates are consecutive
      const diffTime = currentDateObj.getTime() - prevDateObj.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  };
  
  const consecutiveDays = getConsecutiveDays();
  
  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Stats</h2>
      
      {consecutiveDays > 0 && (
        <div className="bg-green-100 p-4 rounded-lg mb-4">
          <p className="text-green-800">
            <span className="font-bold">{consecutiveDays}</span> consecutive days going to the gym!
          </p>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-medium mb-4 text-gray-800">History</h3>
        
        {sortedDates.length === 0 ? (
          <p className="text-gray-600">No gym visits recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {sortedDates.map(date => (
              <li key={date} className="border-b pb-2">
                <div className="font-medium text-gray-800">{formatDate(date)}</div>
                <div className="flex gap-2 mt-1">
                  {users.map(user => (
                    <div 
                      key={user.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        visitsByDate[date][user.id] 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {user.name} {visitsByDate[date][user.id] ? '✓' : '✗'}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 