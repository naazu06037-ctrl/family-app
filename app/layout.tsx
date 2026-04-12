import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: '家族アプリ',
  description: '家族で共有するスケジュール・買い物・子供情報アプリ',
  manifest: '/manifest.json',
  themeColor: '#4f7cff',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <main className="max-w-lg mx-auto min-h-screen">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
