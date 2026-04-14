import type { Project, CalendarEntry } from '../types'
import { getEpisodeProductionSummaries } from './productionSelectors'

export function getCalendarEntries(project: Project): CalendarEntry[] {
  const entries: CalendarEntry[] = []
  const summaries = getEpisodeProductionSummaries(project)

  for (const ep of project.episodes) {
    const summary = summaries.find(s => s.episodeId === ep.id)

    if (ep.deadline) {
      entries.push({
        id: `ep-${ep.id}`,
        date: ep.deadline,
        type: 'episode',
        label: `Ep ${ep.number}`,
        assignedRole: ep.assignedRole,
        episodeId: ep.id,
        isOverdue: ep.deadline < todayISO() && (summary?.completionPct ?? 0) < 100,
        completionPct: summary?.completionPct ?? 0,
      })
    }

    for (const pg of ep.pages) {
      if (pg.deadline) {
        const totalPanels = pg.panels.length
        const approvedPanels = pg.panels.filter(p => p.status === 'approved').length
        const pct = totalPanels > 0 ? Math.round((approvedPanels / totalPanels) * 100) : 0

        entries.push({
          id: `pg-${pg.id}`,
          date: pg.deadline,
          type: 'page',
          label: `Ep ${ep.number} \u00b7 Pg ${pg.number}`,
          assignedRole: pg.assignedRole,
          episodeId: ep.id,
          pageId: pg.id,
          isOverdue: pg.deadline < todayISO() && pct < 100,
          completionPct: pct,
        })
      }
    }
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date))
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
