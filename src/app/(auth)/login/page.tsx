'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません');
    } else {
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError('Googleログインに失敗しました: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="gradient-primary w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-200 animate-pulse-scale">
          <span className="text-4xl">🍱</span>
        </div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          MealTrack
        </h1>
        <p className="text-gray-500 text-sm mt-1">食事記録で健康な毎日を</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={18} className="text-orange-400" />
          <h2 className="font-bold text-gray-700">ログイン</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              パスワード
            </label>
            <input
              type="password"
              required
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
                ログイン中...
              </>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">または</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-3 rounded-2xl shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-3 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Googleでログイン
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            アカウントをお持ちでない方は{' '}
            <Link href="/register" className="text-orange-500 font-bold hover:underline">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
