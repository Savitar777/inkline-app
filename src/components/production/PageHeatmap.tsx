import { useMemo } from 'react'
import type { PageHeatmapEntry, Episode } from '../../types'
import { STATUS_BG_CLASSES, STATUS_LABELS } from '../../domain/statusColors'

interface PageHeatmapProps {
  entries: PageHeatmapEntry[]
  episodes: Episode[]
  onSelectPage?: (episodeId: string, pageId: string) => void
}

export default function PageHeatmap({ entries, episodes, onSelectPage }: PageHeatmapProps) {
  // Group entries by episode
  const grouped = useMemo(() => {
    const map = new Map<string, PageHeatmapEntry[]>()
    for (const entry of entries) {
      const group = map.get(entry.episodeId) ?? []
      group.push(entry)
      map.set(entry.episodeId, group)
    }
    return map
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-ink-muted text-sm font-sans">
        No pages to display
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {episodes.filter(ep => grouped.has(ep.id)).map(ep => {
        const pages = grouped.get(ep.id)!
        return (
          <div key={ep.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-ink-gold bg-ink-gold/10 border border-ink-gold/20 rounded px-1.5 py-0.5">
                EP{ep.number}
              </span>
              <span className="text-xs font-sans text-ink-text">{ep.title}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pages.map(entry => (
                <button
                  key={entry.pageId}
                  type="button"
                  onClick={() => onSelectPage?.(entry.episodeId, entry.pageId)}
                  className={`w-10 h-10 rounded border ${STATUS_BG_CLASSES[entry.dominantStatus]} border-ink-border hover:border-ink-gold/30 flex items-center justify-center transition-colors group relative`}
                  title={`Page ${entry.pageNumber} — ${entry.approvedCount}/${entry.panelCount} approved — ${STATUS_LABELS[entry.dominantStatus]}`}
                >
                  <span className="text-[10px] font-mono text-ink-light">{entry.pageNumber}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
