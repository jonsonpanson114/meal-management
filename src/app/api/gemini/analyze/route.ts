import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import type { NutritionInfo, GeminiAnalysisRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: GeminiAnalysisRequest = await req.json();
    const { imageBase64, description, userComment } = body;

    if (!imageBase64 && !description) {
      return NextResponse.json({ success: false, error: '画像またはテキストが必要です' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'APIキーが設定されていません' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const basePrompt = `あなたは栄養士AIです。${
      description ? `食事の説明: "${description}"` : '提供された写真'
    }${userComment ? `\nユーザーの補足: "${userComment}"` : ''}

この食事の内容とカロリーを推定し、以下のJSON形式のみで返してください。説明文やコードブロックは不要です。

{
  "calories": 推定カロリー(整数),
  "protein": タンパク質(g, 整数),
  "fat": 脂質(g, 整数),
  "carbs": 炭水化物(g, 整数),
  "foods": [{"name": "食材名", "calories": カロリー}, ...],
  "description": "食事の簡単な説明（日本語、1〜2文）"
}`;

    let result;
    if (imageBase64) {
      result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        basePrompt,
      ]);
    } else {
      result = await model.generateContent(basePrompt);
    }

    const text = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSONが見つかりません');
    }

    const nutritionData: NutritionInfo = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, data: nutritionData });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { success: false, error: '食事の分析に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
