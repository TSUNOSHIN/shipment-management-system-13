import { supabase } from './supabase'
import type { Shipment, ShipmentStatus, ShipmentType } from './types'

// 出荷指示一覧を取得（店舗情報もあわせて取得）
export async function fetchShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*, stores(store_name, zipcode, address)')
    .order('arrival_time', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    storeId: row.store_id,
    storeName: row.stores?.store_name ?? '',
    zipcode: row.stores?.zipcode ?? '',
    address: row.stores?.address ?? '',
    type: row.shipment_type as ShipmentType,
    arrivalTime: row.arrival_time,
    status: row.status as ShipmentStatus,
  }))
}

// 出荷指示を新規作成
export async function createShipment(input: {
  locationId: string
  storeId: string
  type: ShipmentType
  arrivalTime: string
  quantity: number
}) {
  const { data, error } = await supabase
    .from('shipments')
    .insert({
      location_id: input.locationId,
      store_id: input.storeId,
      shipment_type: input.type,
      arrival_time: input.arrivalTime,
      quantity: input.quantity,
      status: 'prep',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ステータスを更新
export async function updateShipmentStatus(id: string, status: ShipmentStatus) {
  const { data, error } = await supabase
    .from('shipments')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 出荷指示を削除
export async function deleteShipment(id: string) {
  const { error } = await supabase.from('shipments').delete().eq('id', id)
  if (error) throw error
}