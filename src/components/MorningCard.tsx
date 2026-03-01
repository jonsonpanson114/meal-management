'use client';

import { useState } from 'react';
import { Sun, Scale, Sparkles, CheckCircle } from 'lucide-react';
import FocusSelector from './FocusSelector';
import { useDailyRecord } from '@/lib/hooks/useDailyRecord';

export default function MorningCard() {
  const { record, loading, saveRecord } = useDailyRecord();
  const [weight, setWeight] = useState('');
  const [focus, setFocus] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const alreadyRecorded = record && (record.weight !== null || record.focus_level !== null);

  const handleSave = async () => {
    if (!weight && !focus) return;
    setSaving(true);
    await saveRecord({
      weight: weight ? parseFloat(weight) : undefined,
      focus_level: focus,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/2 mb-4" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    );
  }

  if (alreadyRecorded) {
    return (
      <div className="card border-l-4 border-orange-400 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="gradient-morning w-10 h-10 rounded-xl flex items-center justify-center">
            <Sun size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">朝の記録</h2>
            <p className="text-xs text-gray-400">今日も入力済み！</p>
          </div>
          <CheckCircle size={24} className="text-green-400 ml-auto" />
        </div>
        <div className="flex gap-4">
          {record?.weight && (
            <div className="bg-orange-50 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-gray-500 font-medium">体重</p>
              <p className="text-xl font-black text-orange-500">{record.weight}<span className="text-sm font-medium">kg</span></p>
            </div>
          )}
          {record?.focus_level && (
            <div className="bg-yellow-50 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-gray-500 font-medium">集中力</p>
              <p className="text-2xl">
                {['😴', '😐', '🙂', '😊', '🤩'][record.focus_level - 1]}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card border-l-4 border-orange-400 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="gradient-morning w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
          <Sun size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">おはようございます！</h2>
          <p className="text-xs text-gray-400">今日の朝の記録をつけましょう</p>
        </div>
        <Sparkles size={20} className="text-yellow-400 ml-auto animate-pulse" />
      </div>

      {/* Weight Input */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
          <Scale size={12} />
          体重（kg）
        </p>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            min="20"
            max="300"
            placeholder="例: 65.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-orange-50 border-2 border-orange-100 focus:border-orange-400 rounded-xl px-4 py-3 text-lg font-bold text-gray-700 outline-none transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</span>
        </div>
      </div>

      <FocusSelector value={focus} onChange={setFocus} />

      <button
        onClick={handleSave}
        disabled={saving || (!weight && !focus)}
        className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition-all active:scale-95 shadow-md ${
          saving || (!weight && !focus)
            ? 'bg-gray-200 text-gray-400 shadow-none'
            : 'gradient-morning shadow-orange-200'
        }`}
      >
        {saved ? '✓ 記録しました！' : saving ? '保存中...' : '朝の記録を保存'}
      </button>
    </div>
  );
}
