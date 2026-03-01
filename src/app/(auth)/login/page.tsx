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

        <div className="mt-4 text-center">
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
