'use client';

import { useEffect, useState } from 'react';
import { getUserBadges, UserBadges } from '@/services/badgeService';
import { BADGE_DEFINITIONS, getRarityColor, calculateLevel, pointsForNextLevel } from '@/data/badgeDefinitions';
import { Award, Lock, TrendingUp } from 'lucide-react';

interface BadgesGalleryProps {
  userId: string;
}

export default function BadgesGallery({ userId }: BadgesGalleryProps) {
  const [userBadges, setUserBadges] = useState<UserBadges | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    setLoading(true);
    const badges = await getUserBadges(userId);
    setUserBadges(badges);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userBadges) return null;

  const nextLevelPoints = pointsForNextLevel(userBadges.level);
  const progressPercentage = (userBadges.totalPoints / nextLevelPoints) * 100;

  const unlockedBadges = userBadges.badges.map(b => b.id);
  const selectedBadgeDef = selectedBadge ? BADGE_DEFINITIONS.find(b => b.id === selectedBadge) : null;

  return (
    <div className="space-y-8">
      {/* User Level & Progress */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-amber-400" />
              <h2 className="text-4xl font-black text-white">
                Nivel {userBadges.level}
              </h2>
            </div>
            <p className="text-slate-400">
              {userBadges.totalPoints} / {nextLevelPoints} puntos
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-transparent bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text">
              {userBadges.badges.length}
            </div>
            <p className="text-slate-400 text-sm">Logros</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          {nextLevelPoints - userBadges.totalPoints} puntos hasta el nivel {userBadges.level + 1}
        </p>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-2xl font-black text-white mb-6">Todos los Logros</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {BADGE_DEFINITIONS.map((badgeDef) => {
            const isUnlocked = unlockedBadges.includes(badgeDef.id);
            const rarityGradient = getRarityColor(badgeDef.rarity);

            return (
              <button
                key={badgeDef.id}
                onClick={() => setSelectedBadge(badgeDef.id)}
                className={`
                  relative p-4 rounded-2xl transition-all transform hover:scale-105
                  ${isUnlocked
                    ? `bg-gradient-to-br ${rarityGradient} shadow-lg`
                    : 'bg-slate-800 border-2 border-slate-700'
                  }
                `}
              >
                {/* Badge Icon */}
                <div className="text-5xl mb-2 relative">
                  {isUnlocked ? (
                    badgeDef.icon
                  ) : (
                    <div className="flex items-center justify-center">
                      <Lock className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Badge Name */}
                <h4 className={`text-xs font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'} truncate`}>
                  {badgeDef.name}
                </h4>

                {/* Points */}
                <p className={`text-[10px] font-bold ${isUnlocked ? 'text-white/80' : 'text-slate-600'}`}>
                  {badgeDef.points}pts
                </p>

                {/* New Badge Indicator */}
                {isUnlocked && userBadges.badges.find(b => b.id === badgeDef.id && !b.seen) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-black text-white animate-pulse">
                    !
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && selectedBadgeDef && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="relative w-full max-w-md bg-slate-900 rounded-3xl p-8 border-2 border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge Icon */}
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${getRarityColor(selectedBadgeDef.rarity)} flex items-center justify-center text-6xl shadow-2xl`}>
              {unlockedBadges.includes(selectedBadge) ? (
                selectedBadgeDef.icon
              ) : (
                <Lock className="w-12 h-12 text-white/50" />
              )}
            </div>

            {/* Details */}
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">
                  {selectedBadgeDef.name}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {selectedBadgeDef.description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className={`px-4 py-2 rounded-full bg-gradient-to-br ${getRarityColor(selectedBadgeDef.rarity)} text-white font-bold text-sm`}>
                  +{selectedBadgeDef.points} puntos
                </div>
                <div className={`px-4 py-2 rounded-full bg-slate-800 text-white font-bold text-sm uppercase`}>
                  {selectedBadgeDef.rarity}
                </div>
              </div>

              {/* Category */}
              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  {selectedBadgeDef.category}
                </p>
              </div>

              {/* Unlock Status */}
              {unlockedBadges.includes(selectedBadge) ? (
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">
                    <Award className="w-4 h-4" />
                    Desbloqueado
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(userBadges.badges.find(b => b.id === selectedBadge)!.unlockedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              ) : (
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-400 text-sm font-bold">
                    <Lock className="w-4 h-4" />
                    Bloqueado
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Completa el requisito para desbloquearlo
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full mt-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
