'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import MealCard from './MealCard';
import { MEAL_TYPE_LABELS, MEAL_TYPE_COLORS } from '@/types';
import type { MealRecord, MealType } from '@/types';

interface Props {
  meals: MealRecord[];
  loading: boolean;
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function MealTimeline({ meals, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const groupedMeals = MEAL_ORDER.reduce<Record<MealType, MealRecord[]>>(
    (acc, type) => {
      acc[type] = meals.filter((m) => m.meal_type === type);
      return acc;
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] }
  );

  const hasMeals = meals.length > 0;

  return (
    <div className="space-y-4">
      {MEAL_ORDER.map((type) => {
        const typeMeals = groupedMeals[type];
        const gradient = MEAL_TYPE_COLORS[type];
        if (typeMeals.length === 0) return null;

        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-0.5 w-3 rounded-full bg-gradient-to-r ${gradient}`} />
              <h3 className={`text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {MEAL_TYPE_LABELS[type]}
              </h3>
            </div>
            <div className="space-y-2">
              {typeMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          </div>
        );
      })}

      {!hasMeals && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-gray-500 font-medium text-sm">今日の食事はまだ記録されていません</p>
          <p className="text-gray-400 text-xs mt-1">下のボタンから記録を始めましょう！</p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 mt-4 gradient-primary text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-200 active:scale-95 transition-transform"
          >
            <Plus size={18} />
            食事を記録する
          </Link>
        </div>
      )}
    </div>
  );
}
