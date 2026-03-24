'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Sparkles, RefreshCw, Send, Loader2 } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import NutritionCard from '@/components/NutritionCard';
import { createClient } from '@/lib/supabase/client';
import type { MealType, NutritionInfo } from '@/types';
import { MEAL_TYPE_LABELS, MEAL_TYPE_COLORS } from '@/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function AddMealPage() {
  const router = useRouter();
  const supabase = createClient();

  const [imageBase64, setImageBase64] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [description, setDescription] = useState('');
  const [userComment, setUserComment] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [quickCalories, setQuickCalories] = useState<number | null>(null);
  const [quickAnalyzing, setQuickAnalyzing] = useState(false);
  const [manualCaloriesText, setManualCaloriesText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-estimate calories as user types (text only)
  useEffect(() => {
    if (imageBase64 || !description.trim()) {
      setQuickCalories(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setQuickAnalyzing(true);
      try {
        const res = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success && !controller.signal.aborted) {
          setQuickCalories(data.data.calories);
        }
      } catch {
        // ignore abort errors
      } finally {
        if (!controller.signal.aborted) setQuickAnalyzing(false);
      }
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [description, imageBase64]);

  const handleAnalyze = async (isReanalysis = false) => {
    if (!imageBase64 && !description) {
      setError('写真またはテキストを入力してください');
      return;
    }
    setError('');
    setAnalyzing(true);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          description,
          userComment: isReanalysis ? userComment : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNutrition(data.data);
      } else {
        setError(data.error || '分析に失敗しました');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('ネットワークエラーまたは分析エラーが発生しました: ' + (err.message || 'Unknown error'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!nutrition && !description) {
      setError('内容を入力してください');
      return;
    }
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      let imageUrl = '';
      if (imageBase64) {
        const blob = await fetch(`data:image/jpeg;base64,${imageBase64}`).then(r => r.blob());
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { data: uploadData } = await supabase.storage
          .from('meal-images')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('meal-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      const now = new Date().toISOString();
      const record = {
        user_id: user.id,
        meal_type: mealType,
        description: description || nutrition?.foods?.map(f => f.name).join('、') || '食事',
        calories: nutrition?.calories || 0,
        protein: nutrition?.protein,
        fat: nutrition?.fat,
        carbs: nutrition?.carbs,
        foods: nutrition?.foods,
        image_url: imageUrl || undefined,
        recorded_at: now,
      };

      const { error: dbError } = await supabase.from('meal_records').insert(record);
      if (dbError) {
        console.error('Database error:', dbError);
        setError('記録の保存に失敗しました（データベースエラー）: ' + dbError.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setError('保存プロセス中にエラーが発生しました: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="font-black text-gray-800">食事を記録</h1>
          <p className="text-xs text-gray-400">写真かテキストで簡単記録</p>
        </div>
      </div>

      {/* Meal Type Selector */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-medium mb-2">食事の種類</p>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((type) => {
            const isSelected = mealType === type;
            const gradient = MEAL_TYPE_COLORS[type];
            return (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${isSelected
                    ? `bg-gradient-to-b ${gradient} text-white shadow-md`
                    : 'bg-white text-gray-500 shadow-sm'
                  }`}
              >
                {MEAL_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-medium mb-2">写真（任意）</p>
        <PhotoUpload
          preview={imagePreview}
          onImageSelected={(base64, preview) => {
            setImageBase64(base64);
            setImagePreview(preview);
            setNutrition(null);
          }}
          onClear={() => {
            setImageBase64('');
            setImagePreview('');
            setNutrition(null);
          }}
        />
      </div>

      {/* Text Description */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-medium mb-2">食事の説明（任意）</p>
        <textarea
          placeholder="例: ざるそば、天ぷら盛り合わせ"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setNutrition(null); }}
          rows={2}
          className="w-full bg-white border-2 border-gray-100 focus:border-orange-300 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors resize-none shadow-sm"
        />
        {/* Quick calorie estimate badge */}
        {!imageBase64 && !nutrition && description.trim() && (
          <div className="mt-2 flex items-center gap-1.5">
            {quickAnalyzing ? (
              <span className="inline-flex items-center gap-1 text-xs text-orange-400 font-medium">
                <Loader2 size={12} className="animate-spin" />
                カロリーを計算中...
              </span>
            ) : quickCalories !== null ? (
              <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-100">
                <Sparkles size={11} />
                約 {quickCalories} kcal
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      {!nutrition && (
        <button
          onClick={() => handleAnalyze(false)}
          disabled={analyzing || (!imageBase64 && !description)}
          className={`w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 mb-4 ${analyzing || (!imageBase64 && !description)
              ? 'bg-gray-200 text-gray-400 shadow-none'
              : 'gradient-primary shadow-orange-200'
            }`}
        >
          {analyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              AI分析中...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              AIで栄養分析
            </>
          )}
        </button>
      )}

      {/* Nutrition Result */}
      {nutrition && (
        <div className="mb-4">
          <NutritionCard data={nutrition} />

          {/* Re-analysis comment */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 font-medium mb-2">補足コメント（再計算）</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例: 大盛りで食べた、ドレッシングあり"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="flex-1 bg-white border-2 border-gray-100 focus:border-orange-300 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors shadow-sm"
              />
              <button
                onClick={() => handleAnalyze(true)}
                disabled={analyzing}
                className="gradient-green text-white px-4 rounded-xl font-bold flex items-center gap-1 shadow-md active:scale-95 transition-transform"
              >
                {analyzing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual calorie input */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-medium mb-2">手動でカロリーを入力（AIを使わない場合はこちら）</p>
        <input
          type="number"
          placeholder="例: 500"
          value={manualCaloriesText}
          className="w-full bg-white border-2 border-gray-100 focus:border-orange-300 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors shadow-sm"
          onChange={(e) => {
            const val = e.target.value;
            setManualCaloriesText(val);
            const cal = parseInt(val);
            if (!isNaN(cal)) {
              setNutrition({ calories: cal, protein: 0, fat: 0, carbs: 0, foods: [] });
            } else {
              setNutrition(null);
            }
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || (!nutrition && !description)}
        className={`w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-base ${saving || (!nutrition && !description)
            ? 'bg-gray-200 text-gray-400 shadow-none'
            : 'gradient-primary shadow-orange-200'
          }`}
      >
        {saving ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            保存中...
          </>
        ) : (
          <>
            <Send size={20} />
            記録を保存する
          </>
        )}
      </button>
    </div>
  );
}
