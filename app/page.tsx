'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/app-header'
import { LoginScreen } from '@/components/login-screen'
import { ShipmentList } from '@/components/shipment-list'
import { ShipmentForm } from '@/components/shipment-form'
import { StoreMaster } from '@/components/store-master'
import type { Shipment, ShipmentStatus, Store } from '@/lib/types'
import { canTransition } from '@/lib/shipment-utils'
import { supabase } from '@/lib/supabase'
import {
  fetchShipments,
  createShipment,
  updateShipmentStatus,
  deleteShipment,
} from '@/lib/shipments-api'
import { fetchStores, createStore, updateStore, deleteStore } from '@/lib/stores-api'

type Screen = 'list' | 'create' | 'stores'

export default function Page() {
  const [siteName, setSiteName] = useState<string | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [screen, setScreen] = useState<Screen>('list')
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')

  // ページ読み込み時に、既存のログインセッションがあるか確認する
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        setSiteName(session.user.email)
        await loadLocationId(session.user.email)
      }
      setCheckingSession(false)
    })
  }, [])

  // ログイン中ユーザーのメールアドレスから、拠点IDを取得する
  async function loadLocationId(email: string) {
    const { data, error } = await supabase
      .from('locations')
      .select('id')
      .eq('email', email)
      .single()

    if (!error && data) {
      setLocationId(data.id)
    }
  }

  // ログイン後、拠点IDが確定したら出荷指示・店舗データを読み込む
  useEffect(() => {
    if (!locationId) return
    loadAllData()
  }, [locationId])

  async function loadAllData() {
    setDataLoading(true)
    setDataError('')
    try {
      const [shipmentsData, storesData] = await Promise.all([fetchShipments(), fetchStores()])
      setShipments(shipmentsData)
      setStores(storesData)
    } catch (err) {
      setDataError('データの取得に失敗しました。')
      console.error(err)
    } finally {
      setDataLoading(false)
    }
  }

  // --- 認証 ---
  async function handleLogin(name: string) {
    setSiteName(name)
    await loadLocationId(name)
    setScreen('list')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSiteName(null)
    setLocationId(null)
    setShipments([])
    setStores([])
    setScreen('list')
  }

  // --- 出荷指示 ---
  async function handleCreateShipment(data: Omit<Shipment, 'id' | 'status'>) {
    if (!locationId) return
    await createShipment({
      locationId,
      storeId: data.storeId,
      type: data.type,
      arrivalTime: data.arrivalTime,
      quantity: 1,
    })
    await loadAllData()
    setScreen('list')
  }

  // ステータス変更（順方向のみ許可。逆順・スキップは false を返す）
  function handleChangeStatus(id: string, to: ShipmentStatus): boolean {
    const target = shipments.find((s) => s.id === id)
    if (!target || !canTransition(target.status, to)) return false
    updateShipmentStatus(id, to).then(() => loadAllData())
    return true
  }

  async function handleDeleteShipment(id: string) {
    await deleteShipment(id)
    await loadAllData()
  }

  // --- 店舗マスタ ---
  async function handleAddStore(data: Omit<Store, 'id'>) {
    await createStore(data)
    await loadAllData()
  }

  async function handleUpdateStore(updated: Store) {
    await updateStore(updated.id, updated)
    await loadAllData()
  }

  async function handleDeleteStore(id: string) {
    await deleteStore(id)
    await loadAllData()
  }

  // セッション確認中は、ログイン画面を一瞬表示してしまわないよう待機
  if (checkingSession) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </main>
    )
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

      {dataError && (
        <p className="mx-auto max-w-3xl px-4 pt-4 text-sm font-medium text-destructive">
          {dataError}
        </p>
      )}

      {dataLoading ? (
        <p className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
          読み込み中...
        </p>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}