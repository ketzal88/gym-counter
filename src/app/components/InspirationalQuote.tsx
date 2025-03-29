'use client';

import { useEffect, useState } from 'react';
import { Quote, getRandomQuote } from '@/data/inspirationalQuotes';

export default function InspirationalQuote() {
  const [quote, setQuote] = useState<Quote>({ text: '', emoji: '' });
  const [animateIn, setAnimateIn] = useState(false);
  
  const refreshQuote = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setQuote(getRandomQuote());
      setAnimateIn(true);
    }, 300);
  };
  
  useEffect(() => {
    setQuote(getRandomQuote());
    setAnimateIn(true);
  }, []);
  
  return (
    <div 
      className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg mb-8 transform transition-all duration-500 relative ${
        animateIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      <div className="absolute top-2 right-2">
        <button 
          onClick={refreshQuote}
          className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          aria-label="Nueva cita"
          title="Nueva cita inspiracional"
        >
          🔄
        </button>
      </div>
      
      <div className="flex items-center justify-center">
        <span className="text-5xl mr-4 animate-pulse">{quote.emoji}</span>
        <p className="text-lg font-medium italic">{quote.text}</p>
      </div>
      
      <div className="absolute -bottom-3 right-4 text-xs bg-indigo-800 px-3 py-1 rounded-full shadow-md">
        ✨ Motivación diaria
      </div>
    </div>
  );
} 