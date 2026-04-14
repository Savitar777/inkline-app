import { useMemo } from 'react'
import type { RoleWorkloadItem, ProductionRole } from '../../types'
import { STATUS_BORDER_CLASSES, STATUS_TEXT_CLASSES, STATUS_LABELS } from '../../domain/statusColors'

interface RoleWorkloadViewProps {
  items: RoleWorkloadItem[]
  activeRole: ProductionRole
  onRoleChange: (role: ProductionRole) => void
}

const ROLES: { id: ProductionRole; label: string }[] = [
  { id: 'writer', label: 'Writer' },
  { id: 'artist', label: 'Artist' },
  { id: 'letterer', label: 'Letterer' },
  { id: 'colorist', label: 'Colorist' },
]

const ACTION_LABELS: Partial<Record<string, string>> = {
  submitted: 'Awaiting start',
  changes_requested: 'Needs revision',
  draft_received: 'Awaiting review',
  approved: 'Ready for lettering',
}

export default function RoleWorkloadView({ items, activeRole, onRoleChange }: RoleWorkloadViewProps) {
  // Group items by episode
  const grouped = useMemo(() => {
    const map = new Map<string, RoleWorkloadItem[]>()
    for (const item of items) {
      const key = item.episodeId
      const group = map.get(key) ?? []
      group.push(item)
      map.set(key, group)
    }
    return map
  }, [items])

  return (
    <div className="space-y-4">
      {/* Role Tabs */}
      <div className="flex gap-2">
        {ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-sans border transition-colors ${
              activeRole === role.id
                ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                : 'text-ink-muted border-ink-border hover:text-ink-text'
            }`}
          >
            {role.label}
            {activeRole === role.id && items.length > 0 && (
              <span className="ml-1.5 text-[10px] font-mono bg-ink-gold/20 rounded px-1">{items.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Workload Items */}
      {items.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-ink-muted text-sm font-sans">
          No pending work for {ROLES.find(r => r.id === activeRole)?.label ?? activeRole}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([episodeId, epItems]) => (
            <div key={episodeId}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-ink-gold bg-ink-gold/10 border border-ink-gold/20 rounded px-1.5 py-0.5">
                  EP{epItems[0].episodeNumber}
                </span>
                <span className="text-[10px] text-ink-muted font-sans">{epItems.length} item{epItems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1">
                {epItems.map(item => (
                  <div
                    key={item.panelId}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-ink-border bg-ink-dark hover:border-ink-gold/20 transition-colors"
                  >
                    <span className="text-xs font-mono text-ink-text shrink-0">
                      P{item.pageNumber} / Panel {item.panelNumber}
                    </span>
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded border ${STATUS_BORDER_CLASSES[item.currentStatus]} ${STATUS_TEXT_CLASSES[item.currentStatus]}`}>
                      {STATUS_LABELS[item.currentStatus]}
                    </span>
                    <span className="text-[10px] text-ink-muted font-sans ml-auto">
                      {ACTION_LABELS[item.currentStatus] ?? item.currentStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
