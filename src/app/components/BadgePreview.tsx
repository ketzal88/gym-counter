'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserBadges, getUnseenBadges, UserBadges } from '@/services/badgeService';
import { getBadgeDefinition, getRarityColor } from '@/data/badgeDefinitions';
import { Award } from 'lucide-react';

interface BadgePreviewProps {
  userId: string;
}

export default function BadgePreview({ userId }: BadgePreviewProps) {
  const [userBadges, setUserBadges] = useState<UserBadges | null>(null);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    const badges = await getUserBadges(userId);
    setUserBadges(badges);
  };

  if (!userBadges || userBadges.badges.length === 0) return null;

  // Get last 3 badges
  const lastBadges = [...userBadges.badges]
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3);

  const unseenCount = getUnseenBadges(userBadges).length;

  return (
    <Link
      href="/badges"
      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all group"
    >
      {/* Level Badge */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-white text-sm shadow-lg">
          {userBadges.level}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-white">Nivel {userBadges.level}</p>
          <p className="text-[10px] text-slate-400">{userBadges.totalPoints}pts</p>
        </div>
      </div>

      {/* Badge Icons */}
      <div className="flex items-center -space-x-2">
        {lastBadges.map((badge) => {
          const badgeDef = getBadgeDefinition(badge.id);
          if (!badgeDef) return null;

          const rarityGradient = getRarityColor(badgeDef.rarity);

          return (
            <div
              key={badge.id}
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${rarityGradient} flex items-center justify-center text-lg border-2 border-slate-900 shadow-lg transform group-hover:scale-110 transition-transform`}
              title={badgeDef.name}
            >
              {badgeDef.icon}
            </div>
          );
        })}
      </div>

      {/* Arrow & Unseen Indicator */}
      <div className="flex items-center gap-2 ml-auto">
        {unseenCount > 0 && (
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-black text-white animate-pulse">
            {unseenCount}
          </div>
        )}
        <Award className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}
