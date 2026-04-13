import { useRef, useEffect, useMemo } from 'react'
import { X } from '../icons'
import AssemblyPreview from './AssemblyPreview'
import type { Episode } from '../types'

interface Props {
  episode: Episode
  format: string
  onClose: () => void
}

export default function ScriptPreviewModal({ episode, format, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const pages = useMemo(() => episode.pages, [episode.pages])

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
    >
      <div className="bg-ink-dark border border-ink-border rounded-xl shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-border">
          <div>
            <h3 className="text-sm font-serif text-ink-light">
              Preview — EP{episode.number}: {episode.title}
            </h3>
            <p className="text-[11px] text-ink-muted font-sans mt-0.5">
              {episode.pages.length} page{episode.pages.length !== 1 ? 's' : ''} · {format} format
            </p>
          </div>
          <button
            aria-label="Close preview"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink-light hover:bg-ink-panel transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto p-6 flex justify-center bg-ink-black/30">
          {pages.length > 0 ? (
            <AssemblyPreview
              pages={pages}
              format={format}
              scale={0.45}
              showLettering={false}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-ink-muted font-sans">No pages to preview yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
