'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, BarChart2 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'ホーム' },
  { href: '/add', icon: PlusCircle, label: '記録', primary: true },
  { href: '/report', icon: BarChart2, label: 'レポート' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex items-center justify-around px-4 h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label, primary }) => {
          const isActive = pathname === href;
          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center -mt-6"
              >
                <span className="gradient-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-orange-200 active:scale-95 transition-transform">
                  <Icon size={28} strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-orange-500 mt-1">{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-2 px-4 active:scale-95 transition-transform"
            >
              <Icon
                size={24}
                className={isActive ? 'text-orange-500' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-semibold ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
