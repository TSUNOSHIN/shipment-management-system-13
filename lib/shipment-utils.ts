import type { Shipment, ShipmentStatus } from './types'
import { STATUS_ORDER } from './types'

// 到着時間が近い順に並べ替える
export function sortByArrival(shipments: Shipment[]): Shipment[] {
  return [...shipments].sort(
    (a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime(),
  )
}

// 到着まで1時間以内かどうか（完了済みは緊急扱いしない）
export function isUrgent(shipment: Shipment): boolean {
  if (shipment.status === 'done') return false
  const diffMs = new Date(shipment.arrivalTime).getTime() - Date.now()
  return diffMs >= 0 && diffMs <= 60 * 60 * 1000
}

// 到着時間の表示用フォーマット
export function formatArrival(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return `本日 ${time}`
  const date = d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
  return `${date} ${time}`
}

// 次に進めるステータス（完了の場合は null）
export function nextStatus(current: ShipmentStatus): ShipmentStatus | null {
  const idx = STATUS_ORDER.indexOf(current)
  return STATUS_ORDER[idx + 1] ?? null
}

// 遷移が許可されているか（順方向のみ許可、逆順・スキップは不可）
export function canTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return STATUS_ORDER.indexOf(to) === STATUS_ORDER.indexOf(from) + 1
}

// datetime-local 用の value 文字列に変換
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
