'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SHIPMENT_TYPE_LABEL, type Shipment, type ShipmentType, type Store } from '@/lib/types'
import { mockLookupAddress } from '@/lib/mock-data'

export function ShipmentForm({
  stores,
  onBack,
  onSubmit,
}: {
  stores: Store[]
  onBack: () => void
  onSubmit: (data: Omit<Shipment, 'id' | 'status'>) => void
}) {
  const [storeId, setStoreId] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [address, setAddress] = useState('')
  const [type, setType] = useState<ShipmentType>('kon')
  const [arrivalTime, setArrivalTime] = useState('')
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState('')

  function handleStoreChange(id: string) {
    setStoreId(id)
    const store = stores.find((s) => s.id === id)
    if (store) {
      setZipcode(store.zipcode)
      setAddress(store.address)
    }
  }

  async function handleLookup() {
    if (!zipcode.trim()) return
    if (!/^\d{7}$/.test(zipcode.trim())) {
      setError('郵便番号は半角数字7桁で入力してください。')
      return
    }
    setLooking(true)
    const result = await mockLookupAddress(zipcode)
    setAddress(result)
    setLooking(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const store = stores.find((s) => s.id === storeId)
    if (!store) {
      setError('店舗を選択してください。')
      return
    }

    if (!zipcode.trim() || !/^\d{7}$/.test(zipcode.trim())) {
      setError('郵便番号は半角数字7桁で入力してください。')
      return
    }

    if (!address.trim()) {
      setError('住所を入力してください。')
      return
    }

    if (!arrivalTime) {
      setError('到着時間を入力してください。')
      return
    }

    if (new Date(arrivalTime).getTime() <= Date.now()) {
      setError('到着時間は現在より未来の日時を指定してください。')
      return
    }

    onSubmit({
      storeId: store.id,
      storeName: store.name,
      zipcode,
      address,
      type,
      arrivalTime: new Date(arrivalTime).toISOString(),
    })
  }

  const inputClass =
    'h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        一覧に戻る
      </button>

      <h2 className="mb-4 text-lg font-bold text-foreground">出荷指示の新規作成</h2>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <label htmlFor="store" className="mb-1.5 block text-sm font-medium text-foreground">
            店舗
          </label>
          <select
            id="store"
            value={storeId}
            onChange={(e) => handleStoreChange(e.target.value)}
            className={inputClass}
            required
          >
            <option value="" disabled>
              店舗を選択
            </option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="zipcode" className="mb-1.5 block text-sm font-medium text-foreground">
            郵便番号
          </label>
          <div className="flex gap-2">
            <input
              id="zipcode"
              type="text"
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
          <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-foreground">
            住所
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="郵便番号から自動入力されます"
            className={inputClass}
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">出荷種別</span>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(SHIPMENT_TYPE_LABEL) as ShipmentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={
                  'h-11 rounded-lg border text-sm font-medium transition-colors ' +
                  (type === t
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground hover:border-primary/50')
                }
              >
                {SHIPMENT_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="arrival" className="mb-1.5 block text-sm font-medium text-foreground">
            到着時間
          </label>
          <input
            id="arrival"
            type="datetime-local"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" className="h-11 w-full text-base">
          登録する
        </Button>
      </form>
    </div>
  )
}