import { useEffect, useRef } from 'react'
import { X } from '../icons'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  side?: 'left' | 'right'
  children: React.ReactNode
}

export default function MobileDrawer({ open, onClose, title, side = 'left', children }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-40 bg-black/60"
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-72 max-w-[85vw] bg-ink-dark border-${side === 'left' ? 'r' : 'l'} border-ink-border flex flex-col animate-slide-in-${side}`}
        style={{
          animation: `slide-in-${side} 200ms ease-out`,
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border">
          <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">{title}</span>
          <button
            aria-label="Close drawer"
            onClick={onClose}
            className="p-1 rounded text-ink-muted hover:text-ink-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
