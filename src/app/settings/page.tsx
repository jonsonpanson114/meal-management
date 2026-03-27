'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings, Target, LogOut, Loader2, CheckCircle, Calculator, Zap, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { notificationManager } from '@/lib/utils/notifications';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'ほぼ動かない', desc: 'デスクワーク中心', factor: 1.2 },
  { value: 'light', label: '少し動く', desc: '週1〜3日軽い運動', factor: 1.375 },
  { value: 'moderate', label: '適度に動く', desc: '週3〜5日運動', factor: 1.55 },
  { value: 'very_active', label: 'よく動く', desc: '週6〜7日激しい運動', factor: 1.725 },
];

// Mifflin-St Jeor → TDEE → PFC（P:15%, F:25%, C:60%）
function calcTargets(age: number, height: number, weight: number, gender: string, activityLevel: string) {
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const factor = ACTIVITY_LEVELS.find((a) => a.value === activityLevel)?.factor ?? 1.375;
  const tdee = Math.round(bmr * factor);
  const protein = Math.round((tdee * 0.15) / 4);
  const fat = Math.round((tdee * 0.25) / 9);
  const carbs = Math.round((tdee * 0.60) / 4);
  return { calories: tdee, protein, fat, carbs };
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { notificationSettings, permission, loading: notificationLoading, toggleNotifications, updateMealTime, refreshSettings } = useNotifications();

  // 目標値
  const [targetCalories, setTargetCalories] = useState('2000');
  const [targetProtein, setTargetProtein] = useState('75');
  const [targetFat, setTargetFat] = useState('55');
  const [targetCarbs, setTargetCarbs] = useState('300');

  // 体格情報
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState('light');

  // 通知設定
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [breakfastTime, setBreakfastTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('12:00');
  const [dinnerTime, setDinnerTime] = useState('19:00');

  // UI
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calcFlash, setCalcFlash] = useState(false);

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
        setTargetProtein(String(data.target_protein || 75));
        setTargetFat(String(data.target_fat || 55));
        setTargetCarbs(String(data.target_carbs || 300));
        if (data.age) setAge(String(data.age));
        if (data.height_cm) setHeightCm(String(data.height_cm));
        if (data.body_weight) setBodyWeight(String(data.body_weight));
        if (data.gender) setGender(data.gender);
        if (data.activity_level) setActivityLevel(data.activity_level);
      }

      // Load notification settings
      if (notificationSettings) {
        setNotificationEnabled(notificationSettings.enabled || false);
        setBreakfastTime(notificationSettings.breakfast_time || '08:00');
        setLunchTime(notificationSettings.lunch_time || '12:00');
        setDinnerTime(notificationSettings.dinner_time || '19:00');
      }
    };
    load();
  }, [notificationSettings]);

  const handleAutoCalc = () => {
    const a = parseInt(age);
    const h = parseFloat(heightCm);
    const w = parseFloat(bodyWeight);
    if (!a || !h || !w) return;
    const result = calcTargets(a, h, w, gender, activityLevel);
    setTargetCalories(String(result.calories));
    setTargetProtein(String(result.protein));
    setTargetFat(String(result.fat));
    setTargetCarbs(String(result.carbs));
    setCalcFlash(true);
    setTimeout(() => setCalcFlash(false), 1500);
  };

  const canCalc = !!age && !!heightCm && !!bodyWeight;

  const handleNotificationToggle = async (enabled: boolean) => {
    const success = await toggleNotifications(enabled);
    if (success) {
      setNotificationEnabled(enabled);
      if (enabled) {
        // Schedule notifications
        await notificationManager.init();
        await notificationManager.scheduleNotifications([
          { mealType: 'breakfast', time: breakfastTime },
          { mealType: 'lunch', time: lunchTime },
          { mealType: 'dinner', time: dinnerTime },
        ]);
      } else {
        // Clear all notifications
        await notificationManager.clearAllNotifications();
      }
    }
  };

  const handleMealTimeChange = async (mealType: 'breakfast' | 'lunch' | 'dinner', time: string) => {
    const success = await updateMealTime(mealType, time);
    if (success) {
      if (mealType === 'breakfast') setBreakfastTime(time);
      if (mealType === 'lunch') setLunchTime(time);
      if (mealType === 'dinner') setDinnerTime(time);

      // Reschedule notifications if enabled
      if (notificationEnabled) {
        await notificationManager.scheduleNotifications([
          { mealType: 'breakfast', time: mealType === 'breakfast' ? time : breakfastTime },
          { mealType: 'lunch', time: mealType === 'lunch' ? time : lunchTime },
          { mealType: 'dinner', time: mealType === 'dinner' ? time : dinnerTime },
        ]);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_profiles').upsert({
      id: user.id,
      email,
      display_name: displayName,
      target_calories: parseInt(targetCalories),
      target_protein: parseInt(targetProtein),
      target_fat: parseInt(targetFat),
      target_carbs: parseInt(targetCarbs),
      age: age ? parseInt(age) : null,
      height_cm: heightCm ? parseFloat(heightCm) : null,
      body_weight: bodyWeight ? parseFloat(bodyWeight) : null,
      gender,
      activity_level: activityLevel,
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
        {/* プロフィール */}
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

        {/* 体格情報 + 自動計算 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={18} className="text-purple-500" />
            <h2 className="font-bold text-gray-700">体格情報（目標自動計算）</h2>
          </div>

          {/* 性別 */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">性別</label>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${gender === g
                      ? 'gradient-primary text-white shadow-md'
                      : 'bg-gray-50 text-gray-500 border border-gray-100'
                    }`}
                >
                  {g === 'male' ? '👨 男性' : '👩 女性'}
                </button>
              ))}
            </div>
          </div>

          {/* 年齢 / 身長 / 体重 */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: '年齢', value: age, setter: setAge, unit: '歳' },
              { label: '身長', value: heightCm, setter: setHeightCm, unit: 'cm' },
              { label: '体重', value: bodyWeight, setter: setBodyWeight, unit: 'kg' },
            ].map(({ label, value, setter, unit }) => (
              <div key={label}>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block text-center">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="—"
                    className="w-full bg-purple-50 border-2 border-purple-100 focus:border-purple-400 rounded-xl px-3 py-2.5 text-center font-bold text-purple-700 outline-none transition-colors text-sm"
                  />
                  <span className="absolute right-2 bottom-1 text-[8px] text-gray-400">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 活動量 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">活動量</label>
            <div className="space-y-1.5">
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setActivityLevel(a.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all active:scale-[0.99] ${activityLevel === a.value
                      ? 'bg-purple-50 border-2 border-purple-300'
                      : 'bg-gray-50 border border-gray-100'
                    }`}
                >
                  <div>
                    <p className={`text-xs font-bold ${activityLevel === a.value ? 'text-purple-700' : 'text-gray-700'}`}>{a.label}</p>
                    <p className="text-[10px] text-gray-400">{a.desc}</p>
                  </div>
                  <span className={`text-[10px] font-bold ${activityLevel === a.value ? 'text-purple-500' : 'text-gray-300'}`}>×{a.factor}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 自動計算ボタン */}
          <button
            onClick={handleAutoCalc}
            disabled={!canCalc}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${calcFlash
                ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                : canCalc
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-200'
                  : 'bg-gray-100 text-gray-300'
              }`}
          >
            {calcFlash ? (
              <><CheckCircle size={16} /> 計算しました！</>
            ) : (
              <><Zap size={16} /> 最適な目標を自動計算</>
            )}
          </button>
          {!canCalc && (
            <p className="text-[10px] text-gray-400 text-center mt-1.5">年齢・身長・体重を入力すると計算できます</p>
          )}
        </div>

        {/* 通知設定 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-blue-500" />
            <h2 className="font-bold text-gray-700">食事リマインダー通知</h2>
          </div>

          <div className="space-y-4">
            {/* 通知オンオフ */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700">通知を有効にする</p>
                <p className="text-xs text-gray-400">毎日食事の時間にお知らせ</p>
              </div>
              <button
                onClick={() => handleNotificationToggle(!notificationEnabled)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ${
                  notificationEnabled ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    notificationEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {notificationEnabled && (
              <>
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {[
                    { label: '🍳 朝食', value: breakfastTime, setter: (t: string) => handleMealTimeChange('breakfast', t) },
                    { label: '🍱 昼食', value: lunchTime, setter: (t: string) => handleMealTimeChange('lunch', t) },
                    { label: '🍙 夕食', value: dinnerTime, setter: (t: string) => handleMealTimeChange('dinner', t) },
                  ].map(({ label, value, setter }) => (
                    <div key={label}>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
                      <input
                        type="time"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-400 rounded-xl px-4 py-3 text-sm font-bold text-blue-600 outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {permission === 'denied' && (
              <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3">
                通知がブロックされています。ブラウザの設定から通知を許可してください。
              </div>
            )}

            {permission === 'default' && notificationEnabled && (
              <div className="bg-yellow-50 text-yellow-600 text-sm rounded-xl px-4 py-3">
                通知許可のリクエストを承諾してください。
              </div>
            )}
          </div>
        </div>

        {/* カロリー & PFC 目標 */}
        <div className={`card transition-all duration-300 ${calcFlash ? 'ring-2 ring-purple-300 ring-offset-2' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-700">1日の目標</h2>
            <span className="text-[10px] text-gray-400 ml-auto">手動でも変更できます</span>
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
              {[
                { label: 'タンパク質', value: targetProtein, setter: setTargetProtein, bg: 'bg-blue-50', border: 'border-blue-100', focus: 'focus:border-blue-400', text: 'text-blue-600' },
                { label: '脂質', value: targetFat, setter: setTargetFat, bg: 'bg-yellow-50', border: 'border-yellow-100', focus: 'focus:border-yellow-400', text: 'text-yellow-600' },
                { label: '炭水化物', value: targetCarbs, setter: setTargetCarbs, bg: 'bg-green-50', border: 'border-green-100', focus: 'focus:border-green-400', text: 'text-green-600' },
              ].map(({ label, value, setter, bg, border, focus, text }) => (
                <div key={label}>
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block text-center">{label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className={`w-full ${bg} border-2 ${border} ${focus} rounded-xl px-3 py-2 text-center font-bold ${text} outline-none transition-colors`}
                    />
                    <span className="absolute right-2 bottom-1 text-[8px] text-gray-400">g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {saved ? (
            <><CheckCircle size={20} /> 保存しました！</>
          ) : saving ? (
            <><Loader2 size={20} className="animate-spin" /> 保存中...</>
          ) : (
            '設定を保存'
          )}
        </button>

        {/* ログアウト */}
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
