'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setError('登録に失敗しました: ' + error.message);
    } else if (data.user) {
      // Insert profile
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        email,
        display_name: displayName,
        target_calories: 2000,
      });
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full">
          <span className="text-5xl block mb-4">🎉</span>
          <h2 className="font-black text-gray-800 text-xl mb-2">登録完了！</h2>
          <p className="text-gray-500 text-sm mb-6">
            確認メールを送信しました。<br />メールをご確認ください。
          </p>
          <Link
            href="/login"
            className="block gradient-primary text-white font-bold py-3 rounded-2xl text-center shadow-lg shadow-orange-200"
          >
            ログインへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="gradient-primary w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-200">
          <span className="text-4xl">🍱</span>
        </div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          MealTrack
        </h1>
        <p className="text-gray-500 text-sm mt-1">健康的な毎日を始めましょう</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-100 p-6">
        <h2 className="font-bold text-gray-700 mb-5">新規登録</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
              <User size={12} />
              ニックネーム
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: たろう"
              className="w-full bg-gray-50 border-2 border-gray-100 focus:border-orange-300 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Mail size={12} />
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-gray-50 border-2 border-gray-100 focus:border-orange-300 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Lock size={12} />
              パスワード（6文字以上）
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border-2 border-gray-100 focus:border-orange-300 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                登録中...
              </>
            ) : (
              '無料で始める'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-orange-500 font-bold hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
