'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Award } from 'lucide-react';
import { Badge } from '@/services/badgeService';
import { getBadgeDefinition, getRarityColor } from '@/data/badgeDefinitions';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const badgeDef = getBadgeDefinition(badge.id);

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (!badgeDef) return null;

  const rarityGradient = getRarityColor(badgeDef.rarity);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 rounded-3xl p-8 shadow-2xl border-2 border-slate-700 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="text-center space-y-6">
          {/* Badge Icon with Rarity Glow */}
          <div className="relative inline-block">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} blur-3xl opacity-50 animate-pulse`}
            />
            <div
              className={`relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${rarityGradient} flex items-center justify-center text-7xl shadow-2xl`}
            >
              {badgeDef.icon}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                ¡Nuevo Logro!
              </h3>
            </div>
            <h2 className="text-3xl font-black text-white">
              {badgeDef.name}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              {badgeDef.description}
            </p>
          </div>

          {/* Points */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br ${rarityGradient} text-white font-black text-lg shadow-lg`}>
            <span>+{badgeDef.points}</span>
            <span className="text-sm opacity-90">puntos</span>
          </div>

          {/* Rarity Badge */}
          <div className="pt-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-br ${rarityGradient} text-white`}>
              {badgeDef.rarity}
            </span>
          </div>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all transform active:scale-95 shadow-lg"
          >
            ¡Continuar Entrenando!
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
