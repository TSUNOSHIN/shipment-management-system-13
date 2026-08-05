'use client'

import { useMemo, useState } from 'react'
import { Plus, Clock, Trash2, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  SHIPMENT_TYPE_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  type Shipment,
  type ShipmentStatus,
  type ShipmentType,
} from '@/lib/types'
import { canTransition, formatArrival, isUrgent, sortByArrival } from '@/lib/shipment-utils'
import { StatusBadge, UrgentBadge } from '@/components/status-badge'

type Filter = 'all' | ShipmentType

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'kon', label: '梱出荷' },
  { value: 'bara', label: 'バラ出荷' },
]

export function ShipmentList({
  shipments,
  onCreate,
  onChangeStatus,
  onDelete,
}: {
  shipments: Shipment[]
  onCreate: () => void
  onChangeStatus: (id: string, to: ShipmentStatus) => boolean
  onDelete: (id: string) => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  const visible = useMemo(() => {
    const filtered = shipments.filter((s) => filter === 'all' || s.type === filter)
    return sortByArrival(filtered)
  }, [shipments, filter])

  function toggle(id: string) {
    setErrorId(null)
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function handleStatus(shipment: Shipment, to: ShipmentStatus) {
    if (to === shipment.status) return
    const ok = onChangeStatus(shipment.id, to)
    setErrorId(ok ? null : shipment.id)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">出荷指示一覧</h2>
        <Button onClick={onCreate} className="h-10 px-4">
          <Plus className="size-4" aria-hidden />
          新規作成
        </Button>
      </div>

      {/* フィルタータブ */}
      <div className="mb-4 inline-flex rounded-lg border border-border bg-secondary p-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          該当する出荷指示はありません。
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((s) => {
            const urgent = isUrgent(s)
            const expanded = expandedId === s.id
            return (
              <li
                key={s.id}
                className={cn(
                  'overflow-hidden rounded-xl border bg-card transition-colors',
                  urgent ? 'border-status-urgent/40' : 'border-border',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40"
                  aria-expanded={expanded}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground">{s.storeName}</span>
                      <span className="rounded border border-border px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {SHIPMENT_TYPE_LABEL[s.type]}
                      </span>
                      {urgent && <UrgentBadge />}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden />
                      <span className={cn(urgent && 'font-bold text-status-urgent')}>
                        {formatArrival(s.arrivalTime)} 到着
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                  <ChevronRight
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform',
                      expanded && 'rotate-90',
                    )}
                    aria-hidden
                  />
                </button>

                {expanded && (
                  <div className="border-t border-border bg-muted/30 px-4 py-3">
                    <p className="mb-2 text-xs text-muted-foreground">
                      〒{s.zipcode} {s.address}
                    </p>
                    <p className="mb-2 text-xs font-medium text-foreground">ステータスを変更</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_ORDER.map((st) => {
                        const isCurrent = st === s.status
                        const allowed = isCurrent || canTransition(s.status, st)
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={isCurrent}
                            onClick={() => handleStatus(s, st)}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                              isCurrent
                                ? 'cursor-default border-primary bg-primary/10 text-primary'
                                : allowed
                                  ? 'border-border bg-card text-foreground hover:border-primary hover:text-primary'
                                  : 'border-border bg-card text-muted-foreground/50',
                            )}
                          >
                            {isCurrent && <Check className="size-3.5" aria-hidden />}
                            {STATUS_LABEL[st]}
                          </button>
                        )
                      })}
                    </div>
                    {errorId === s.id && (
                      <p className="mt-2 text-sm font-medium text-destructive">
                        ステータスは「準備中 → 指示済み → 完了」の順にのみ変更できます。
                      </p>
                    )}
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          onDelete(s.id)
                          setExpandedId(null)
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden />
                        削除
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
