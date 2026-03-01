# 🍱 MealTrack — 食事記録＆健康トラッキングアプリ

AI（Gemini）が食事を分析し、カロリー・栄養素を推定。体重・集中力と合わせて週次で健康傾向をレポートします。

## 画面構成

| ホーム | 記録追加 | 週次レポート |
|--------|----------|--------------|
| 朝の記録カード（体重・集中力）| 写真 or テキストで入力 | カロリー・体重・集中力グラフ |
| 食事タイムライン（朝昼晩・間食）| Gemini AIでカロリー推定 | AI生成・今週の気づきコメント |
| カロリー進捗バー | 補足コメントで再計算 | 平均統計サマリー |

## 技術スタック

- **Next.js 14** App Router
- **Supabase** — 認証 + PostgreSQL + Storage
- **Gemini 1.5 Flash** — 食事写真認識・カロリー推定・AIコメント
- **Recharts** — グラフ描画
- **Tailwind CSS** — スタイリング（オレンジ/ピンク/グリーン系グラデーション）
- **Vercel** — ホスティング
- **PWA** — スマホホーム画面に追加可能

---

## Vercel へのデプロイ手順

### Step 1 — Supabase セットアップ

1. [supabase.com](https://supabase.com) でプロジェクトを新規作成
2. **SQL Editor** を開き、以下のファイルの内容を実行：
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. **Authentication → Providers → Email** が有効になっていることを確認
4. プロジェクトの **Settings → API** から以下をコピー：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2 — Gemini API キーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. **Create API key** をクリック
3. 取得したキーを `GEMINI_API_KEY` として使用

### Step 3 — Vercel にデプロイ

#### 方法A：GitHub連携（推奨）

1. このリポジトリを GitHub に push
2. [vercel.com](https://vercel.com) → **Add New Project**
3. GitHubリポジトリを選択してインポート
4. **Environment Variables** に以下を設定：

   | 変数名 | 値 |
   |--------|----|
   | `NEXT_PUBLIC_SUPABASE_URL` | SupabaseのProject URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseのanon key |
   | `GEMINI_API_KEY` | Google Gemini APIキー |

5. **Deploy** をクリック → 完了！

#### 方法B：Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

プロンプトに従って環境変数を設定してください。

---

## ローカル開発

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 環境変数ファイルを作成
cp .env.local.example .env.local
# .env.local を編集して各値を設定

# 3. 開発サーバー起動
npm run dev
```

→ http://localhost:3000 で開きます

### 必要な環境変数（.env.local）

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
GEMINI_API_KEY=AIzaSy...
```

---

## データベース構成

```sql
user_profiles   -- ユーザー設定（目標カロリーなど）
daily_records   -- 日次記録（体重・集中力・目標カロリー）
meal_records    -- 食事記録（種別・カロリー・栄養素・画像URL）
```

Supabase の **Row Level Security (RLS)** で各ユーザーは自分のデータのみアクセス可能。

### Storage

- バケット名：`meal-images`（SQL実行で自動作成）
- 5MB以下の JPEG/PNG/WebP/HEIC

---

## PWA インストール

スマホのブラウザでアクセス後、「ホーム画面に追加」バナーが表示されます。
インストール後はアプリとして起動できます。

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/           # 認証ページ（ログイン・登録）
│   ├── add/              # 食事記録追加
│   ├── report/           # 週次レポート
│   ├── settings/         # 設定
│   └── api/gemini/       # Gemini API ルート
├── components/           # UIコンポーネント
├── lib/
│   ├── hooks/            # カスタムフック
│   └── supabase/         # Supabaseクライアント
└── types/                # 型定義
supabase/migrations/      # DBマイグレーションSQL
```
