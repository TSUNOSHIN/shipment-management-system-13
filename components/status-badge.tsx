import { cn } from '@/lib/utils'
import { STATUS_LABEL, type ShipmentStatus } from '@/lib/types'

const STATUS_CLASS: Record<ShipmentStatus, string> = {
  prep: 'bg-status-prep text-status-prep-foreground',
  instructed: 'bg-status-instructed text-status-instructed-foreground',
  done: 'bg-status-done text-status-done-foreground',
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold',
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

export function UrgentBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-status-urgent px-2.5 py-1 text-xs font-bold text-status-urgent-foreground">
      緊急
    </span>
  )
}
