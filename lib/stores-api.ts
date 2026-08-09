import { supabase } from './supabase'
import type { Store } from './types'

// 店舗一覧を取得
export async function fetchStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: row.store_name,
    zipcode: row.zipcode,
    address: row.address,
  }))
}

// 店舗を新規登録
export async function createStore(input: {
  name: string
  zipcode: string
  address: string
}) {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      store_name: input.name,
      zipcode: input.zipcode,
      address: input.address,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 店舗情報を更新
export async function updateStore(
  id: string,
  input: { name: string; zipcode: string; address: string },
) {
  const { data, error } = await supabase
    .from('stores')
    .update({
      store_name: input.name,
      zipcode: input.zipcode,
      address: input.address,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 店舗を削除
export async function deleteStore(id: string) {
  const { error } = await supabase.from('stores').delete().eq('id', id)
  if (error) throw error
}