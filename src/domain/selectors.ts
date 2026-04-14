import type { Episode, PanelStatus, Project, ProjectActivitySummary, Thread } from '../types'

const reviewStatuses: PanelStatus[] = ['draft_received', 'changes_requested']
const changedStatuses: PanelStatus[] = ['draft', 'in_progress', 'changes_requested']

export interface EpisodeStats {
  pages: number
  panels: number
  dialogue: number
  captions: number
  sfx: number
  wordCount: number
  pendingReview: number
  approved: number
}

export function getDefaultEpisodeId(project: Project): string | null {
  return project.episodes[0]?.id ?? null
}

export function getEpisodeById(project: Project, episodeId: string | null | undefined): Episode | null {
  if (!episodeId) return project.episodes[0] ?? null
  return project.episodes.find(episode => episode.id === episodeId) ?? project.episodes[0] ?? null
}

export function getEpisodeThreads(project: Project, episodeId: string | null | undefined): Thread[] {
  if (!episodeId) return project.threads
  return project.threads.filter(thread => thread.episodeId === episodeId)
}

export function getDefaultThreadId(project: Project, episodeId: string | null | undefined): string | null {
  return getEpisodeThreads(project, episodeId)[0]?.id ?? null
}

function countWords(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function getEpisodeStats(episode: Episode | null | undefined): EpisodeStats {
  if (!episode) {
    return { pages: 0, panels: 0, dialogue: 0, captions: 0, sfx: 0, wordCount: 0, pendingReview: 0, approved: 0 }
  }

  return episode.pages.reduce<EpisodeStats>((stats, page) => {
    stats.pages += 1
    stats.panels += page.panels.length

    for (const panel of page.panels) {
      if (panel.status && reviewStatuses.includes(panel.status)) stats.pendingReview += 1
      if (panel.status === 'approved') stats.approved += 1

      for (const block of panel.content) {
        if (block.type === 'dialogue') stats.dialogue += 1
        if (block.type === 'caption') stats.captions += 1
        if (block.type === 'sfx') stats.sfx += 1
        stats.wordCount += countWords(block.text)
      }
    }

    return stats
  }, { pages: 0, panels: 0, dialogue: 0, captions: 0, sfx: 0, wordCount: 0, pendingReview: 0, approved: 0 })
}

export function getProjectActivitySummary(project: Project, activeEpisodeId: string | null | undefined): ProjectActivitySummary {
  const episodes = activeEpisodeId
    ? project.episodes.filter(episode => episode.id === activeEpisodeId)
    : project.episodes

  let pendingReviewCount = 0
  let changedSinceSubmissionCount = 0
  let exportReadyCount = 0
  let totalPanels = 0

  for (const episode of episodes) {
    for (const page of episode.pages) {
      for (const panel of page.panels) {
        totalPanels += 1
        if (panel.status && reviewStatuses.includes(panel.status)) pendingReviewCount += 1
        if (panel.status && changedStatuses.includes(panel.status)) changedSinceSubmissionCount += 1
        if (panel.status === 'approved') exportReadyCount += 1
      }
    }
  }

  const unreadCollaborationCount = getEpisodeThreads(project, activeEpisodeId).reduce(
    (count, thread) => count + thread.unread,
    0,
  )

  return {
    pendingReviewCount,
    changedSinceSubmissionCount,
    unreadCollaborationCount,
    exportReadyCount,
    totalPanels,
    exportReadyPercentage: totalPanels > 0 ? Math.round((exportReadyCount / totalPanels) * 100) : 0,
    exportReady: totalPanels > 0 && exportReadyCount === totalPanels,
  }
}

export function getReviewablePanels(episode: Episode | null | undefined) {
  if (!episode) return []

  return episode.pages.flatMap(page =>
    page.panels
      .filter(panel => panel.status === 'draft_received' || panel.status === 'changes_requested')
      .map(panel => ({
        episodeId: episode.id,
        pageId: page.id,
        panelId: panel.id,
        panelNumber: panel.number,
        pageNumber: page.number,
        status: panel.status!,
      })),
  )
}
