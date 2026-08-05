'use client'

import { Package, Store, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppHeader({
  siteName,
  onOpenStores,
  onLogout,
}: {
  siteName: string
  onOpenStores: () => void
  onLogout: () => void
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-foreground">
              出荷指示管理システム
            </p>
            <p className="truncate text-xs text-muted-foreground">{siteName}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenStores}>
            <Store className="size-4" aria-hidden />
            <span className="hidden sm:inline">店舗マスタ</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="size-4" aria-hidden />
            <span className="hidden sm:inline">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
