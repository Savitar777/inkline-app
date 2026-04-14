import { memo } from 'react'
import type { EpisodeProductionSummary } from '../../types'
import { STATUS_BG_CLASSES, STATUS_LABELS, ALL_PANEL_STATUSES } from '../../domain/statusColors'

interface EpisodeDashboardProps {
  summaries: EpisodeProductionSummary[]
}

function ProgressBar({ counts }: { counts: EpisodeProductionSummary['statusCounts'] }) {
  if (counts.total === 0) return <div className="h-3 rounded-full bg-ink-panel" />

  return (
    <div className="flex h-3 rounded-full overflow-hidden bg-ink-panel">
      {ALL_PANEL_STATUSES.map(status => {
        const pct = (counts[status] / counts.total) * 100
        if (pct === 0) return null
        return (
          <div
            key={status}
            className={`${STATUS_BG_CLASSES[status]} transition-all`}
            style={{ width: `${pct}%` }}
            title={`${STATUS_LABELS[status]}: ${counts[status]}`}
          />
        )
      })}
    </div>
  )
}

function EpisodeDashboard({ summaries }: EpisodeDashboardProps) {
  if (summaries.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-ink-muted text-sm font-sans">
        No episodes yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1 mb-2">
        {ALL_PANEL_STATUSES.map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${STATUS_BG_CLASSES[status]}`} />
            <span className="text-[10px] text-ink-muted font-sans">{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>

      {summaries.map(summary => (
        <div key={summary.episodeId} className="rounded-lg border border-ink-border bg-ink-dark p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-mono text-ink-gold bg-ink-gold/10 border border-ink-gold/20 rounded px-1.5 py-0.5 shrink-0">
                EP{summary.episodeNumber}
              </span>
              <span className="text-sm font-sans text-ink-light truncate">{summary.episodeTitle}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] text-ink-muted font-sans">{summary.pageCount} page{summary.pageCount !== 1 ? 's' : ''}</span>
              <span className="text-xs font-mono text-ink-gold">{summary.completionPct}%</span>
            </div>
          </div>

          <ProgressBar counts={summary.statusCounts} />

          <div className="flex gap-4 mt-2">
            <span className="text-[10px] font-sans text-emerald-400">{summary.statusCounts.approved} approved</span>
            <span className="text-[10px] font-sans text-ink-muted">{summary.statusCounts.total} total</span>
            {summary.statusCounts.changes_requested > 0 && (
              <span className="text-[10px] font-sans text-red-400">{summary.statusCounts.changes_requested} needs revision</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default memo(EpisodeDashboard)
