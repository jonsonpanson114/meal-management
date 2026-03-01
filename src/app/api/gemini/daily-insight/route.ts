import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import type { MealRecord } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const { meals }: { meals: MealRecord[] } = await req.json();

        if (!meals || meals.length === 0) {
            return NextResponse.json({ success: true, insight: '今日の食事を記録すると、AIがアドバイスをお届けします！' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'placeholder-gemini-key') {
            return NextResponse.json(
                { success: false, error: 'GEMINI_API_KEY が設定されていません。' },
                { status: 503 }
            );
        }

        const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
        const totalP = meals.reduce((s, m) => s + (m.protein || 0), 0);
        const totalF = meals.reduce((s, m) => s + (m.fat || 0), 0);
        const totalC = meals.reduce((s, m) => s + (m.carbs || 0), 0);
        const mealList = meals.map(m => m.description).join('、');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `あなたは親しみやすい健康アドバイザーAIです。ユーザーの今日の食事内容を見て、
短く（60〜80文字程度）、ポジティブで具体的なアドバイスを1つだけ送ってください。
専門用語は避け、友達のようなカジュアルなトーンで。

【今日の食事データ】
- 食べたもの: ${mealList}
- 合計カロリー: ${totalCalories}kcal
- タンパク質: ${totalP}g
- 脂質: ${totalF}g
- 炭水化物: ${totalC}g

アドバイスの例:
「お、昼の定食でタンパク質バッチリだね！夜は少し野菜を足すと、もっと体が喜ぶよ🌿」
「今日は間食が少し多めかな？夕食は軽めにして、胃を休めてあげよう🌙」`;

        const result = await model.generateContent(prompt);
        const insight = result.response.text().trim();

        return NextResponse.json({ success: true, insight });
    } catch (error) {
        console.error('Gemini daily insight error:', error);
        return NextResponse.json(
            { success: false, error: 'アドバイスの生成に失敗しました' },
            { status: 500 }
        );
    }
}
