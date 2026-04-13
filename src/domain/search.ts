import type { Project, ProjectSearchResult, SearchScope } from '../types'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function matches(scope: SearchScope, type: ProjectSearchResult['kind']) {
  if (scope === 'all') return true
  if (scope === 'script') return type === 'episode' || type === 'page' || type === 'panel'
  if (scope === 'collaboration') return type === 'thread' || type === 'message'
  if (scope === 'assets') return type === 'panel'
  if (scope === 'characters') return type === 'character'
  return true
}

function includesQuery(values: string[], query: string): boolean {
  return values.some(value => normalize(value).includes(query))
}

export function searchProject(project: Project, query: string, scope: SearchScope = 'all'): ProjectSearchResult[] {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return []

  const results: ProjectSearchResult[] = []

  for (const episode of project.episodes) {
    if (matches(scope, 'episode')) {
      const haystack = [episode.title, episode.brief, `Episode ${episode.number}`]
      if (includesQuery(haystack, normalizedQuery)) {
        results.push({
          id: `episode:${episode.id}`,
          kind: 'episode',
          title: `Episode ${episode.number} — ${episode.title}`,
          subtitle: episode.brief || 'Episode brief',
          view: 'editor',
          episodeId: episode.id,
          keywords: haystack,
        })
      }
    }

    for (const page of episode.pages) {
      if (matches(scope, 'page')) {
        const haystack = [`Page ${page.number}`, page.layoutNote]
        if (includesQuery(haystack, normalizedQuery)) {
          results.push({
            id: `page:${page.id}`,
            kind: 'page',
            title: `Page ${page.number}`,
            subtitle: page.layoutNote || `Episode ${episode.number}`,
            view: 'editor',
            episodeId: episode.id,
            pageId: page.id,
            keywords: haystack,
          })
        }
      }

      for (const panel of page.panels) {
        if (matches(scope, 'panel')) {
          const haystack = [
            `Panel ${panel.number}`,
            panel.shot,
            panel.description,
            ...panel.content.flatMap(block => [block.character ?? '', block.parenthetical ?? '', block.text]),
          ]

          if (includesQuery(haystack, normalizedQuery)) {
            results.push({
              id: `panel:${panel.id}`,
              kind: 'panel',
              title: `P${page.number} · Panel ${panel.number}`,
              subtitle: panel.description || panel.shot,
              view: panel.assetUrl ? 'compile' : 'editor',
              episodeId: episode.id,
              pageId: page.id,
              panelId: panel.id,
              keywords: haystack,
            })
          }
        }
      }
    }
  }

  if (matches(scope, 'character')) {
    for (const character of project.characters) {
      const haystack = [character.name, character.role, character.desc]
      if (includesQuery(haystack, normalizedQuery)) {
        results.push({
          id: `character:${character.id}`,
          kind: 'character',
          title: character.name,
          subtitle: character.role || character.desc,
          view: 'editor',
          keywords: haystack,
        })
      }
    }
  }

  for (const thread of project.threads) {
    if (matches(scope, 'thread')) {
      const haystack = [thread.label, thread.pageRange, thread.status]
      if (includesQuery(haystack, normalizedQuery)) {
        results.push({
          id: `thread:${thread.id}`,
          kind: 'thread',
          title: thread.label,
          subtitle: `${thread.pageRange} · ${thread.status.replace('_', ' ')}`,
          view: 'collab',
          episodeId: thread.episodeId,
          threadId: thread.id,
          keywords: haystack,
        })
      }
    }

    if (matches(scope, 'message')) {
      for (const message of thread.messages) {
        const haystack = [message.name, message.text ?? '', message.imageLabel ?? '']
        if (includesQuery(haystack, normalizedQuery)) {
          results.push({
            id: `message:${message.id}`,
            kind: 'message',
            title: message.name,
            subtitle: message.text ?? message.imageLabel ?? thread.label,
            view: 'collab',
            episodeId: thread.episodeId,
            threadId: thread.id,
            keywords: haystack,
          })
        }
      }
    }
  }

  return results.slice(0, 24)
}
