'use client';

import { Flame } from 'lucide-react';

interface Props {
  consumed: number;
  target: number;
}

export default function CalorieBar({ consumed, target }: Props) {
  const percent = Math.min((consumed / target) * 100, 100);
  const remaining = Math.max(target - consumed, 0);
  const isOver = consumed > target;

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

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isOver ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-orange-400 to-yellow-400'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">0</span>
        <span className="text-[10px] text-gray-400">{target.toLocaleString()} kcal</span>
      </div>
    </div>
  );
}
