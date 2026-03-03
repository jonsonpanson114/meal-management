import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface WeeklySummary {
  avgCalories: number;
  weights: { date: string; weight?: number }[];
  focusLevels: { date: string; focus?: number }[];
  topFoods: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { summary }: { summary: WeeklySummary } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder-gemini-key') {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY が設定されていません。Vercel の環境変数を確認してください。' },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const weightsStr = summary.weights.length
      ? summary.weights.map(w => `${w.date}: ${w.weight}kg`).join(', ')
      : 'データなし';

    const focusStr = summary.focusLevels.length
      ? summary.focusLevels.map(f => `${f.date}: ${f.focus}/5`).join(', ')
      : 'データなし';

    const foodsStr = summary.topFoods.length
      ? summary.topFoods.slice(0, 8).join('、')
      : 'データなし';

    const prompt = `あなたは健康アドバイザーAIです。以下のユーザーの1週間のデータを分析し、
日本語で励ましと気づきのコメントを150〜200字程度で生成してください。
専門的すぎず、友達のようなカジュアルで温かいトーンでお願いします。絵文字を使っても構いません。

【今週のデータ】
- 平均カロリー: ${summary.avgCalories}kcal/日
- 体重推移: ${weightsStr}
- 集中力推移: ${focusStr}
- よく食べた食事: ${foodsStr}

食事、体重、集中力の関係性についても言及してください。`;

    const result = await model.generateContent(prompt);
    const comment = result.response.text().trim();

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Gemini weekly report error:', error);
    return NextResponse.json(
      { success: false, error: 'レポートの生成に失敗しました' },
      { status: 500 }
    );
  }
}
