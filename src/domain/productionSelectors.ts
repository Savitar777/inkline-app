import type {
  Project,
  PanelStatus,
  PanelStatusCount,
  EpisodeProductionSummary,
  PageHeatmapEntry,
  ProductionRole,
  RoleWorkloadItem,
} from '../types'

/* ─── Episode Production Summaries ─── */

function emptyStatusCounts(): PanelStatusCount {
  return { draft: 0, submitted: 0, in_progress: 0, draft_received: 0, changes_requested: 0, approved: 0, total: 0 }
}

export function getEpisodeProductionSummaries(project: Project): EpisodeProductionSummary[] {
  return project.episodes.map(ep => {
    const counts = emptyStatusCounts()
    for (const page of ep.pages) {
      for (const panel of page.panels) {
        const status: PanelStatus = panel.status ?? 'draft'
        counts[status]++
        counts.total++
      }
    }
    return {
      episodeId: ep.id,
      episodeNumber: ep.number,
      episodeTitle: ep.title,
      statusCounts: counts,
      pageCount: ep.pages.length,
      completionPct: counts.total > 0 ? Math.round((counts.approved / counts.total) * 100) : 0,
    }
  })
}

/* ─── Page Heatmap ─── */

// Tie-break order: strongest status wins (approved is best)
const STATUS_STRENGTH: Record<PanelStatus, number> = {
  draft: 0,
  submitted: 1,
  in_progress: 2,
  draft_received: 3,
  changes_requested: 4,
  approved: 5,
}

function getDominantStatus(statuses: PanelStatus[]): PanelStatus {
  if (statuses.length === 0) return 'draft'

  // Mode (most frequent), tie-break by weakest status (worst case wins for visibility)
  const freq: Partial<Record<PanelStatus, number>> = {}
  for (const s of statuses) {
    freq[s] = (freq[s] ?? 0) + 1
  }

  let dominant: PanelStatus = 'draft'
  let maxCount = 0
  for (const [status, count] of Object.entries(freq) as [PanelStatus, number][]) {
    if (count > maxCount || (count === maxCount && STATUS_STRENGTH[status] < STATUS_STRENGTH[dominant])) {
      dominant = status
      maxCount = count
    }
  }
  return dominant
}

export function getPageHeatmap(project: Project, episodeId?: string): PageHeatmapEntry[] {
  const episodes = episodeId
    ? project.episodes.filter(ep => ep.id === episodeId)
    : project.episodes

  const entries: PageHeatmapEntry[] = []
  for (const ep of episodes) {
    for (const page of ep.pages) {
      const statuses = page.panels.map(p => p.status ?? 'draft' as PanelStatus)
      const approvedCount = statuses.filter(s => s === 'approved').length
      entries.push({
        pageId: page.id,
        pageNumber: page.number,
        episodeId: ep.id,
        dominantStatus: getDominantStatus(statuses),
        panelCount: page.panels.length,
        approvedCount,
      })
    }
  }
  return entries
}

/* ─── Role Workload ─── */

export function getRoleWorkload(project: Project, role: ProductionRole): RoleWorkloadItem[] {
  const items: RoleWorkloadItem[] = []

  for (const ep of project.episodes) {
    for (const page of ep.pages) {
      for (const panel of page.panels) {
        const status: PanelStatus = panel.status ?? 'draft'
        let match = false

        switch (role) {
          case 'artist':
            // Artist needs to start work (submitted) or revise (changes_requested)
            match = status === 'submitted' || status === 'changes_requested'
            break
          case 'colorist':
            // Colorist works on approved panels (post-approval coloring)
            match = status === 'draft_received'
            break
          case 'letterer':
            // Letterer works on approved panels that may need lettering
            match = status === 'approved' && panel.content.length === 0
            break
          case 'writer':
            // Writer reviews drafts received or manages change requests
            match = status === 'draft_received' || status === 'changes_requested'
            break
        }

        if (match) {
          items.push({
            role,
            episodeId: ep.id,
            episodeNumber: ep.number,
            pageId: page.id,
            pageNumber: page.number,
            panelId: panel.id,
            panelNumber: panel.number,
            currentStatus: status,
          })
        }
      }
    }
  }

  return items
}
