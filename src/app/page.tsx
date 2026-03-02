'use client';

// Triggering a fresh build to resolve Vercel deployment internal error.
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Bell } from 'lucide-react';
import MorningCard from '@/components/MorningCard';
import MealTimeline from '@/components/MealTimeline';
import CalorieBar from '@/components/CalorieBar';
import DailyInsightCard from '@/components/DailyInsightCard';
import { useMeals } from '@/lib/hooks/useMeals';
import { useDailyRecord } from '@/lib/hooks/useDailyRecord';

const DEFAULT_TARGET = 2000;

export default function HomePage() {
  const { meals, loading: mealsLoading, totalCalories } = useMeals();
  const { record } = useDailyRecord();

  const target = record?.target_calories || DEFAULT_TARGET;
  const targetP = record?.target_protein || 50;
  const targetF = record?.target_fat || 50;
  const targetC = record?.target_carbs || 200;

  const totalP = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalF = meals.reduce((sum, m) => sum + (m.fat || 0), 0);
  const totalC = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);

  const today = new Date().toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            MealTrack
          </h1>
          <p className="text-xs text-gray-400 font-medium">{today}</p>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <Bell size={18} className="text-gray-500" />
          </button>
          <Link
            href="/settings"
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <Settings size={18} className="text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Morning Card */}
      <div className="mb-4">
        <MorningCard />
      </div>

      {/* AI Insight */}
      <div className="mb-4">
        <DailyInsightCard meals={meals} />
      </div>

      {/* Calorie Bar */}
      <div className="mb-4">
        <CalorieBar
          consumed={totalCalories}
          target={target}
          protein={{ consumed: totalP, target: targetP }}
          fat={{ consumed: totalF, target: targetF }}
          carbs={{ consumed: totalC, target: targetC }}
        />
      </div>

      {/* Meal Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700">今日の食事</h2>
          <Link href="/add" className="text-xs text-orange-500 font-bold">
            + 追加
          </Link>
        </div>
        <MealTimeline meals={meals} loading={mealsLoading} />
      </div>
    </div>
  );
}
