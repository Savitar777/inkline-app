import { useState } from 'react'
import {
  Check,
  AlertCircle,
  Layers,
  Image,
  X,
  History,
  Columns,
} from '../../icons'
import type { ChangeRequest, Episode, Panel } from '../../types'

/* ─── Types ─── */

export interface PanelThumb {
  id: string
  page: number
  panel: number
  status: 'complete' | 'missing' | 'review'
  label: string
  pageId: string
}

/* ─── Revision History Modal ─── */

function RevisionHistory({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  const revisions = panel.revisions ?? []
  return (
    <div className="fixed inset-0 z-50 bg-ink-black/70 px-4 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-ink-border bg-ink-dark shadow-2xl ink-stage-enter"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border">
          <h3 className="text-sm font-sans font-medium text-ink-light">Revision History — Panel {panel.number}</h3>
          <button onClick={onClose} className="p-1 rounded text-ink-muted hover:text-ink-light transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {revisions.length === 0 ? (
            <p className="text-sm text-ink-muted font-sans text-center py-8">No revisions submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {revisions.map((rev, i) => (
                <div key={rev.id} className="flex gap-3 rounded-lg border border-ink-border bg-ink-panel p-3">
                  <div className="w-20 h-20 rounded bg-ink-dark border border-ink-border overflow-hidden shrink-0">
                    {rev.assetUrl ? (
                      <img src={rev.assetUrl} alt={`Revision ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={16} className="text-ink-muted/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-ink-light">v{revisions.length - i}</span>
                      {i === 0 && (
                        <span className="text-[9px] uppercase tracking-wider font-sans text-ink-gold border border-ink-gold/30 bg-ink-gold/10 rounded px-1.5 py-0.5">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-muted font-sans mt-1">{rev.uploadedBy}</div>
                    <div className="text-[10px] text-ink-muted/60 font-sans mt-0.5">{rev.uploadedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Change Request List ─── */

function ChangeRequestList({ requests }: { requests: ChangeRequest[] }) {
  if (requests.length === 0) return null
  return (
    <div className="mt-2 space-y-1">
      {requests.map(cr => (
        <div
          key={cr.id}
          className={`rounded px-2 py-1.5 text-[10px] font-sans border ${
            cr.status === 'open'
              ? 'border-red-400/20 bg-red-400/5 text-ink-text'
              : 'border-ink-border bg-ink-panel/50 text-ink-muted line-through'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={`text-[9px] uppercase tracking-wider font-mono ${cr.status === 'open' ? 'text-red-400' : 'text-ink-muted'}`}>
              {cr.status === 'open' ? 'Open' : 'Resolved'}
            </span>
            <span className="text-[9px] text-ink-muted/60">{cr.createdAt}</span>
          </div>
          {cr.note}
        </div>
      ))}
    </div>
  )
}

/* ─── Side-by-Side Comparison Modal ─── */

function SideBySideModal({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink-black/70 px-4 pt-[8vh] backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-ink-border bg-ink-dark shadow-2xl ink-stage-enter"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border">
          <h3 className="text-sm font-sans font-medium text-ink-light">
            Script / Art Comparison — Panel {panel.number}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-ink-muted hover:text-ink-light transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="flex min-h-[400px] max-h-[70vh]">
          {/* Script Side */}
          <div className="flex-1 border-r border-ink-border p-4 overflow-y-auto">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-3">Script</span>
            <div className="space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ink-muted font-sans">Shot</span>
                <p className="text-sm text-ink-light font-sans">{panel.shot || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ink-muted font-sans">Description</span>
                <p className="text-sm text-ink-text font-sans leading-relaxed">{panel.description || 'No description'}</p>
              </div>
              {panel.content.length > 0 && (
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-ink-muted font-sans">Content</span>
                  <div className="space-y-1 mt-1">
                    {panel.content.map(block => (
                      <div key={block.id} className="text-xs font-mono text-ink-text">
                        {block.type === 'dialogue' && (
                          <span><span className="text-tag-dialogue">{block.character || 'CHARACTER'}</span>: {block.text}</span>
                        )}
                        {block.type === 'caption' && (
                          <span className="italic"><span className="text-tag-caption">CAPTION</span>: {block.text}</span>
                        )}
                        {block.type === 'sfx' && (
                          <span><span className="text-[#F97316]">SFX</span>: {block.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {panel.panelType && (
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-ink-muted font-sans">Panel Type</span>
                  <p className="text-xs text-ink-text font-sans capitalize">{panel.panelType}</p>
                </div>
              )}
            </div>
          </div>

          {/* Art Side */}
          <div className="flex-1 p-4 overflow-y-auto">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-3">Artwork</span>
            {panel.assetUrl ? (
              <img src={panel.assetUrl} alt={`Panel ${panel.number} artwork`} className="w-full rounded-lg border border-ink-border" />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-ink-panel rounded-lg border border-dashed border-ink-border">
                <Image size={32} className="text-ink-muted/30 mb-2" />
                <span className="text-xs text-ink-muted font-sans">No artwork submitted</span>
              </div>
            )}
            {(panel.revisions?.length ?? 0) > 0 && (
              <div className="mt-3">
                <span className="text-[9px] uppercase tracking-wider text-ink-muted font-sans">
                  {panel.revisions!.length} revision{panel.revisions!.length !== 1 ? 's' : ''} submitted
                </span>
              </div>
            )}
            {(panel.changeRequests?.filter(cr => cr.status === 'open').length ?? 0) > 0 && (
              <div className="mt-3">
                <span className="text-[9px] uppercase tracking-wider text-red-400 font-sans">
                  {panel.changeRequests!.filter(cr => cr.status === 'open').length} open change request{panel.changeRequests!.filter(cr => cr.status === 'open').length !== 1 ? 's' : ''}
                </span>
                <ChangeRequestList requests={panel.changeRequests!.filter(cr => cr.status === 'open')} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── PanelGrid ─── */

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
  const [revisionPanel, setRevisionPanel] = useState<Panel | null>(null)
  const [comparePanel, setComparePanel] = useState<Panel | null>(null)

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
          const openCRs = pan?.changeRequests?.filter(cr => cr.status === 'open') ?? []
          const revisionCount = pan?.revisions?.length ?? 0
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
              {/* Open change requests badge */}
              {openCRs.length > 0 && (
                <div className="absolute top-2 left-2">
                  <span className="text-[8px] font-mono bg-red-500/90 text-white rounded px-1 py-0.5">
                    {openCRs.length} CR
                  </span>
                </div>
              )}
            </div>

            <div className="px-3 py-2 bg-ink-dark border-t border-ink-border/50">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono text-ink-text">P{p.page} · Panel {p.panel}</div>
                {/* Action buttons: compare + revisions */}
                <div className="flex items-center gap-1">
                  {pan && (
                    <button
                      aria-label="Compare script and art"
                      onClick={() => setComparePanel(pan)}
                      className="p-0.5 rounded text-ink-muted hover:text-ink-gold transition-colors"
                      title="Compare script & art"
                    >
                      <Columns size={10} />
                    </button>
                  )}
                  {revisionCount > 0 && pan && (
                    <button
                      aria-label="View revision history"
                      onClick={() => setRevisionPanel(pan)}
                      className="p-0.5 rounded text-ink-muted hover:text-ink-gold transition-colors"
                      title={`${revisionCount} revision${revisionCount !== 1 ? 's' : ''}`}
                    >
                      <History size={10} />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-[11px] text-ink-muted font-sans truncate mt-0.5">{p.label}</div>

              {/* Change request history */}
              {pan && <ChangeRequestList requests={pan.changeRequests ?? []} />}

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

      {/* Revision History Modal */}
      {revisionPanel && (
        <RevisionHistory panel={revisionPanel} onClose={() => setRevisionPanel(null)} />
      )}

      {/* Side-by-Side Comparison Modal */}
      {comparePanel && episode && (
        <SideBySideModal panel={comparePanel} onClose={() => setComparePanel(null)} />
      )}
    </div>
  )
}
