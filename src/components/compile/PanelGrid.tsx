import {
  Check,
  AlertCircle,
  Layers,
  Image,
  X,
} from '../../icons'
import type { Episode } from '../../types'

/* ─── Types ─── */

export interface PanelThumb {
  id: string
  page: number
  panel: number
  status: 'complete' | 'missing' | 'review'
  label: string
  pageId: string
}

interface PanelGridProps {
  panels: PanelThumb[]
  episode: Episode | null | undefined
  changesNote: Record<string, string>
  showChangesFor: string | null
  onApprove: (panelId: string, pageId: string) => void
  onRequestChanges: (panelId: string, pageId: string) => void
  onBulkApprovePage: (pageId: string) => void
  onChangesNoteChange: (panelId: string, value: string) => void
  onShowChangesFor: (panelId: string | null) => void
}

export default function PanelGrid({
  panels,
  episode,
  changesNote,
  showChangesFor,
  onApprove,
  onRequestChanges,
  onBulkApprovePage,
  onChangesNoteChange,
  onShowChangesFor,
}: PanelGridProps) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Panels</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-approved" />
            <span className="text-[10px] text-ink-muted font-sans">Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-draft" />
            <span className="text-[10px] text-ink-muted font-sans">In Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-ink-muted" />
            <span className="text-[10px] text-ink-muted font-sans">Missing</span>
          </div>
        </div>
      </div>

      {/* Bulk approve per page */}
      {episode && episode.pages.some(pg => pg.panels.some(pan => pan.status === 'draft_received' || pan.status === 'changes_requested')) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {episode.pages.map(pg => {
            const reviewable = pg.panels.filter(pan => pan.status === 'draft_received' || pan.status === 'changes_requested')
            if (reviewable.length === 0) return null
            return (
              <button
                key={pg.id}
                onClick={() => onBulkApprovePage(pg.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-sans bg-status-approved/10 text-status-approved border border-status-approved/20 hover:bg-status-approved/20 transition-colors"
              >
                <Check size={10} />
                Approve Page {pg.number} ({reviewable.length} panel{reviewable.length !== 1 ? 's' : ''})
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {panels.map((p) => {
          const ep = episode!
          const pageId = p.pageId
          const pan = ep.pages.find(pg => pg.id === pageId)?.panels.find(pan => pan.id === p.id)
          return (
          <div
            key={p.id}
            className={`rounded-lg border overflow-hidden ${
              p.status === 'complete'
                ? 'border-status-approved/30'
                : p.status === 'review'
                ? 'border-status-draft/30'
                : 'border-ink-border border-dashed'
            }`}
          >
            {/* Thumbnail / asset area */}
            <div className={`h-32 flex items-center justify-center relative ${
              p.status === 'missing' ? 'bg-ink-panel' : 'bg-ink-muted/10'
            }`}>
              {pan?.assetUrl ? (
                <img src={pan.assetUrl} alt={`Panel ${p.panel}`} className="w-full h-full object-cover" />
              ) : p.status === 'complete' ? (
                <>
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `linear-gradient(135deg, rgba(212,168,67,0.3) 0%, transparent 50%)` }} />
                  <Image size={20} className="text-ink-muted/50" />
                </>
              ) : p.status === 'review' ? (
                <Image size={20} className="text-ink-muted/50" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Layers size={18} className="text-ink-muted/30" />
                  <span className="text-[9px] text-ink-muted font-sans">Awaiting art</span>
                </div>
              )}
              {/* Status badge overlay */}
              {p.status !== 'missing' && (
                <div className="absolute top-2 right-2">
                  {p.status === 'complete'
                    ? <Check size={14} className="text-status-approved" />
                    : <AlertCircle size={14} className="text-status-draft" />}
                </div>
              )}
            </div>

            <div className="px-3 py-2 bg-ink-dark border-t border-ink-border/50">
              <div className="text-[10px] font-mono text-ink-text">P{p.page} · Panel {p.panel}</div>
              <div className="text-[11px] text-ink-muted font-sans truncate mt-0.5">{p.label}</div>

              {/* Review controls — only shown when draft received */}
              {p.status === 'review' && (
                <div className="mt-2 space-y-1">
                  {showChangesFor === p.id ? (
                    <div className="space-y-1">
                      <textarea
                        placeholder="Note for artist…"
                        value={changesNote[p.id] ?? ''}
                        onChange={e => onChangesNoteChange(p.id, e.target.value)}
                        rows={2}
                        className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-[10px] font-sans text-ink-light placeholder:text-ink-muted outline-none resize-none"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => onRequestChanges(p.id, pageId)}
                          className="flex-1 py-1 rounded text-[10px] font-sans bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => onShowChangesFor(null)}
                          className="px-2 py-1 rounded text-[10px] text-ink-muted hover:text-ink-text transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onApprove(p.id, pageId)}
                        className="flex-1 py-1 rounded text-[10px] font-sans bg-status-approved/20 text-status-approved hover:bg-status-approved/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={9} /> Approve
                      </button>
                      <button
                        onClick={() => onShowChangesFor(p.id)}
                        className="flex-1 py-1 rounded text-[10px] font-sans bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Changes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
