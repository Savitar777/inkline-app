import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useResolvedPlatformMode } from '../../context/PreferencesContext'
import { searchProject } from '../../domain/search'
import { formatShortcut, type ShortcutToken } from '../../domain/platform'
import { useProject } from '../../context/ProjectContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import { getEpisodeById } from '../../domain/selectors'
import { Layers, MessageSquare, PenLine, Search, Send } from '../../icons'
import type { ProjectSearchResult, SearchScope } from '../../types'

interface CommandItem {
  id: string
  title: string
  subtitle: string
  keywords: string[]
  shortcut?: ShortcutToken[]
  action: () => void
}

const scopeOptions: SearchScope[] = ['all', 'script', 'collaboration', 'assets', 'characters']

function includesQuery(values: string[], query: string) {
  return values.some(value => value.toLowerCase().includes(query))
}

function resultIcon(result: ProjectSearchResult) {
  if (result.view === 'collab') return MessageSquare
  if (result.view === 'compile') return Layers
  return PenLine
}

export default function CommandPalette() {
  const platformMode = useResolvedPlatformMode()
  const {
    closeCommandPalette,
    setActiveEpisodeId,
    setActiveThreadId,
    setActiveView,
    runAction,
  } = useWorkspace()
  const { project, activeEpisodeId, addEpisode, addPage, addPanel } = useProject()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const activeEpisode = getEpisodeById(project, activeEpisodeId)

  const commands = useMemo<CommandItem[]>(() => {
    const actions: CommandItem[] = [
      {
        id: 'switch-editor',
        title: 'Open Script Editor',
        subtitle: 'Jump back into pages, panels, and dialogue.',
        keywords: ['editor', 'script', 'write'],
        shortcut: ['primary', '1'],
        action: () => setActiveView('editor'),
      },
      {
        id: 'switch-collab',
        title: 'Open Collaboration',
        subtitle: 'Review thread handoff, unread feedback, and uploads.',
        keywords: ['collaboration', 'messages', 'feedback'],
        shortcut: ['primary', '2'],
        action: () => setActiveView('collab'),
      },
      {
        id: 'switch-compile',
        title: 'Open Compile & Export',
        subtitle: 'Inspect asset readiness and export output.',
        keywords: ['compile', 'export', 'review'],
        shortcut: ['primary', '3'],
        action: () => setActiveView('compile'),
      },
      {
        id: 'search',
        title: 'Search Project Content',
        subtitle: 'Find episodes, panels, characters, threads, and messages.',
        keywords: ['search', 'find'],
        shortcut: ['primary', 'k'],
        action: () => undefined,
      },
      {
        id: 'add-episode',
        title: 'Add Episode',
        subtitle: 'Create a new story episode.',
        keywords: ['episode', 'new'],
        shortcut: ['primary', 'shift', 'e'],
        action: () => {
          setActiveView('editor')
          addEpisode()
        },
      },
      {
        id: 'add-page',
        title: 'Add Page',
        subtitle: activeEpisode ? `Append a page to ${activeEpisode.title}.` : 'Select an episode first.',
        keywords: ['page', 'new'],
        shortcut: ['primary', 'shift', 'p'],
        action: () => {
          if (!activeEpisode) return
          setActiveView('editor')
          addPage(activeEpisode.id)
        },
      },
      {
        id: 'add-panel',
        title: 'Add Panel',
        subtitle: activeEpisode?.pages.at(-1)
          ? `Append a panel to Page ${activeEpisode.pages.at(-1)?.number}.`
          : 'Create a page before adding panels.',
        keywords: ['panel', 'new'],
        shortcut: ['primary', 'shift', 'n'],
        action: () => {
          const targetPage = activeEpisode?.pages.at(-1)
          if (!activeEpisode || !targetPage) return
          setActiveView('editor')
          addPanel(activeEpisode.id, targetPage.id, 'Wide / Establishing')
        },
      },
      {
        id: 'submit',
        title: 'Submit to Artist',
        subtitle: 'Open the current episode handoff flow.',
        keywords: ['submit', 'artist', 'handoff'],
        shortcut: ['primary', 'enter'],
        action: () => {
          setActiveView('editor')
          runAction('submitToArtist')
        },
      },
      {
        id: 'approve-review',
        title: 'Approve Next Review Panel',
        subtitle: 'Approve the next panel awaiting review.',
        keywords: ['approve', 'review'],
        shortcut: ['primary', 'shift', 'a'],
        action: () => {
          setActiveView('compile')
          runAction('approveNextReviewable')
        },
      },
      {
        id: 'request-changes',
        title: 'Request Changes on Next Panel',
        subtitle: 'Jump into the first pending change request.',
        keywords: ['changes', 'review'],
        shortcut: ['primary', 'shift', 'r'],
        action: () => {
          setActiveView('compile')
          runAction('requestChangesForNextReviewable')
        },
      },
    ]

    return actions
  }, [activeEpisode, addEpisode, addPage, addPanel, runAction, setActiveView])

  const filteredCommands = useMemo(() => {
    if (!deferredQuery) return commands
    return commands.filter(command => includesQuery([command.title, command.subtitle, ...command.keywords], deferredQuery))
  }, [commands, deferredQuery])

  const results = useMemo(() => {
    if (!deferredQuery) return []
    return searchProject(project, deferredQuery, scope)
  }, [deferredQuery, project, scope])

  const items = useMemo(() => (
    deferredQuery
      ? [
          ...filteredCommands.map(command => ({ type: 'command' as const, command })),
          ...results.map(result => ({ type: 'result' as const, result })),
        ]
      : filteredCommands.map(command => ({ type: 'command' as const, command }))
  ), [deferredQuery, filteredCommands, results])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeCommandPalette()
      }

      if (!items.length) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex(index => (index + 1) % items.length)
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex(index => (index - 1 + items.length) % items.length)
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const item = items[activeIndex]
        if (!item) return

        if (item.type === 'command') {
          item.command.action()
        } else {
          startTransition(() => {
            setActiveView(item.result.view)
            if (item.result.episodeId) setActiveEpisodeId(item.result.episodeId)
            if (item.result.threadId) setActiveThreadId(item.result.threadId)
          })
        }

        closeCommandPalette()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [
    activeIndex,
    closeCommandPalette,
    items,
    setActiveEpisodeId,
    setActiveThreadId,
    setActiveView,
  ])

  return (
    <div className="fixed inset-0 z-50 bg-ink-black/70 px-4 pt-[12vh] backdrop-blur-sm" onClick={closeCommandPalette}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search commands and project content"
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-border bg-ink-dark shadow-2xl animate-scale-in"
        onClick={event => event.stopPropagation()}
      >
        <div className="border-b border-ink-border px-4 py-3">
          <label className="flex items-center gap-3 rounded-xl border border-ink-border bg-ink-panel px-3 py-3">
            <Search size={16} className="text-ink-muted" />
            <span className="sr-only">Search commands and project content</span>
            <input
              autoFocus
              value={query}
              onChange={event => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              className="flex-1 bg-transparent text-sm text-ink-light outline-none placeholder:text-ink-muted"
              placeholder="Search commands, episodes, panels, characters, or messages…"
            />
            <span className="rounded border border-ink-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Esc
            </span>
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {scopeOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setScope(option)}
                className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  scope === option
                    ? 'border-ink-gold/40 bg-ink-gold/10 text-ink-gold'
                    : 'border-ink-border text-ink-muted hover:text-ink-light'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {!items.length && (
            <div className="px-4 py-10 text-center">
              <div className="font-serif text-lg text-ink-light">No matching commands yet</div>
              <div className="mt-1 text-sm text-ink-text">Try a different term or search scope.</div>
            </div>
          )}

          {items.map((item, index) => {
            const selected = index === activeIndex
            const Icon = item.type === 'command'
              ? item.command.id.startsWith('switch')
                ? item.command.id.endsWith('collab')
                  ? MessageSquare
                  : item.command.id.endsWith('compile')
                    ? Layers
                    : PenLine
                : item.command.id === 'submit'
                  ? Send
                  : Search
              : resultIcon(item.result)

            return (
              <button
                key={item.type === 'command' ? item.command.id : item.result.id}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  if (item.type === 'command') {
                    item.command.action()
                  } else {
                    setActiveView(item.result.view)
                    if (item.result.episodeId) setActiveEpisodeId(item.result.episodeId)
                    if (item.result.threadId) setActiveThreadId(item.result.threadId)
                  }
                  closeCommandPalette()
                }}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                  selected ? 'bg-ink-panel/90' : 'hover:bg-ink-panel/60'
                }`}
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                  selected ? 'border-ink-gold/30 bg-ink-gold/10 text-ink-gold' : 'border-ink-border text-ink-muted'
                }`}>
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-medium text-ink-light">
                      {item.type === 'command' ? item.command.title : item.result.title}
                    </div>
                    {item.type === 'command' && item.command.shortcut && (
                      <span className="shrink-0 rounded border border-ink-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                        {formatShortcut(platformMode, item.command.shortcut)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-xs text-ink-text">
                    {item.type === 'command' ? item.command.subtitle : item.result.subtitle}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
