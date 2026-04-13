import type { DragEvent } from 'react'
import FileUploadZone from '../FileUploadZone'
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
  uploadPreview,
  uploading,
  selectedPanelId,
  allPanels,
  isSupabaseConfigured,
  onSelectPanel,
  onAttachUpload,
  onCancel,
  onClickSelect,
}: UploadModalProps) {
  return (
    <div className="px-6 pt-3 border-t border-ink-border bg-ink-dark/50">
      {uploadPreview ? (
        <div className="rounded-lg border-2 border-dashed border-ink-border bg-ink-panel p-3 space-y-2">
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
        <FileUploadZone
          accept="panel-assets"
          onFiles={() => onClickSelect()}
          label="Drop artwork here or click to select"
        />
      )}
    </div>
  )
}
