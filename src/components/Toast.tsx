import { useToast } from '../context/ToastContext'
import { X } from '../icons'

const toneStyles = {
  success: 'border-status-approved/30 bg-status-approved/10 text-status-approved',
  error: 'border-red-400/30 bg-red-500/10 text-red-300',
  info: 'border-ink-gold/30 bg-ink-gold/10 text-ink-gold',
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-sans shadow-lg backdrop-blur-sm animate-toast-in ${toneStyles[toast.type]}`}
        >
          <span>{toast.message}</span>
          <button
            aria-label="Dismiss"
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
