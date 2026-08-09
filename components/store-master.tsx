'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Pencil, Search, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Store } from '@/lib/types'
import { mockLookupAddress } from '@/lib/mock-data'

const inputClass =
  'h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'

function validateStore(data: { name: string; zipcode: string; address: string }): string {
  if (!data.name.trim()) return '店舗名を入力してください。'
  if (data.name.trim().length > 50) return '店舗名は50文字以内で入力してください。'
  if (!data.zipcode.trim()) return '郵便番号を入力してください。'
  if (!/^\d{7}$/.test(data.zipcode.trim())) return '郵便番号は半角数字7桁で入力してください。'
  if (!data.address.trim()) return '住所を入力してください。'
  return ''
}

export function StoreMaster({
  stores,
  onBack,
  onAdd,
  onUpdate,
  onDelete,
}: {
  stores: Store[]
  onBack: () => void
  onAdd: (data: Omit<Store, 'id'>) => void
  onUpdate: (store: Store) => void
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [address, setAddress] = useState('')
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Store | null>(null)
  const [editError, setEditError] = useState('')

  async function handleLookup() {
    if (!zipcode.trim()) return
    if (!/^\d{7}$/.test(zipcode.trim())) {
      setError('郵便番号は半角数字7桁で入力してください。')
      return
    }
    setLooking(true)
    setAddress(await mockLookupAddress(zipcode))
    setLooking(false)
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const data = { name: name.trim(), zipcode: zipcode.trim(), address: address.trim() }
    const message = validateStore(data)
    if (message) {
      setError(message)
      return
    }
    setError('')
    onAdd(data)
    setName('')
    setZipcode('')
    setAddress('')
  }

  function handleSaveEdit() {
    if (!editing) return
    const message = validateStore(editing)
    if (message) {
      setEditError(message)
      return
    }
    setEditError('')
    onUpdate(editing)
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        一覧に戻る
      </button>

      <h2 className="mb-4 text-lg font-bold text-foreground">店舗マスタ管理</h2>

      {/* 新規登録フォーム */}
      <form onSubmit={handleAdd} className="mb-6 space-y-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-bold text-foreground">店舗の新規登録</p>
        <div>
          <label htmlFor="s-name" className="mb-1.5 block text-sm font-medium text-foreground">
            店舗名
          </label>
          <input
            id="s-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="新宿東口店"
            maxLength={50}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="s-zip" className="mb-1.5 block text-sm font-medium text-foreground">
            郵便番号
          </label>
          <div className="flex gap-2">
            <input
              id="s-zip"
              inputMode="numeric"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              placeholder="1600022"
              maxLength={7}
              className={inputClass}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleLookup}
              disabled={looking}
              className="h-11 shrink-0 px-3"
            >
              {looking ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Search className="size-4" aria-hidden />
              )}
              住所検索
            </Button>
          </div>
        </div>
        <div>
          <label htmlFor="s-addr" className="mb-1.5 block text-sm font-medium text-foreground">
            住所
          </label>
          <input
            id="s-addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="東京都新宿区新宿3丁目"
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" className="h-11 w-full text-base">
          登録する
        </Button>
      </form>

      {/* 登録済み店舗一覧 */}
      <p className="mb-2 text-sm font-bold text-foreground">
        登録済み店舗（{stores.length}件）
      </p>
      <ul className="space-y-2">
        {stores.map((store) =>
          editing?.id === store.id ? (
            <EditRow
              key={store.id}
              store={editing}
              error={editError}
              onChange={setEditing}
              onCancel={() => {
                setEditing(null)
                setEditError('')
              }}
              onSave={handleSaveEdit}
            />
          ) : (
            <li
              key={store.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">{store.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  〒{store.zipcode} {store.address}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  setEditing({ ...store })
                  setEditError('')
                }}
              >
                <Pencil className="size-4" aria-hidden />
                <span className="sr-only">編集</span>
              </Button>
              <Button variant="destructive" size="icon-sm" onClick={() => onDelete(store.id)}>
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">削除</span>
              </Button>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}

function EditRow({
  store,
  error,
  onChange,
  onCancel,
  onSave,
}: {
  store: Store
  error: string
  onChange: (s: Store) => void
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <li className="space-y-2 rounded-xl border border-primary/40 bg-card px-4 py-3">
      <input
        value={store.name}
        onChange={(e) => onChange({ ...store, name: e.target.value })}
        placeholder="店舗名"
        maxLength={50}
        className={inputClass}
      />
      <input
        value={store.zipcode}
        onChange={(e) => onChange({ ...store, zipcode: e.target.value })}
        placeholder="郵便番号"
        maxLength={7}
        className={inputClass}
      />
      <input
        value={store.address}
        onChange={(e) => onChange({ ...store, address: e.target.value })}
        placeholder="住所"
        className={inputClass}
      />
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="size-4" aria-hidden />
          キャンセル
        </Button>
        <Button size="sm" onClick={onSave}>
          <Check className="size-4" aria-hidden />
          保存
        </Button>
      </div>
    </li>
  )
}