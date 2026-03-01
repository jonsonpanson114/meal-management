'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';
import PWAInstallPrompt from './PWAInstallPrompt';

const AUTH_PATHS = ['/login', '/register'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      {children}
      {!isAuthPage && <BottomNav />}
      {!isAuthPage && <PWAInstallPrompt />}
    </>
  );
}
