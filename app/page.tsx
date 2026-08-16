'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/app-header'
import { LoginScreen } from '@/components/login-screen'
import { ShipmentList } from '@/components/shipment-list'
import { ShipmentForm } from '@/components/shipment-form'
import { StoreMaster } from '@/components/store-master'
import { ConfirmDialog } from '@/components/confirm-dialog'
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
type PendingDelete = { type: 'shipment' | 'store'; id: string } | null

export default function Page() {
  const [siteName, setSiteName] = useState<string | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [screen, setScreen] = useState<Screen>('list')
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        await loadLocationId(session.user.email)
      }
      setCheckingSession(false)
    })
  }, [])

  async function loadLocationId(email: string) {
    const { data, error } = await supabase
      .from('locations')
      .select('id, location_name')
      .eq('email', email)
      .single()

    if (!error && data) {
      setLocationId(data.id)
      setSiteName(data.location_name)
    } else {
      setSiteName(email)
    }
  }

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

  async function handleLogin(name: string) {
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

  function handleChangeStatus(id: string, to: ShipmentStatus): boolean {
    const target = shipments.find((s) => s.id === id)
    if (!target || !canTransition(target.status, to)) return false
    updateShipmentStatus(id, to).then(() => loadAllData())
    return true
  }

  function handleRequestDeleteShipment(id: string) {
    setPendingDelete({ type: 'shipment', id })
  }

  function handleRequestDeleteStore(id: string) {
    setPendingDelete({ type: 'store', id })
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    if (pendingDelete.type === 'shipment') {
      await deleteShipment(pendingDelete.id)
    } else {
      await deleteStore(pendingDelete.id)
    }
    setPendingDelete(null)
    await loadAllData()
  }

  async function handleAddStore(data: Omit<Store, 'id'>) {
    await createStore(data)
    await loadAllData()
  }

  async function handleUpdateStore(updated: Store) {
    await updateStore(updated.id, updated)
    await loadAllData()
  }

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
              onDelete={handleRequestDeleteShipment}
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
              onDelete={handleRequestDeleteStore}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.type === 'store' ? '店舗を削除しますか？' : '出荷指示を削除しますか？'}
        message={
          pendingDelete?.type === 'store'
            ? '関連する出荷指示がある場合、表示に影響する可能性があります。この操作は取り消せません。'
            : 'この操作は取り消せません。'
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}