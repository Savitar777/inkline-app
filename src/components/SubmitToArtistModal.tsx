import { memo, useState } from 'react'
import { Send, Check, X } from '../icons'
import type { Episode, PanelStatus } from '../types'
import { useProject } from '../context/ProjectContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { createThread } from '../services/projectService'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { formatShortTime } from '../domain/time'

interface Props {
  episode: Episode
  onClose: () => void
  onSubmitted: () => void
}

function SubmitToArtistModal({ episode, onClose, onSubmitted }: Props) {
  const { project, updatePanel, addThread, addMessage } = useProject()
  const { user } = useAuth()
  const { setActiveThreadId } = useWorkspace()
  const { addNotification } = useNotifications()

  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(
    new Set(episode.pages.map(p => p.id))
  )
  const [submitting, setSubmitting] = useState(false)

  const togglePage = (pageId: string) => {
    setSelectedPageIds(prev => {
      const next = new Set(prev)
      if (next.has(pageId)) next.delete(pageId)
      else next.add(pageId)
      return next
    })
  }

  const selectedPages = episode.pages.filter(pg => selectedPageIds.has(pg.id))
  const panelCount = selectedPages.reduce((n, pg) => n + pg.panels.length, 0)
  const pageNums = selectedPages.map(pg => pg.number)
  const pageRange = pageNums.length === 0 ? '' :
    pageNums.length === 1 ? `Page ${pageNums[0]}` :
    `Pages ${pageNums[0]}–${pageNums[pageNums.length - 1]}`

  const handleSubmit = async () => {
    if (selectedPageIds.size === 0) return
    setSubmitting(true)

    // Update all panels on selected pages to 'submitted' status
    for (const pg of selectedPages) {
      for (const pan of pg.panels) {
        updatePanel(episode.id, pg.id, pan.id, { status: 'submitted' as PanelStatus })
      }
    }

    // Create a collaboration thread
    if (user && project.id) {
      const threadId = await createThread(
        project.id,
        episode.id,
        `EP${episode.number} — ${episode.title}`,
        pageRange,
      )
      if (threadId) setActiveThreadId(threadId)
    } else {
      // Offline mode — create thread locally
      const threadId = crypto.randomUUID()
      const now = formatShortTime(new Date())
      addThread({
        id: threadId,
        episodeId: episode.id,
        label: `EP${episode.number} — ${episode.title}`,
        pageRange,
        status: 'submitted',
        unread: 0,
        messages: [],
      })
      addMessage(threadId, {
        id: crypto.randomUUID(),
        sender: 'writer',
        name: 'Writer',
        text: `Submitted ${pageRange} for review.`,
        timestamp: now,
      })
      setActiveThreadId(threadId)
    }

    addNotification({
      type: 'submission',
      title: `${pageRange} submitted`,
      body: `EP${episode.number} — ${episode.title}: ${panelCount} panel${panelCount !== 1 ? 's' : ''} sent for artist review.`,
    })

    setSubmitting(false)
    onSubmitted()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-ink-black/80 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-ink-dark border border-ink-border rounded-xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-ink-gold/20 flex items-center justify-center">
              <Send size={13} className="text-ink-gold" />
            </div>
            <h2 className="font-serif text-base text-ink-light">Submit to Artist</h2>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-ink-muted hover:text-ink-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs text-ink-text font-sans mb-3">
              Select pages to submit from <span className="text-ink-light font-medium">EP{episode.number} — {episode.title}</span>.
              All panels on selected pages will be marked <span className="text-status-submitted font-medium">Submitted</span>.
            </p>

            <div className="space-y-1.5">
              {episode.pages.map(pg => {
                const selected = selectedPageIds.has(pg.id)
                return (
                  <button
                    key={pg.id}
                    onClick={() => togglePage(pg.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${
                      selected
                        ? 'border-ink-gold/50 bg-ink-gold/10'
                        : 'border-ink-border bg-ink-panel hover:border-ink-gold/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selected ? 'bg-ink-gold border-ink-gold' : 'border-ink-border'
                      }`}>
                        {selected && <Check size={10} className="text-ink-black" strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-sans text-ink-light">Page {pg.number}</span>
                    </div>
                    <span className="text-[11px] text-ink-muted font-sans">
                      {pg.panels.length} panel{pg.panels.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                )
              })}
            </div>

            {episode.pages.length === 0 && (
              <p className="text-xs text-ink-muted font-sans italic text-center py-4">No pages in this episode yet.</p>
            )}
          </div>

          {selectedPageIds.size > 0 && (
            <div className="bg-ink-panel border border-ink-border rounded-lg px-3 py-2.5">
              <p className="text-[11px] text-ink-text font-sans">
                Submitting <span className="text-ink-light font-medium">{pageRange}</span> — <span className="text-ink-light font-medium">{panelCount}</span> panel{panelCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-sans text-ink-muted hover:text-ink-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedPageIds.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-gold text-ink-black text-sm font-sans font-semibold hover:bg-ink-gold-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={13} />
            {submitting ? 'Submitting…' : 'Submit Pages'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(SubmitToArtistModal)
