'use client';

import { useWeightHistory } from '@/lib/hooks/useWeightHistory';
import WeightChart from '@/components/WeightChart';
import { Scale, TrendingDown, TrendingUp, Minus, Calendar, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const { history, loading } = useWeightHistory(30);
  const router = useRouter();

  const stats = (() => {
    if (history.length < 2) return null;
    const weights = history.map(h => h.weight as number);
    const current = weights[weights.length - 1];
    const previous = weights[weights.length - 2];
    const diff = current - previous;
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const totalDiff = current - weights[0];

    return { current, diff, min, max, totalDiff };
  })();

  const weightData = history.map(h => ({ date: h.date, weight: h.weight as number }));

  return (
    <div className="page-container pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
          <Scale size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-800">レポート</h1>
          <p className="text-xs text-gray-400 font-medium">からだの推移をチェック</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm">
          <Loader2 className="animate-spin text-orange-500 mb-2" size={32} />
          <p className="text-sm text-gray-400 font-bold">データを読み込み中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Chart Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" />
                最近30日間の体重
              </h2>
              {stats && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${stats.totalDiff <= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                  {stats.totalDiff <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  全体で {Math.abs(stats.totalDiff).toFixed(1)}kg {stats.totalDiff <= 0 ? '減' : '増'}
                </div>
              )}
            </div>

            <WeightChart data={weightData} height={220} />
          </div>

          {/* Stats Grid */}
          {stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-orange-50/50 border-orange-100 flex flex-col items-center py-5">
                <p className="text-[10px] font-bold text-orange-400 mb-1 uppercase tracking-wider">最高体重</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">{stats.max.toFixed(1)}</span>
                  <span className="text-xs font-bold text-gray-400">kg</span>
                </div>
              </div>
              <div className="card bg-green-50/50 border-green-100 flex flex-col items-center py-5">
                <p className="text-[10px] font-bold text-green-400 mb-1 uppercase tracking-wider">最低体重</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">{stats.min.toFixed(1)}</span>
                  <span className="text-xs font-bold text-gray-400">kg</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-blue-50/50 border-blue-100 flex items-start gap-3 py-4">
              <Info size={18} className="text-blue-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-700">まずは2日分記録してみよう</p>
                <p className="text-[10px] text-blue-500/80 leading-relaxed mt-1">
                  体重の変化をグラフで見るには、2日以上の記録が必要です。
                </p>
              </div>
            </div>
          )}

          {/* Tips Card */}
          <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg shadow-indigo-100">
            <h3 className="font-black mb-1 flex items-center gap-2">
              <TrendingDown size={18} />
              スマートな減量のコツ
            </h3>
            <p className="text-[10px] leading-relaxed opacity-90 font-medium">
              体重の増減に一喜一憂しすぎないことが大切です。週に一度、このグラフの「全体的なトレンド」が下がっているかチェックしてみましょう！
            </p>
          </div>

          {stats && (
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white border-2 border-gray-100 text-gray-500 font-bold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              ホームに戻る
            </button>
          )}
        </div>
      )}
    </div>
  );
}
