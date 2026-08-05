'use client'

import { useState } from 'react'
import { Package, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOCK_ACCOUNT } from '@/lib/mock-data'

export function LoginScreen({ onLogin }: { onLogin: (siteName: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // ダミー認証: モックアカウントと一致すればログイン成功
    if (email.trim() === MOCK_ACCOUNT.email && password === MOCK_ACCOUNT.password) {
      setError('')
      onLogin(MOCK_ACCOUNT.siteName)
    } else {
      setError('メールアドレスまたはパスワードが正しくありません。')
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Package className="size-7" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-balance">出荷指示管理システム</h1>
          <p className="mt-1 text-sm text-muted-foreground">拠点アカウントでログインしてください</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanaka@kao-logistics.jp"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="h-11 w-full text-base">
              <LogIn className="size-4" aria-hidden />
              ログイン
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          デモ用: {MOCK_ACCOUNT.email} / password
        </p>
      </div>
    </main>
  )
}
