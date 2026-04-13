/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePreferences } from './PreferencesContext'
import type { WorkspaceView } from '../types/preferences'
import type { Project, WorkspaceSelection } from '../types'

type WorkspaceActionName =
  | 'submitToArtist'
  | 'approveNextReviewable'
  | 'requestChangesForNextReviewable'
  | 'openSearch'

type WorkspaceActionHandler = () => void

interface WorkspaceContextType extends WorkspaceSelection {
  activeProjectId: string | null
  activeView: WorkspaceView
  activeEpisodeId: string | null
  activeThreadId: string | null
  commandPaletteOpen: boolean
  setActiveProjectId: (projectId: string | null) => void
  setActiveView: (view: WorkspaceView) => void
  setActiveEpisodeId: (episodeId: string | null) => void
  setActiveThreadId: (threadId: string | null) => void
  setSelectedFormat: (format: Project['format']) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  registerActionHandler: (name: WorkspaceActionName, handler: WorkspaceActionHandler | null) => () => void
  runAction: (name: WorkspaceActionName) => boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

function readSelection(defaultView: WorkspaceView): WorkspaceSelection {
  const params = new URLSearchParams(window.location.search)
  const viewParam = params.get('view')
  const formatParam = params.get('format')

  const view: WorkspaceView = viewParam === 'editor' || viewParam === 'collab' || viewParam === 'compile'
    ? viewParam
    : defaultView

  return {
    projectId: params.get('project'),
    view,
    episodeId: params.get('episode'),
    threadId: params.get('thread'),
    selectedFormat: formatParam === 'manhwa' || formatParam === 'manga' || formatParam === 'comic'
      ? formatParam
      : 'webtoon',
  }
}

function writeSelection(selection: WorkspaceSelection) {
  const url = new URL(window.location.href)

  const entries: Record<string, string | null> = {
    project: selection.projectId,
    view: selection.view,
    episode: selection.episodeId,
    thread: selection.threadId,
    format: selection.selectedFormat,
  }

  for (const [key, value] of Object.entries(entries)) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }

  window.history.replaceState(null, '', url)
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { preferences, updatePreferences } = usePreferences()
  const [selection, setSelection] = useState<WorkspaceSelection>(() => readSelection(
    preferences.rememberLastView ? preferences.lastView : preferences.defaultView,
  ))
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const actionHandlersRef = useRef<Partial<Record<WorkspaceActionName, WorkspaceActionHandler>>>({})

  useEffect(() => {
    writeSelection(selection)
  }, [selection])

  useEffect(() => {
    const onPopState = () => {
      setSelection(readSelection(preferences.rememberLastView ? preferences.lastView : preferences.defaultView))
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [preferences.defaultView, preferences.lastView, preferences.rememberLastView])

  const setActiveProjectId = useCallback((projectId: string | null) => {
    setSelection(previous => ({
      ...previous,
      projectId,
      episodeId: projectId === previous.projectId ? previous.episodeId : null,
      threadId: null,
    }))
  }, [])

  const setActiveView = useCallback((view: WorkspaceView) => {
    startTransition(() => {
      setSelection(previous => ({ ...previous, view }))
    })

    if (preferences.rememberLastView) {
      updatePreferences({ lastView: view })
    }
  }, [preferences.rememberLastView, updatePreferences])

  const setActiveEpisodeId = useCallback((episodeId: string | null) => {
    setSelection(previous => ({
      ...previous,
      episodeId,
      threadId: null,
    }))
  }, [])

  const setActiveThreadId = useCallback((threadId: string | null) => {
    setSelection(previous => ({ ...previous, threadId }))
  }, [])

  const setSelectedFormat = useCallback((selectedFormat: Project['format']) => {
    setSelection(previous => ({ ...previous, selectedFormat }))
  }, [])

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), [])
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), [])

  const registerActionHandler = useCallback((name: WorkspaceActionName, handler: WorkspaceActionHandler | null) => {
    if (handler) actionHandlersRef.current[name] = handler
    else delete actionHandlersRef.current[name]

    return () => {
      if (actionHandlersRef.current[name] === handler) {
        delete actionHandlersRef.current[name]
      }
    }
  }, [])

  const runAction = useCallback((name: WorkspaceActionName) => {
    const handler = actionHandlersRef.current[name]
    if (!handler) return false
    handler()
    return true
  }, [])

  const value = useMemo<WorkspaceContextType>(() => ({
    ...selection,
    activeProjectId: selection.projectId,
    activeView: selection.view,
    activeEpisodeId: selection.episodeId,
    activeThreadId: selection.threadId,
    commandPaletteOpen,
    setActiveProjectId,
    setActiveView,
    setActiveEpisodeId,
    setActiveThreadId,
    setSelectedFormat,
    openCommandPalette,
    closeCommandPalette,
    registerActionHandler,
    runAction,
  }), [
    closeCommandPalette,
    commandPaletteOpen,
    openCommandPalette,
    registerActionHandler,
    runAction,
    selection,
    setActiveEpisodeId,
    setActiveProjectId,
    setActiveThreadId,
    setActiveView,
    setSelectedFormat,
  ])

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return context
}
