'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import type { MealRecord } from '@/types';

interface Props {
    meals: MealRecord[];
}

export default function DailyInsightCard({ meals }: Props) {
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchInsight = async () => {
        if (meals.length === 0) {
            setInsight('食事を記録すると、AIが今日のアドバイスを教えてくれるよ！✨');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/gemini/daily-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meals }),
            });
            const data = await res.json();
            if (data.success) {
                setInsight(data.insight);
            }
        } catch (error) {
            console.error('Failed to fetch insight:', error);
            setInsight('また後で試してみてね！');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (meals.length > 0 && !insight) {
            fetchInsight();
        }
    }, [meals.length]);

    return (
        <div className="card bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-orange-400" />
                    <h3 className="text-sm font-bold text-orange-600">今日のアドバイス</h3>
                </div>
                <button
                    onClick={fetchInsight}
                    disabled={loading || meals.length === 0}
                    className="text-gray-400 hover:text-orange-400 transition-colors disabled:opacity-30"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
                    <Loader2 size={14} className="animate-spin text-orange-400" />
                    AIが分析中...
                </div>
            ) : (
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {insight || '記録を始めよう！'}
                </p>
            )}
        </div>
    );
}
