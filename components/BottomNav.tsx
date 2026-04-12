'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'ホーム', emoji: '🏠' },
  { href: '/shopping', label: '買い物', emoji: '🛒' },
  { href: '/kids', label: '子供', emoji: '👶' },
  { href: '/setup', label: '設定', emoji: '⚙️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-2xl mb-1">{item.emoji}</span>
              <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
