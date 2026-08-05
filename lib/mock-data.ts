import type { Account, Shipment, Store } from './types'

// ダミーの拠点アカウント（本物のログイン判定は後で実装）
export const MOCK_ACCOUNT: Account = {
  email: 'tanaka@kao-logistics.jp',
  password: 'password',
  siteName: '関東物流センター',
}

export const MOCK_STORES: Store[] = [
  { id: 's1', name: '新宿東口店', zipcode: '1600022', address: '東京都新宿区新宿3丁目' },
  { id: 's2', name: '横浜みなとみらい店', zipcode: '2200012', address: '神奈川県横浜市西区みなとみらい2丁目' },
  { id: 's3', name: '大宮西口店', zipcode: '3300854', address: '埼玉県さいたま市大宮区桜木町1丁目' },
  { id: 's4', name: '千葉中央店', zipcode: '2600028', address: '千葉県千葉市中央区新町1丁目' },
]

// 現在時刻を基準に相対的な到着時間を生成する
function offsetFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'sh1',
    storeId: 's1',
    storeName: '新宿東口店',
    zipcode: '1600022',
    address: '東京都新宿区新宿3丁目',
    type: 'kon',
    arrivalTime: offsetFromNow(40), // 緊急（1時間以内）
    status: 'prep',
  },
  {
    id: 'sh2',
    storeId: 's2',
    storeName: '横浜みなとみらい店',
    zipcode: '2200012',
    address: '神奈川県横浜市西区みなとみらい2丁目',
    type: 'bara',
    arrivalTime: offsetFromNow(90),
    status: 'instructed',
  },
  {
    id: 'sh3',
    storeId: 's3',
    storeName: '大宮西口店',
    zipcode: '3300854',
    address: '埼玉県さいたま市大宮区桜木町1丁目',
    type: 'kon',
    arrivalTime: offsetFromNow(180),
    status: 'prep',
  },
  {
    id: 'sh4',
    storeId: 's4',
    storeName: '千葉中央店',
    zipcode: '2600028',
    address: '千葉県千葉市中央区新町1丁目',
    type: 'bara',
    arrivalTime: offsetFromNow(300),
    status: 'done',
  },
]

// 郵便番号から住所を自動生成するモック（zipcloud API を想定）
export function mockLookupAddress(zipcode: string): Promise<string> {
  const digits = zipcode.replace(/[^0-9]/g, '')
  return new Promise((resolve) => {
    setTimeout(() => {
      const known = MOCK_STORES.find((s) => s.zipcode === digits)
      if (known) {
        resolve(known.address)
        return
      }
      // ダミー住所を生成
      resolve(`東京都サンプル区${digits.slice(0, 3)}-${digits.slice(3)}`)
    }, 400)
  })
}
