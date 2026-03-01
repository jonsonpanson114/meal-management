'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeals = useMemo(() => {
    if (!searchQuery.trim()) return meals;
    const query = searchQuery.toLowerCase();
    return meals.filter((m) =>
      m.description.toLowerCase().includes(query) ||
      (m.foods && m.foods.some(f => f.name.toLowerCase().includes(query)))
    );
  }, [meals, searchQuery]);

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
      acc[type] = filteredMeals.filter((m) => m.meal_type === type);
      return acc;
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] }
  );

  const hasResults = filteredMeals.length > 0;
  const isSearching = searchQuery.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {meals.length > 0 && (
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="料理名や食材で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 focus:border-orange-200 rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none transition-all shadow-sm"
          />
          {isSearching && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

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

      {!hasResults && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">{isSearching ? '🔍' : '🍽️'}</p>
          <p className="text-gray-500 font-medium text-sm">
            {isSearching ? '該当する食事が見つかりませんでした' : '今日の食事はまだ記録されていません'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {isSearching ? '別のキーワードで試してみてください' : '下のボタンから記録を始めましょう！'}
          </p>
          {!isSearching && (
            <Link
              href="/add"
              className="inline-flex items-center gap-2 mt-4 gradient-primary text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-200 active:scale-95 transition-transform"
            >
              <Plus size={18} />
              食事を記録する
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

