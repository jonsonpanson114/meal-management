'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-[448px] mx-auto bg-white rounded-2xl shadow-xl border border-orange-100 p-4 z-40 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🍱</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">ホーム画面に追加</p>
          <p className="text-xs text-gray-500 mt-0.5">MealTrackをアプリとして使えます！</p>
          <button
            onClick={handleInstall}
            className="mt-2 gradient-primary text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-200"
          >
            <Download size={12} />
            インストール
          </button>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-gray-300 hover:text-gray-500 active:scale-95 transition-transform"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
