'use client';

import { FOCUS_LABELS } from '@/types';

const FOCUS_ICONS = ['😴', '😐', '🙂', '😊', '🤩'];
const FOCUS_COLORS = [
  'from-gray-200 to-gray-300',
  'from-blue-200 to-blue-300',
  'from-yellow-200 to-yellow-300',
  'from-orange-200 to-orange-400',
  'from-pink-400 to-rose-400',
];

interface Props {
  value?: number;
  onChange: (v: number) => void;
}

export default function FocusSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium">今日の集中力</p>
      <div className="flex gap-2 justify-between">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all active:scale-95 ${
              value === level
                ? `bg-gradient-to-b ${FOCUS_COLORS[level - 1]} shadow-md scale-105`
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">{FOCUS_ICONS[level - 1]}</span>
            <span className={`text-[9px] font-semibold ${value === level ? 'text-gray-700' : 'text-gray-400'}`}>
              {FOCUS_LABELS[level]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
