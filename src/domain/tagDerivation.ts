import type { Project } from '../types'
import type { FileMetadata, FileCategory } from '../types/files'

const CATEGORY_TAG: Partial<Record<FileCategory, string>> = {
  'panel-assets': 'artwork',
  'reference-files': 'reference',
  'avatars': 'avatar',
  'script-imports': 'script',
}

function mimeTag(mimeType: string): string | null {
  if (mimeType.startsWith('image/svg')) return 'svg'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  return null
}

export function deriveAutoTags(
  metadata: FileMetadata,
  category: FileCategory,
  mimeType: string,
  fileName: string,
  project: Project,
): string[] {
  const tags: string[] = []

  const catTag = CATEGORY_TAG[category]
  if (catTag) tags.push(catTag)

  const mt = mimeTag(mimeType)
  if (mt) tags.push(mt)

  if (metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    if (ep) tags.push(`ep-${ep.number}`)
  }

  if (metadata.pageId && metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    const pg = ep?.pages.find(p => p.id === metadata.pageId)
    if (pg) tags.push(`page-${pg.number}`)
  }

  if (metadata.panelId && metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    for (const pg of ep?.pages ?? []) {
      const panel = pg.panels.find(p => p.id === metadata.panelId)
      if (panel) {
        tags.push(`panel-${panel.number}`)
        if (panel.panelType) tags.push(panel.panelType)
        if (panel.status) tags.push(panel.status)
        break
      }
    }
  }

  const lowerName = fileName.toLowerCase()
  for (const char of project.characters) {
    if (char.name.length >= 2 && lowerName.includes(char.name.toLowerCase())) {
      tags.push(`char:${char.name}`)
    }
  }

  return [...new Set(tags)]
}
