/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react'
import { Send, CheckCircle2, Clock, Palette } from '../../icons'
import type { Thread } from '../../types'

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', color: 'text-status-submitted bg-status-submitted/10 border-status-submitted/30', icon: <Send size={10} /> },
  in_progress: { label: 'In Progress', color: 'text-status-progress bg-status-progress/10 border-status-progress/30', icon: <Clock size={10} /> },
  draft_received: { label: 'Draft Received', color: 'text-status-draft bg-status-draft/10 border-status-draft/30', icon: <Palette size={10} /> },
  changes_requested: { label: 'Changes Requested', color: 'text-red-400 bg-red-400/10 border-red-400/30', icon: <Clock size={10} /> },
  approved: { label: 'Approved', color: 'text-status-approved bg-status-approved/10 border-status-approved/30', icon: <CheckCircle2 size={10} /> },
}

export { statusConfig }

interface PageStatus {
  page: number
  status: string
}

interface ThreadListProps {
  episodeThreads: Thread[]
  resolvedActiveThread: string
  unreadCounts: Record<string, number>
  activeEpisodeLabel: string | null
  pageTracker: PageStatus[]
  onSelectThread: (threadId: string) => void
}

function ThreadList({
  episodeThreads,
  resolvedActiveThread,
  unreadCounts,
  activeEpisodeLabel,
  pageTracker,
  onSelectThread,
}: ThreadListProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {episodeThreads.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-ink-muted font-sans">No threads for this episode yet.</p>
            <p className="text-[11px] text-ink-muted/60 font-sans mt-1">Submit pages from the Script Editor to start a thread with your artist.</p>
          </div>
        )}
        {episodeThreads.map((t) => {
          const sc = statusConfig[t.status]
          return (
            <button
              key={t.id}
              onClick={() => onSelectThread(t.id)}
              className={`w-full text-left px-4 py-3 border-b border-ink-border/50 transition-colors ${
                resolvedActiveThread === t.id ? 'bg-ink-panel' : 'hover:bg-ink-panel/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-sans font-medium ${resolvedActiveThread === t.id ? 'text-ink-light' : 'text-ink-text'}`}>
                  {t.label}
                </span>
                {(unreadCounts[t.id] ?? 0) > 0 && (
                  <span className="w-4 h-4 rounded-full bg-ink-gold text-ink-black text-[10px] font-mono font-medium flex items-center justify-center">
                    {unreadCounts[t.id]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted font-sans">{t.pageRange}</span>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono border ${sc.color}`}>
                  {sc.icon}
                  {sc.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      {/* Page Tracker */}
      <div className="px-4 py-3 border-t border-ink-border">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">{activeEpisodeLabel ? `EP${activeEpisodeLabel} Page Status` : 'Page Status'}</span>
        <div className="flex gap-1.5 flex-wrap">
          {pageTracker.map((p) => {
            const colors: Record<string, string> = {
              approved: 'bg-status-approved',
              draft_received: 'bg-status-draft',
              submitted: 'bg-status-submitted',
              in_progress: 'bg-status-progress',
              changes_requested: 'bg-red-400',
              draft: 'bg-ink-muted/50',
            }
            return (
              <div key={p.page} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-1.5 rounded-full ${colors[p.status]}`} />
                <span className="text-[9px] text-ink-muted font-mono">P{p.page}</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default memo(ThreadList)
