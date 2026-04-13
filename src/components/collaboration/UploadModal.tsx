import type { DragEvent } from 'react'
import { Image } from '../../icons'
import type { Panel } from '../../types'

interface PanelWithPage extends Panel {
  pageNumber: number
  pageId: string
}

interface UploadModalProps {
  dragOver: boolean
  uploadPreview: string | null
  uploading: boolean
  selectedPanelId: string
  allPanels: PanelWithPage[]
  isSupabaseConfigured: boolean
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: DragEvent<HTMLDivElement>) => void
  onSelectPanel: (panelId: string) => void
  onAttachUpload: () => void
  onCancel: () => void
  onClickSelect: () => void
}

export default function UploadModal({
  dragOver,
  uploadPreview,
  uploading,
  selectedPanelId,
  allPanels,
  isSupabaseConfigured,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelectPanel,
  onAttachUpload,
  onCancel,
  onClickSelect,
}: UploadModalProps) {
  return (
    <div className="px-6 pt-3 border-t border-ink-border bg-ink-dark/50">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-lg border-2 border-dashed transition-colors ${dragOver ? 'border-ink-gold bg-ink-gold/5' : 'border-ink-border bg-ink-panel'}`}
      >
        {uploadPreview ? (
          <div className="p-3 space-y-2">
            <img src={uploadPreview} alt="Preview" className="w-full max-h-48 object-contain rounded" />
            {/* Panel picker */}
            {allPanels.length > 0 && (
              <select
                value={selectedPanelId}
                onChange={e => onSelectPanel(e.target.value)}
                className="w-full bg-ink-panel border border-ink-border rounded px-2.5 py-1.5 text-xs font-sans text-ink-text outline-none focus:border-ink-gold/50"
              >
                <option value="">Link to panel...</option>
                {allPanels.map(p => (
                  <option key={p.id} value={p.id}>P{p.pageNumber} / Panel {p.number}</option>
                ))}
              </select>
            )}
            <div className="flex gap-2">
              <button
                onClick={onAttachUpload}
                disabled={uploading || (isSupabaseConfigured && !selectedPanelId)}
                className="flex-1 py-1.5 rounded text-xs font-sans bg-ink-gold text-ink-black font-semibold hover:bg-ink-gold-dim transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Send as Draft'}
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-1.5 rounded text-xs font-sans text-ink-muted hover:text-ink-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onClickSelect}
            className="w-full py-5 flex flex-col items-center gap-2 text-ink-muted hover:text-ink-text transition-colors"
          >
            <Image size={20} />
            <span className="text-xs font-sans">Drop artwork here or click to select</span>
          </button>
        )}
      </div>
    </div>
  )
}
