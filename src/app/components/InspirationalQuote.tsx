'use client';

import { useEffect, useState } from 'react';
import { Quote, getRandomQuote } from '@/data/inspirationalQuotes';

export default function InspirationalQuote() {
  const [quote, setQuote] = useState<Quote>({ text: '', emoji: '' });
  
  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg mb-8 transform transition-all duration-300 hover:scale-102 hover:shadow-xl animate-fade-in">
      <div className="flex items-center justify-center">
        <span className="text-4xl mr-4 animate-pulse">{quote.emoji}</span>
        <p className="text-lg font-medium italic">{quote.text}</p>
      </div>
    </div>
  );
} 