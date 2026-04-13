/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { defaultProject } from '../data/mockData'
import * as svc from '../services/projectService'
import { parseProjectDocument, serializeProjectDocument, type ProjectImportError } from '../domain/validation'
import type { Character, ContentBlock, Episode, Message, Page, Panel, Project, Thread } from '../types'
import type { ScriptImportRecord } from '../types/files'
import { applyImport as applyScriptImportToProject } from '../services/scriptImportService'

const STORAGE_KEY = 'inkline-project'

const genId = () => crypto.randomUUID()

export interface ImportProjectResult {
  ok: boolean
  error?: ProjectImportError
}

interface ProjectDocumentContextType {
  project: Project
  loading: boolean
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  setProjectTitle: (title: string) => void
  newProject: () => void
  exportProject: () => void
  importProject: (json: string) => ImportProjectResult
  addEpisode: () => void
  updateEpisode: (episodeId: string, updates: Partial<Pick<Episode, 'title' | 'brief'>>) => void
  deleteEpisode: (episodeId: string) => void
  addPage: (episodeId: string) => void
  updatePage: (episodeId: string, pageId: string, updates: Partial<Pick<Page, 'layoutNote'>>) => void
  deletePage: (episodeId: string, pageId: string) => void
  addPanel: (episodeId: string, pageId: string, shot: string) => void
  updatePanel: (episodeId: string, pageId: string, panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description' | 'status' | 'assetUrl'>>) => void
  deletePanel: (episodeId: string, pageId: string, panelId: string) => void
  addContentBlock: (episodeId: string, pageId: string, panelId: string, type: ContentBlock['type']) => void
  updateContentBlock: (episodeId: string, pageId: string, panelId: string, blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'type'>>) => void
  deleteContentBlock: (episodeId: string, pageId: string, panelId: string, blockId: string) => void
  addCharacter: (char: Omit<Character, 'id'>) => void
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void
  deleteCharacter: (id: string) => void
  reorderPages: (episodeId: string, orderedPageIds: string[]) => void
  reorderPanels: (episodeId: string, pageId: string, orderedPanelIds: string[]) => void
  addThread: (thread: Thread) => void
  updateThread: (threadId: string, updates: Partial<Pick<Thread, 'status'>>) => void
  addMessage: (threadId: string, message: Message) => void
  applyScriptImport: (record: ScriptImportRecord, strategy: 'replace' | 'append' | 'merge') => void
}

const ProjectDocumentContext = createContext<ProjectDocumentContextType | null>(null)

function loadProject(): Project {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultProject
    return parseProjectDocument(saved)
  } catch {
    return defaultProject
  }
}

const emptyProject = (): Project => ({
  id: genId(),
  title: 'Untitled Project',
  format: 'webtoon',
  episodes: [],
  characters: [],
  threads: [],
})

interface ProviderProps {
  children: ReactNode
  projectId?: string
}

export function ProjectDocumentProvider({ children, projectId }: ProviderProps) {
  const [project, setProjectRaw] = useState<Project>(loadProject)
  const [loading, setLoading] = useState(!!projectId)
  const [historySize, setHistorySize] = useState({ undo: 0, redo: 0 })
  const projectRef = useRef(project)
  const undoStack = useRef<Project[]>([])
  const redoStack = useRef<Project[]>([])
  const MAX_UNDO = 50

  const syncHistorySize = useCallback(() => {
    setHistorySize({ undo: undoStack.current.length, redo: redoStack.current.length })
  }, [])

  const setProject = useCallback((updater: Project | ((current: Project) => Project)) => {
    setProjectRaw(current => {
      const next = typeof updater === 'function' ? updater(current) : updater
      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), current]
      redoStack.current = []
      return next
    })
    syncHistorySize()
  }, [syncHistorySize])

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return
    const prev = undoStack.current[undoStack.current.length - 1]
    undoStack.current = undoStack.current.slice(0, -1)
    setProjectRaw(current => {
      redoStack.current = [...redoStack.current, current]
      return prev
    })
    syncHistorySize()
  }, [syncHistorySize])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return
    const next = redoStack.current[redoStack.current.length - 1]
    redoStack.current = redoStack.current.slice(0, -1)
    setProjectRaw(current => {
      undoStack.current = [...undoStack.current, current]
      return next
    })
    syncHistorySize()
  }, [syncHistorySize])

  useEffect(() => {
    projectRef.current = project
  }, [project])

  useEffect(() => {
    if (!projectId) return

    let cancelled = false
    setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect -- intentional: show loading while fetching

    void (async () => {
      const remoteProject = await svc.fetchProject(projectId)
      if (cancelled) return
      if (remoteProject) {
        undoStack.current = []
        redoStack.current = []
        syncHistorySize()
        setProjectRaw(remoteProject)
      }
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [projectId, syncHistorySize])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, serializeProjectDocument(project))
    }, 250)

    return () => window.clearTimeout(timer)
  }, [project])

  const setProjectTitle = useCallback((title: string) => {
    setProject(current => ({ ...current, title }))
    if (projectId) {
      void svc.updateProjectTitle(projectId, title)
    }
  }, [projectId])

  const newProject = useCallback(() => {
    undoStack.current = []
    redoStack.current = []
    syncHistorySize()
    setProjectRaw(emptyProject())
  }, [syncHistorySize])

  const exportProject = useCallback(() => {
    const blob = new Blob([serializeProjectDocument(project)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [project])

  const importProject = useCallback((json: string): ImportProjectResult => {
    try {
      const parsed = parseProjectDocument(json)
      undoStack.current = []
      redoStack.current = []
      syncHistorySize()
      setProjectRaw(parsed)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error as ProjectImportError }
    }
  }, [syncHistorySize])

  const addEpisode = useCallback(() => {
    const id = genId()
    const number = projectRef.current.episodes.length + 1

    setProject(current => ({
      ...current,
      episodes: [...current.episodes, { id, number, title: `Episode ${number}`, brief: '', pages: [] }],
    }))

    if (projectId) {
      void svc.createEpisode(projectId, number, id)
    }
  }, [projectId])

  const updateEpisode = useCallback((episodeId: string, updates: Partial<Pick<Episode, 'title' | 'brief'>>) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episode => episode.id === episodeId ? { ...episode, ...updates } : episode),
    }))

    if (projectId) {
      void svc.updateEpisode(episodeId, updates)
    }
  }, [projectId])

  const deleteEpisode = useCallback((episodeId: string) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes
        .filter(episode => episode.id !== episodeId)
        .map((episode, index) => ({ ...episode, number: index + 1 })),
    }))

    if (projectId) {
      void svc.deleteEpisode(episodeId)
    }
  }, [projectId])

  const addPage = useCallback((episodeId: string) => {
    const id = genId()
    const episode = projectRef.current.episodes.find(item => item.id === episodeId)
    const number = (episode?.pages.length ?? 0) + 1

    setProject(current => ({
      ...current,
      episodes: current.episodes.map(item => (
        item.id === episodeId
          ? { ...item, pages: [...item.pages, { id, number, layoutNote: '', panels: [] }] }
          : item
      )),
    }))

    if (projectId) {
      void svc.createPage(episodeId, number, id)
    }
  }, [projectId])

  const updatePage = useCallback((episodeId: string, pageId: string, updates: Partial<Pick<Page, 'layoutNote'>>) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episode => (
        episode.id === episodeId
          ? {
              ...episode,
              pages: episode.pages.map(page => page.id === pageId ? { ...page, ...updates } : page),
            }
          : episode
      )),
    }))

    if (projectId) {
      void svc.updatePage(pageId, { layout_note: updates.layoutNote })
    }
  }, [projectId])

  const deletePage = useCallback((episodeId: string, pageId: string) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episode => (
        episode.id === episodeId
          ? {
              ...episode,
              pages: episode.pages
                .filter(page => page.id !== pageId)
                .map((page, index) => ({ ...page, number: index + 1 })),
            }
          : episode
      )),
    }))

    if (projectId) {
      void svc.deletePage(pageId)
    }
  }, [projectId])

  const reorderPages = useCallback((episodeId: string, orderedPageIds: string[]) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episode =>
        episode.id === episodeId
          ? {
              ...episode,
              pages: orderedPageIds
                .map(id => episode.pages.find(p => p.id === id)!)
                .filter(Boolean)
                .map((page, index) => ({ ...page, number: index + 1 })),
            }
          : episode
      ),
    }))

    if (projectId) {
      orderedPageIds.forEach((id, index) => {
        void svc.updatePage(id, { number: index + 1 })
      })
    }
  }, [projectId])

  const reorderPanels = useCallback((episodeId: string, pageId: string, orderedPanelIds: string[]) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episodeItem =>
        episodeItem.id === episodeId
          ? {
              ...episodeItem,
              pages: episodeItem.pages.map(pageItem =>
                pageItem.id === pageId
                  ? {
                      ...pageItem,
                      panels: orderedPanelIds
                        .map(id => pageItem.panels.find(p => p.id === id)!)
                        .filter(Boolean)
                        .map((panel, index) => ({ ...panel, number: index + 1 })),
                    }
                  : pageItem
              ),
            }
          : episodeItem
      ),
    }))

    if (projectId) {
      orderedPanelIds.forEach((id, index) => {
        void svc.updatePanel(id, { order: index + 1 })
      })
    }
  }, [projectId])

  const addPanel = useCallback((episodeId: string, pageId: string, shot: string) => {
    const id = genId()
    const episode = projectRef.current.episodes.find(item => item.id === episodeId)
    const page = episode?.pages.find(item => item.id === pageId)
    const number = (page?.panels.length ?? 0) + 1

    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episodeItem => (
        episodeItem.id === episodeId
          ? {
              ...episodeItem,
              pages: episodeItem.pages.map(pageItem => (
                pageItem.id === pageId
                  ? {
                      ...pageItem,
                      panels: [...pageItem.panels, { id, number, shot, description: '', content: [] }],
                    }
                  : pageItem
              )),
            }
          : episodeItem
      )),
    }))

    if (projectId) {
      void svc.createPanel(pageId, number, shot, id)
    }
  }, [projectId])

  const updatePanel = useCallback((episodeId: string, pageId: string, panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description' | 'status' | 'assetUrl'>>) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episodeItem => (
        episodeItem.id === episodeId
          ? {
              ...episodeItem,
              pages: episodeItem.pages.map(pageItem => (
                pageItem.id === pageId
                  ? {
                      ...pageItem,
                      panels: pageItem.panels.map(panel => panel.id === panelId ? { ...panel, ...updates } : panel),
                    }
                  : pageItem
              )),
            }
          : episodeItem
      )),
    }))

    if (projectId) {
      const remoteUpdates: { shot?: string; description?: string; status?: string; asset_url?: string } = {}
      if (updates.shot !== undefined) remoteUpdates.shot = updates.shot
      if (updates.description !== undefined) remoteUpdates.description = updates.description
      if (updates.status !== undefined) remoteUpdates.status = updates.status
      if (updates.assetUrl !== undefined) remoteUpdates.asset_url = updates.assetUrl
      void svc.updatePanel(panelId, remoteUpdates)
    }
  }, [projectId])

  const deletePanel = useCallback((episodeId: string, pageId: string, panelId: string) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episodeItem => (
        episodeItem.id === episodeId
          ? {
              ...episodeItem,
              pages: episodeItem.pages.map(pageItem => (
                pageItem.id === pageId
                  ? {
                      ...pageItem,
                      panels: pageItem.panels
                        .filter(panel => panel.id !== panelId)
                        .map((panel, index) => ({ ...panel, number: index + 1 })),
                    }
                  : pageItem
              )),
            }
          : episodeItem
      )),
    }))

    if (projectId) {
      void svc.deletePanel(panelId)
    }
  }, [projectId])

  const addContentBlock = useCallback((episodeId: string, pageId: string, panelId: string, type: ContentBlock['type']) => {
    const id = genId()
    const episode = projectRef.current.episodes.find(item => item.id === episodeId)
    const page = episode?.pages.find(item => item.id === pageId)
    const panel = page?.panels.find(item => item.id === panelId)
    const order = (panel?.content.length ?? 0) + 1

    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episodeItem => (
        episodeItem.id === episodeId
          ? {
              ...episodeItem,
              pages: episodeItem.pages.map(pageItem => (
                pageItem.id === pageId
                  ? {
                      ...pageItem,
                      panels: pageItem.panels.map(panelItem => (
                        panelItem.id === panelId
                          ? {
                              ...panelItem,
                              content: [
                                ...panelItem.content,
                                { id, type, text: '', character: undefined, parenthetical: undefined },
                              ],
                            }
                          : panelItem
                      )),
                    }
                  : pageItem
              )),
            }
          : episodeItem
      )),
    }))

    if (projectId) {
      void svc.createContentBlock(panelId, type, order, id)
    }
  }, [projectId])

  const updateContentBlock = useCallback((episodeId: string, pageId: string, panelId: string, blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'type'>>) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episodeItem => (
        episodeItem.id === episodeId
          ? {
              ...episodeItem,
              pages: episodeItem.pages.map(pageItem => (
                pageItem.id === pageId
                  ? {
                      ...pageItem,
                      panels: pageItem.panels.map(panelItem => (
                        panelItem.id === panelId
                          ? {
                              ...panelItem,
                              content: panelItem.content.map(block => block.id === blockId ? { ...block, ...updates } : block),
                            }
                          : panelItem
                      )),
                    }
                  : pageItem
              )),
            }
          : episodeItem
      )),
    }))

    if (projectId) {
      void svc.updateContentBlock(blockId, {
        character: updates.character ?? null,
        parenthetical: updates.parenthetical ?? null,
        text: updates.text,
      })
    }
  }, [projectId])

  const deleteContentBlock = useCallback((episodeId: string, pageId: string, panelId: string, blockId: string) => {
    setProject(current => ({
      ...current,
      episodes: current.episodes.map(episodeItem => (
        episodeItem.id === episodeId
          ? {
              ...episodeItem,
              pages: episodeItem.pages.map(pageItem => (
                pageItem.id === pageId
                  ? {
                      ...pageItem,
                      panels: pageItem.panels.map(panelItem => (
                        panelItem.id === panelId
                          ? {
                              ...panelItem,
                              content: panelItem.content.filter(block => block.id !== blockId),
                            }
                          : panelItem
                      )),
                    }
                  : pageItem
              )),
            }
          : episodeItem
      )),
    }))

    if (projectId) {
      void svc.deleteContentBlock(blockId)
    }
  }, [projectId])

  const addCharacter = useCallback((character: Omit<Character, 'id'>) => {
    const id = genId()
    setProject(current => ({ ...current, characters: [...current.characters, { id, ...character }] }))

    if (projectId) {
      void svc.createCharacter(projectId, character, id)
    }
  }, [projectId])

  const updateCharacter = useCallback((id: string, updates: Partial<Omit<Character, 'id'>>) => {
    setProject(current => ({
      ...current,
      characters: current.characters.map(character => character.id === id ? { ...character, ...updates } : character),
    }))

    if (projectId) {
      void svc.updateCharacter(id, updates)
    }
  }, [projectId])

  const deleteCharacter = useCallback((id: string) => {
    setProject(current => ({ ...current, characters: current.characters.filter(character => character.id !== id) }))

    if (projectId) {
      void svc.deleteCharacter(id)
    }
  }, [projectId])

  const addThread = useCallback((thread: Thread) => {
    setProject(current => ({
      ...current,
      threads: [...current.threads, thread],
    }))
  }, [])

  const updateThread = useCallback((threadId: string, updates: Partial<Pick<Thread, 'status'>>) => {
    setProject(current => ({
      ...current,
      threads: current.threads.map(t => t.id === threadId ? { ...t, ...updates } : t),
    }))

    if (projectId) {
      if (updates.status) {
        void svc.updateThreadStatus(threadId, updates.status)
      }
    }
  }, [projectId])

  const addMessage = useCallback((threadId: string, message: Message) => {
    setProject(current => ({
      ...current,
      threads: current.threads.map(t =>
        t.id === threadId ? { ...t, messages: [...t.messages, message] } : t
      ),
    }))
  }, [])

  const applyScriptImport = useCallback((record: ScriptImportRecord, strategy: 'replace' | 'append' | 'merge') => {
    setProject(current => applyScriptImportToProject(record, strategy, current))
  }, [])

  const value = useMemo<ProjectDocumentContextType>(() => ({
    project,
    loading,
    canUndo: historySize.undo > 0,
    canRedo: historySize.redo > 0,
    undo,
    redo,
    setProjectTitle,
    newProject,
    exportProject,
    importProject,
    addEpisode,
    updateEpisode,
    deleteEpisode,
    addPage,
    updatePage,
    deletePage,
    addPanel,
    updatePanel,
    deletePanel,
    addContentBlock,
    updateContentBlock,
    deleteContentBlock,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    reorderPages,
    reorderPanels,
    addThread,
    updateThread,
    addMessage,
    applyScriptImport,
  }), [
    addCharacter,
    addContentBlock,
    addEpisode,
    addMessage,
    applyScriptImport,
    addPage,
    addPanel,
    addThread,
    historySize,
    loading,
    redo,
    undo,
    deleteCharacter,
    deleteContentBlock,
    deleteEpisode,
    deletePage,
    deletePanel,
    exportProject,
    importProject,
    newProject,
    project,
    reorderPages,
    reorderPanels,
    setProjectTitle,
    updateCharacter,
    updateContentBlock,
    updateEpisode,
    updatePage,
    updatePanel,
    updateThread,
  ])

  return (
    <ProjectDocumentContext.Provider value={value}>
      {children}
    </ProjectDocumentContext.Provider>
  )
}

export function useProjectDocument() {
  const context = useContext(ProjectDocumentContext)
  if (!context) throw new Error('useProjectDocument must be used within ProjectDocumentProvider')
  return context
}
