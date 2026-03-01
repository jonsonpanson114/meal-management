'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { BarChart2, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import WeeklyCharts from '@/components/WeeklyCharts';
import { createClient } from '@/lib/supabase/client';
import type { WeeklyData, MealRecord, DailyRecord } from '@/types';

export default function ReportPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [aiComment, setAiComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingComment, setGeneratingComment] = useState(false);
  const supabase = createClient();

  const fetchWeeklyData = useCallback(async () => {
    setLoading(true);
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const [mealsResult, recordsResult] = await Promise.all([
      supabase
        .from('meal_records')
        .select('*')
        .gte('recorded_at', `${startDate}T00:00:00`)
        .lte('recorded_at', `${endDate}T23:59:59`)
        .order('recorded_at', { ascending: true }),
      supabase
        .from('daily_records')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate),
    ]);

    const meals = (mealsResult.data || []) as MealRecord[];
    const records = (recordsResult.data || []) as DailyRecord[];

    // Build 7-day array
    const days: WeeklyData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayMeals = meals.filter((m) => m.recorded_at.startsWith(dateStr));
      const dailyRecord = records.find((r) => r.date === dateStr);

      days.push({
        date: dateStr,
        total_calories: dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
        weight: dailyRecord?.weight ?? undefined,
        focus_level: dailyRecord?.focus_level ?? undefined,
        meals: dayMeals,
      });
    }

    setWeeklyData(days);
    setLoading(false);
  }, []);

  const generateAIComment = async () => {
    if (weeklyData.length === 0) return;
    setGeneratingComment(true);

    try {
      const summary = {
        avgCalories: Math.round(weeklyData.reduce((s, d) => s + d.total_calories, 0) / 7),
        weights: weeklyData.filter((d) => d.weight).map((d) => ({ date: d.date, weight: d.weight })),
        focusLevels: weeklyData.filter((d) => d.focus_level).map((d) => ({ date: d.date, focus: d.focus_level })),
        topFoods: weeklyData
          .flatMap((d) => d.meals.flatMap((m) => m.foods || []))
          .slice(0, 10)
          .map((f) => f.name),
      };

      const res = await fetch('/api/gemini/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      });
      const data = await res.json();
      if (data.success) {
        setAiComment(data.comment);
      }
    } catch {
      setAiComment('コメントの生成に失敗しました。');
    } finally {
      setGeneratingComment(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  useEffect(() => {
    if (!loading && weeklyData.some((d) => d.total_calories > 0)) {
      generateAIComment();
    }
  }, [loading]);

  // Stats
  const avgCalories = weeklyData.length
    ? Math.round(weeklyData.reduce((s, d) => s + d.total_calories, 0) / 7)
    : 0;
  const recordedDays = weeklyData.filter((d) => d.total_calories > 0).length;
  const avgFocus = weeklyData.filter((d) => d.focus_level).length
    ? (weeklyData.filter((d) => d.focus_level).reduce((s, d) => s + (d.focus_level || 0), 0) /
        weeklyData.filter((d) => d.focus_level).length).toFixed(1)
    : '-';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="gradient-purple w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
            <BarChart2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-gray-800">週次レポート</h1>
            <p className="text-xs text-gray-400">過去7日間の記録</p>
          </div>
        </div>
        <button
          onClick={fetchWeeklyData}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-medium">平均カロリー</p>
          <p className="text-lg font-black text-orange-500">{avgCalories.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400">kcal/日</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-medium">記録日数</p>
          <p className="text-lg font-black text-green-500">{recordedDays}</p>
          <p className="text-[10px] text-gray-400">日 / 7日</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 font-medium">平均集中力</p>
          <p className="text-lg font-black text-purple-500">{avgFocus}</p>
          <p className="text-[10px] text-gray-400">/ 5点</p>
        </div>
      </div>

      {/* AI Comment */}
      <div className="card mb-5 bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-orange-400" />
            <h3 className="text-sm font-bold text-orange-600">AIからの今週の気づき</h3>
          </div>
          <button
            onClick={generateAIComment}
            disabled={generatingComment}
            className="text-xs text-orange-400 font-bold active:scale-95 transition-transform"
          >
            <RefreshCw size={14} className={generatingComment ? 'animate-spin' : ''} />
          </button>
        </div>

        {generatingComment ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 size={16} className="animate-spin text-orange-400" />
            AIがあなたの記録を分析中...
          </div>
        ) : aiComment ? (
          <p className="text-sm text-gray-700 leading-relaxed">{aiComment}</p>
        ) : (
          <p className="text-sm text-gray-400">食事を記録するとAIがコメントします</p>
        )}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-48">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <WeeklyCharts data={weeklyData} />
      )}
    </div>
  );
}
