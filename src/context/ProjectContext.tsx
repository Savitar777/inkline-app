/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { getDefaultEpisodeId } from '../domain/selectors'
import { ProjectDocumentProvider, useProjectDocument, type ImportProjectResult } from './ProjectDocumentContext'
import { useWorkspace } from './WorkspaceContext'
import type { Character, ContentBlock, Episode, Message, Page, Panel, Project, Thread } from '../types'

interface ProjectContextType {
  project: Project
  loading: boolean
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  activeEpisodeId: string
  setActiveEpisodeId: (id: string) => void
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
}

const ProjectContext = createContext<ProjectContextType | null>(null)

function ProjectBridge({ children }: { children: ReactNode }) {
  const document = useProjectDocument()
  const { activeEpisodeId, setActiveEpisodeId } = useWorkspace()
  const nextEpisodeId = activeEpisodeId && document.project.episodes.some(episode => episode.id === activeEpisodeId)
    ? activeEpisodeId
    : getDefaultEpisodeId(document.project)

  useEffect(() => {
    if (nextEpisodeId !== activeEpisodeId) {
      setActiveEpisodeId(nextEpisodeId)
    }
  }, [activeEpisodeId, nextEpisodeId, setActiveEpisodeId])

  const value = useMemo<ProjectContextType>(() => ({
    ...document,
    activeEpisodeId: nextEpisodeId ?? '',
    setActiveEpisodeId: (id: string) => setActiveEpisodeId(id),
  }), [document, nextEpisodeId, setActiveEpisodeId])

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

interface ProviderProps {
  children: ReactNode
  projectId?: string
}

export function ProjectProvider({ children, projectId }: ProviderProps) {
  return (
    <ProjectDocumentProvider projectId={projectId}>
      <ProjectBridge>{children}</ProjectBridge>
    </ProjectDocumentProvider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProject must be used within ProjectProvider')
  return context
}
