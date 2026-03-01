'use client';

import { Flame } from 'lucide-react';

interface Props {
  consumed: number;
  target: number;
  protein?: { consumed: number; target: number };
  fat?: { consumed: number; target: number };
  carbs?: { consumed: number; target: number };
}

export default function CalorieBar({ consumed, target, protein, fat, carbs }: Props) {
  const percent = Math.min((consumed / target) * 100, 100);
  const remaining = Math.max(target - consumed, 0);
  const isOver = consumed > target;

  const renderMiniBar = (label: string, data?: { consumed: number; target: number }, colorClass?: string) => {
    if (!data) return null;
    const p = Math.min((data.consumed / data.target) * 100, 100);
    return (
      <div className="flex-1">
        <div className="flex justify-between items-end mb-1 px-1">
          <span className="text-[9px] font-bold text-gray-400">{label}</span>
          <span className="text-[9px] font-black text-gray-600">{Math.round(data.consumed)}<span className="text-gray-400 font-medium">/{data.target}g</span></span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClass}`}
            style={{ width: `${p}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="gradient-primary w-8 h-8 rounded-lg flex items-center justify-center">
            <Flame size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">今日のカロリー</p>
            <p className="text-xl font-black text-gray-800">
              {consumed.toLocaleString()}
              <span className="text-sm font-medium text-gray-400"> / {target.toLocaleString()} kcal</span>
            </p>
          </div>
        </div>
        {isOver ? (
          <span className="text-xs font-bold text-red-400 bg-red-50 px-2 py-1 rounded-lg">
            +{(consumed - target).toLocaleString()} オーバー
          </span>
        ) : (
          <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
            残り {remaining.toLocaleString()} kcal
          </span>
        )}
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-orange-400 to-yellow-400'
            }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex gap-4">
        {renderMiniBar('P', protein, 'bg-blue-400')}
        {renderMiniBar('F', fat, 'bg-yellow-400')}
        {renderMiniBar('C', carbs, 'bg-green-400')}
      </div>
    </div>
  );
}

