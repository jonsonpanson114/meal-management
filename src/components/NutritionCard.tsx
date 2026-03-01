'use client';

import { Flame, Beef, Droplets, Wheat, Sparkles } from 'lucide-react';
import type { NutritionInfo } from '@/types';

interface Props {
  data: NutritionInfo;
}

export default function NutritionCard({ data }: Props) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-100 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-orange-400" />
        <h3 className="text-sm font-bold text-orange-600">AI 栄養分析結果</h3>
      </div>

      {/* Foods detected */}
      {data.foods && data.foods.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {data.foods.map((food, i) => (
            <span
              key={i}
              className="bg-white rounded-lg px-2 py-1 text-xs font-medium text-gray-600 shadow-sm border border-orange-100"
            >
              {food.name}
              <span className="text-orange-400 ml-1">{food.calories}kcal</span>
            </span>
          ))}
        </div>
      )}

      {/* Main calorie display */}
      <div className="bg-white rounded-xl p-3 mb-3 flex items-center gap-3 shadow-sm">
        <div className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
          <Flame size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">合計カロリー</p>
          <p className="text-2xl font-black text-orange-500">
            {data.calories.toLocaleString()}
            <span className="text-sm font-medium text-gray-400"> kcal</span>
          </p>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-2 text-center shadow-sm">
          <Beef size={14} className="text-red-400 mx-auto mb-1" />
          <p className="text-[10px] text-gray-400 font-medium">タンパク質</p>
          <p className="text-sm font-black text-red-500">{data.protein}g</p>
        </div>
        <div className="bg-white rounded-xl p-2 text-center shadow-sm">
          <Droplets size={14} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-[10px] text-gray-400 font-medium">脂質</p>
          <p className="text-sm font-black text-yellow-600">{data.fat}g</p>
        </div>
        <div className="bg-white rounded-xl p-2 text-center shadow-sm">
          <Wheat size={14} className="text-blue-400 mx-auto mb-1" />
          <p className="text-[10px] text-gray-400 font-medium">炭水化物</p>
          <p className="text-sm font-black text-blue-500">{data.carbs}g</p>
        </div>
      </div>

      {data.description && (
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">{data.description}</p>
      )}
    </div>
  );
}
