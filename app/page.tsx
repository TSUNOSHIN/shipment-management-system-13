'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { LoginScreen } from '@/components/login-screen'
import { ShipmentList } from '@/components/shipment-list'
import { ShipmentForm } from '@/components/shipment-form'
import { StoreMaster } from '@/components/store-master'
import { MOCK_SHIPMENTS, MOCK_STORES } from '@/lib/mock-data'
import type { Shipment, ShipmentStatus, Store } from '@/lib/types'
import { canTransition } from '@/lib/shipment-utils'

type Screen = 'list' | 'create' | 'stores'

export default function Page() {
  const [siteName, setSiteName] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('list')
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS)
  const [stores, setStores] = useState<Store[]>(MOCK_STORES)

  // --- 認証（ダミー） ---
  function handleLogin(name: string) {
    setSiteName(name)
    setScreen('list')
  }

  function handleLogout() {
    setSiteName(null)
    setScreen('list')
  }

  // --- 出荷指示 ---
  function handleCreateShipment(data: Omit<Shipment, 'id' | 'status'>) {
    const newShipment: Shipment = {
      ...data,
      id: `sh-${Date.now()}`,
      status: 'prep',
    }
    setShipments((prev) => [...prev, newShipment])
    setScreen('list')
  }

  // ステータス変更（順方向のみ許可。逆順・スキップは false を返す）
  function handleChangeStatus(id: string, to: ShipmentStatus): boolean {
    const target = shipments.find((s) => s.id === id)
    if (!target || !canTransition(target.status, to)) return false
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, status: to } : s)))
    return true
  }

  function handleDeleteShipment(id: string) {
    setShipments((prev) => prev.filter((s) => s.id !== id))
  }

  // --- 店舗マスタ ---
  function handleAddStore(data: Omit<Store, 'id'>) {
    setStores((prev) => [...prev, { ...data, id: `store-${Date.now()}` }])
  }

  function handleUpdateStore(updated: Store) {
    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    // 既存の出荷指示にも店舗名を反映
    setShipments((prev) =>
      prev.map((s) =>
        s.storeId === updated.id ? { ...s, storeName: updated.name } : s,
      ),
    )
  }

  function handleDeleteStore(id: string) {
    setStores((prev) => prev.filter((s) => s.id !== id))
  }

  if (!siteName) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader
        siteName={siteName}
        onOpenStores={() => setScreen('stores')}
        onLogout={handleLogout}
      />

      {screen === 'list' && (
        <ShipmentList
          shipments={shipments}
          onCreate={() => setScreen('create')}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDeleteShipment}
        />
      )}

      {screen === 'create' && (
        <ShipmentForm
          stores={stores}
          onBack={() => setScreen('list')}
          onSubmit={handleCreateShipment}
        />
      )}

      {screen === 'stores' && (
        <StoreMaster
          stores={stores}
          onBack={() => setScreen('list')}
          onAdd={handleAddStore}
          onUpdate={handleUpdateStore}
          onDelete={handleDeleteStore}
        />
      )}
    </div>
  )
}
