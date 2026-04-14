import { memo } from 'react'
import { CheckCircle2, Clock, Download, MessageSquare } from '../../icons'
import { useWorkspace } from '../../context/WorkspaceContext'
import type { ProjectActivitySummary } from '../../types'

interface WorkspaceActivityRailProps {
  summary: ProjectActivitySummary
}

const cards = [
  {
    id: 'pending-review',
    label: 'Pending review',
    actionLabel: 'Open compile',
    view: 'compile' as const,
    getIcon: () => Clock,
    tone: 'text-status-draft border-status-draft/30 bg-status-draft/10',
    value: (summary: ProjectActivitySummary) => summary.pendingReviewCount,
  },
  {
    id: 'changed',
    label: 'Changed since submit',
    actionLabel: 'Open editor',
    view: 'editor' as const,
    getIcon: () => Clock,
    tone: 'text-status-progress border-status-progress/30 bg-status-progress/10',
    value: (summary: ProjectActivitySummary) => summary.changedSinceSubmissionCount,
  },
  {
    id: 'unread',
    label: 'Unread collaboration',
    actionLabel: 'Open collaboration',
    view: 'collab' as const,
    getIcon: () => MessageSquare,
    tone: 'text-status-submitted border-status-submitted/30 bg-status-submitted/10',
    value: (summary: ProjectActivitySummary) => summary.unreadCollaborationCount,
  },
  {
    id: 'export',
    label: 'Export readiness',
    actionLabel: 'Open compile',
    view: 'compile' as const,
    getIcon: (summary: ProjectActivitySummary) => summary.exportReady ? CheckCircle2 : Download,
    tone: 'text-ink-gold border-ink-gold/20 bg-ink-gold/10',
    value: (summary: ProjectActivitySummary) => `${summary.exportReadyPercentage}%`,
  },
] as const

function WorkspaceActivityRail({ summary }: WorkspaceActivityRailProps) {
  const { setActiveView } = useWorkspace()

  return (
    <section className="shrink-0 border-b border-ink-border bg-ink-black/40 px-6 py-3">
      <div className="grid gap-3 md:grid-cols-4">
        {cards.map(card => {
          const Icon = card.getIcon(summary)
          const value = card.value(summary)

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveView(card.view)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors hover:border-ink-gold/40 hover:text-ink-light ${card.tone}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em]">{card.label}</span>
                <Icon size={14} />
              </div>
              <div className="mt-2 font-serif text-2xl text-ink-light">{value}</div>
              <div className="mt-1 text-[11px] text-ink-text font-sans">{card.actionLabel}</div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default memo(WorkspaceActivityRail)
