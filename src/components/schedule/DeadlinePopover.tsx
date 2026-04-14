import { memo, useState } from 'react'
import { X, Trash2 } from '../../icons'
import type { CalendarEntry, ProductionRole, Episode } from '../../types'

interface DeadlinePopoverProps {
  entry: CalendarEntry | null
  date: string
  episodes: Episode[]
  onSave: (episodeId: string, pageId: string | undefined, deadline: string, role: ProductionRole) => void
  onDelete: (episodeId: string, pageId: string | undefined) => void
  onClose: () => void
}

const ROLES: ProductionRole[] = ['writer', 'artist', 'letterer', 'colorist']

function DeadlinePopover({ entry, date, episodes, onSave, onDelete, onClose }: DeadlinePopoverProps) {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(entry?.episodeId ?? episodes[0]?.id ?? '')
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(entry?.pageId)
  const [deadlineDate, setDeadlineDate] = useState(entry?.date ?? date)
  const [role, setRole] = useState<ProductionRole>(entry?.assignedRole ?? 'artist')

  const selectedEpisode = episodes.find(e => e.id === selectedEpisodeId)

  const handleSave = () => {
    if (!selectedEpisodeId) return
    onSave(selectedEpisodeId, selectedPageId, deadlineDate, role)
    onClose()
  }

  return (
    <div className="absolute z-50 w-64 bg-ink-dark border border-ink-border rounded-lg shadow-2xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans font-medium text-ink-text">
          {entry ? 'Edit Deadline' : 'New Deadline'}
        </span>
        <button onClick={onClose} className="text-ink-muted hover:text-ink-text">
          <X size={12} />
        </button>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Date</label>
        <input
          type="date"
          value={deadlineDate}
          onChange={e => setDeadlineDate(e.target.value)}
          className="w-full mt-1 px-2 py-1.5 rounded border border-ink-border bg-ink-panel text-xs text-ink-text font-sans outline-none focus:border-ink-gold/40"
        />
      </div>

      {!entry && (
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Episode</label>
          <select
            value={selectedEpisodeId}
            onChange={e => { setSelectedEpisodeId(e.target.value); setSelectedPageId(undefined) }}
            className="w-full mt-1 px-2 py-1.5 rounded border border-ink-border bg-ink-panel text-xs text-ink-text font-sans outline-none focus:border-ink-gold/40"
          >
            {episodes.map(ep => (
              <option key={ep.id} value={ep.id}>Ep {ep.number}: {ep.title}</option>
            ))}
          </select>
        </div>
      )}

      {!entry && selectedEpisode && selectedEpisode.pages.length > 0 && (
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Page (optional)</label>
          <select
            value={selectedPageId ?? ''}
            onChange={e => setSelectedPageId(e.target.value || undefined)}
            className="w-full mt-1 px-2 py-1.5 rounded border border-ink-border bg-ink-panel text-xs text-ink-text font-sans outline-none focus:border-ink-gold/40"
          >
            <option value="">Episode-level deadline</option>
            {selectedEpisode.pages.map(pg => (
              <option key={pg.id} value={pg.id}>Page {pg.number}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Assigned Role</label>
        <div className="flex gap-1.5 mt-1">
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-2 py-1 rounded text-[10px] font-sans capitalize transition-colors ${
                role === r
                  ? 'bg-ink-gold text-ink-dark font-medium'
                  : 'bg-ink-panel border border-ink-border text-ink-muted hover:text-ink-text'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {entry && (
        <div className="text-[10px] text-ink-muted font-sans">
          {entry.completionPct}% complete{entry.isOverdue ? ' \u00b7 overdue' : ''}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        {entry ? (
          <button
            onClick={() => { onDelete(entry.episodeId, entry.pageId); onClose() }}
            className="flex items-center gap-1 text-[10px] font-sans text-red-400 hover:text-red-300"
          >
            <Trash2 size={10} /> Remove
          </button>
        ) : <div />}
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded text-[10px] font-sans font-medium bg-ink-gold text-ink-dark hover:bg-ink-gold/90 transition-colors"
        >
          {entry ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}

export default memo(DeadlinePopover)
