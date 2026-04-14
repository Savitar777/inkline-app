import { memo, useEffect, useRef } from 'react'
import { useNotifications, type NotificationType } from '../context/NotificationContext'
import { X, Check, MessageCircle, ArrowRight, AlertCircle } from '../icons'

const typeLabels: Record<NotificationType, string> = {
  submission: 'Submission',
  approval: 'Approved',
  changes_requested: 'Changes Requested',
  message: 'Message',
  info: 'Info',
}

const typeColors: Record<NotificationType, string> = {
  submission: 'text-ink-gold',
  approval: 'text-status-approved',
  changes_requested: 'text-red-400',
  message: 'text-blue-400',
  info: 'text-ink-muted',
}

const TypeIcon = ({ type, size = 14 }: { type: NotificationType; size?: number }) => {
  switch (type) {
    case 'submission': return <ArrowRight size={size} />
    case 'approval': return <Check size={size} />
    case 'changes_requested': return <AlertCircle size={size} />
    case 'message': return <MessageCircle size={size} />
    default: return <AlertCircle size={size} />
  }
}

interface Props {
  open: boolean
  onClose: () => void
}

function NotificationCenter({ open, onClose }: Props) {
  const { notifications, markRead, markAllRead, clearAll } = useNotifications()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50 w-80 max-h-[70vh] flex flex-col rounded-xl border border-ink-border bg-ink-dark shadow-2xl ink-stage-enter"
    >
      <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
        <h2 className="text-sm font-medium text-ink-light">Notifications</h2>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllRead}
              className="text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink-text transition-colors"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[10px] uppercase tracking-wider text-ink-muted hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} aria-label="Close notifications" className="rounded p-0.5 text-ink-muted hover:text-ink-text transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-ink-muted text-sm">No notifications yet</span>
            <span className="text-ink-muted/60 text-xs mt-1">Activity will appear here</span>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left px-4 py-3 border-b border-ink-border/50 transition-colors hover:bg-ink-panel/60 ${
                n.read ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 shrink-0 ${typeColors[n.type]}`}>
                  <TypeIcon type={n.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink-light truncate">{n.title}</span>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-ink-gold shrink-0" />}
                  </div>
                  <p className="text-xs text-ink-text mt-0.5 line-clamp-2">{n.body}</p>
                  <span className="text-[10px] text-ink-muted mt-1 block">
                    {typeLabels[n.type]} &middot; {n.timestamp}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default memo(NotificationCenter)
