import { supabase } from './supabase'
import type { Shipment, ShipmentStatus } from './types'

// 出荷指示一覧を取得
export async function fetchShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .order('arrival_time', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    locationId: row.location_id,
    storeId: row.store_id,
    shipmentType: row.shipment_type,
    arrivalTime: row.arrival_time,
    status: row.status,
    quantity: row.quantity,
    createdAt: row.created_at,
  })) as Shipment[]
}

// 出荷指示を新規作成
export async function createShipment(input: {
  locationId: string
  storeId: string
  shipmentType: string
  arrivalTime: string
  quantity: number
}) {
  const { data, error } = await supabase
    .from('shipments')
    .insert({
      location_id: input.locationId,
      store_id: input.storeId,
      shipment_type: input.shipmentType,
      arrival_time: input.arrivalTime,
      quantity: input.quantity,
      status: '準備中',
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