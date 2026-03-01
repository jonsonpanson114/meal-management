'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Flame, ChevronDown, ChevronUp, Beef, Droplets, Wheat } from 'lucide-react';
import { MEAL_TYPE_COLORS, MEAL_TYPE_LABELS } from '@/types';
import type { MealRecord } from '@/types';

interface Props {
  meal: MealRecord;
}

export default function MealCard({ meal }: Props) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(meal.recorded_at).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const gradientClass = MEAL_TYPE_COLORS[meal.meal_type];

  return (
    <div className="card animate-slide-up">
      <div className="flex items-start gap-3">
        {/* Meal type indicator */}
        <div className={`bg-gradient-to-br ${gradientClass} w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md`}>
          <span className="text-white text-xs font-bold">
            {MEAL_TYPE_LABELS[meal.meal_type][0]}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
              {MEAL_TYPE_LABELS[meal.meal_type]}
            </span>
            <span className="text-xs text-gray-400">{time}</span>
          </div>
          <p className="text-sm font-semibold text-gray-700 mt-0.5 truncate">{meal.description}</p>
          <div className="flex items-center gap-1 mt-1">
            <Flame size={12} className="text-orange-400" />
            <span className="text-sm font-black text-orange-500">{meal.calories.toLocaleString()}</span>
            <span className="text-xs text-gray-400">kcal</span>
          </div>
        </div>

        {meal.image_url && (
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            <Image
              src={meal.image_url}
              alt={meal.description}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Expandable section */}
      {(meal.protein || meal.fat || meal.carbs || meal.ai_comment) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-2 flex items-center justify-center gap-1 text-xs text-gray-400 py-1 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? '閉じる' : '詳細を見る'}
          </button>

          {expanded && (
            <div className="mt-2 pt-2 border-t border-gray-50 animate-fade-in">
              {(meal.protein || meal.fat || meal.carbs) && (
                <div className="flex gap-3 mb-2">
                  {meal.protein && (
                    <div className="flex-1 bg-red-50 rounded-lg p-2 text-center">
                      <Beef size={12} className="text-red-400 mx-auto mb-1" />
                      <p className="text-[10px] text-gray-500">たんぱく質</p>
                      <p className="text-sm font-bold text-red-500">{meal.protein}g</p>
                    </div>
                  )}
                  {meal.fat && (
                    <div className="flex-1 bg-yellow-50 rounded-lg p-2 text-center">
                      <Droplets size={12} className="text-yellow-500 mx-auto mb-1" />
                      <p className="text-[10px] text-gray-500">脂質</p>
                      <p className="text-sm font-bold text-yellow-600">{meal.fat}g</p>
                    </div>
                  )}
                  {meal.carbs && (
                    <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                      <Wheat size={12} className="text-blue-400 mx-auto mb-1" />
                      <p className="text-[10px] text-gray-500">炭水化物</p>
                      <p className="text-sm font-bold text-blue-500">{meal.carbs}g</p>
                    </div>
                  )}
                </div>
              )}
              {meal.ai_comment && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-orange-400 mb-1">✨ AIのコメント</p>
                  <p className="text-xs text-gray-600">{meal.ai_comment}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
