// 出荷種別: 梱出荷（梱包出荷）/ バラ出荷
export type ShipmentType = 'kon' | 'bara'

// 出荷ステータス: 準備中 → 指示済み → 完了
export type ShipmentStatus = 'prep' | 'instructed' | 'done'

export interface Store {
  id: string
  name: string
  zipcode: string
  address: string
}

export interface Shipment {
  id: string
  storeId: string
  storeName: string
  zipcode: string
  address: string
  type: ShipmentType
  // 到着時間 (ISO文字列)
  arrivalTime: string
  status: ShipmentStatus
}

export interface Account {
  email: string
  password: string
  // 拠点名
  siteName: string
}

export const SHIPMENT_TYPE_LABEL: Record<ShipmentType, string> = {
  kon: '梱出荷',
  bara: 'バラ出荷',
}

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  prep: '準備中',
  instructed: '指示済み',
  done: '完了',
}

// ステータス遷移の順序（この順にしか進められない）
export const STATUS_ORDER: ShipmentStatus[] = ['prep', 'instructed', 'done']
