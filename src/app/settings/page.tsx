'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings, Target, LogOut, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [targetCalories, setTargetCalories] = useState('2000');
  const [targetProtein, setTargetProtein] = useState('50');
  const [targetFat, setTargetFat] = useState('50');
  const [targetCarbs, setTargetCarbs] = useState('200');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setDisplayName(data.display_name || '');
        setTargetCalories(String(data.target_calories || 2000));
        setTargetProtein(String(data.target_protein || 50));
        setTargetFat(String(data.target_fat || 50));
        setTargetCarbs(String(data.target_carbs || 200));
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email,
        display_name: displayName,
        target_calories: parseInt(targetCalories),
        target_protein: parseInt(targetProtein),
        target_fat: parseInt(targetFat),
        target_carbs: parseInt(targetCarbs),
      });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-gray-600" />
          <h1 className="font-black text-gray-800">設定</h1>
        </div>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <div className="card">
          <h2 className="font-bold text-gray-700 mb-4">プロフィール</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">ニックネーム</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-orange-300 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">メールアドレス</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-gray-100 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Calorie Goal */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-700">1日の目標設定</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">目標カロリー</label>
              <div className="relative">
                <input
                  type="number"
                  min="1000"
                  max="5000"
                  step="50"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(e.target.value)}
                  className="w-full bg-orange-50 border-2 border-orange-100 focus:border-orange-400 rounded-xl px-4 py-3 text-xl font-bold text-orange-500 outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kcal</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block text-center">タンパク質</label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(e.target.value)}
                    className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-400 rounded-xl px-3 py-2 text-center font-bold text-blue-600 outline-none transition-colors"
                  />
                  <span className="absolute right-2 bottom-1 text-[8px] text-gray-400">g</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block text-center">脂質</label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetFat}
                    onChange={(e) => setTargetFat(e.target.value)}
                    className="w-full bg-yellow-50 border-2 border-yellow-100 focus:border-yellow-400 rounded-xl px-3 py-2 text-center font-bold text-yellow-600 outline-none transition-colors"
                  />
                  <span className="absolute right-2 bottom-1 text-[8px] text-gray-400">g</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block text-center">炭水化物</label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                    className="w-full bg-green-50 border-2 border-green-100 focus:border-green-400 rounded-xl px-3 py-2 text-center font-bold text-green-600 outline-none transition-colors"
                  />
                  <span className="absolute right-2 bottom-1 text-[8px] text-gray-400">g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle size={20} />
              保存しました！
            </>
          ) : saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              保存中...
            </>
          ) : (
            '設定を保存'
          )}
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full bg-white border-2 border-gray-200 text-gray-500 font-bold py-3.5 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          ログアウト
        </button>
      </div>
    </div>
  );
}
