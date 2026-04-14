import { memo } from 'react'
import { AlertCircle } from '../../icons'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/75 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl border border-ink-border bg-ink-dark shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-ink-border px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle size={18} />
          </div>
          <div>
            <h2 className="font-serif text-lg text-ink-light">{title}</h2>
            <p className="mt-1 text-sm text-ink-text font-sans leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink-light"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/25"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ConfirmDialog)
