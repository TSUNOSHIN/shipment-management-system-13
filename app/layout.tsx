import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { SessionWatcher } from '@/components/session-watcher'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: '出荷指示管理システム',
  description: '物流倉庫の出荷業務を効率化する出荷指示管理システム',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} bg-background`}>
      <body className="antialiased font-sans">
        <SessionWatcher />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}