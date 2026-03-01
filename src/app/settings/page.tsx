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
            <h2 className="font-bold text-gray-700">1日の目標カロリー</h2>
          </div>
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
          <div className="flex gap-2 mt-3">
            {[1600, 1800, 2000, 2200, 2500].map((cal) => (
              <button
                key={cal}
                onClick={() => setTargetCalories(String(cal))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  targetCalories === String(cal)
                    ? 'gradient-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {cal}
              </button>
            ))}
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
