/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { getDefaultEpisodeId } from '../domain/selectors'
import {
  ProjectDocumentProvider,
  useProjectDocumentState,
  useProjectDocumentActions,
  type ImportProjectResult,
} from './ProjectDocumentContext'
import { useWorkspace } from './WorkspaceContext'
import type { Character, ContentBlock, Episode, Message, Page, Panel, ProductionRole, Project, StoryBible, Thread } from '../types'

interface ProjectStateType {
  project: Project
  loading: boolean
  canUndo: boolean
  canRedo: boolean
  activeEpisodeId: string
}

interface ProjectActionsType {
  setActiveEpisodeId: (id: string) => void
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
  updatePanel: (episodeId: string, pageId: string, panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description' | 'status' | 'panelType' | 'assetUrl' | 'changeRequests' | 'revisions'>>) => void
  deletePanel: (episodeId: string, pageId: string, panelId: string) => void
  addContentBlock: (episodeId: string, pageId: string, panelId: string, type: ContentBlock['type']) => void
  updateContentBlock: (episodeId: string, pageId: string, panelId: string, blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'type'>>) => void
  deleteContentBlock: (episodeId: string, pageId: string, panelId: string, blockId: string) => void
  addCharacter: (char: Omit<Character, 'id'>) => void
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void
  deleteCharacter: (id: string) => void
  reorderPages: (episodeId: string, orderedPageIds: string[]) => void
  reorderPanels: (episodeId: string, pageId: string, orderedPanelIds: string[]) => void
  updateStoryBible: (bible: StoryBible) => void
  addThread: (thread: Thread) => void
  updateThread: (threadId: string, updates: Partial<Pick<Thread, 'status'>>) => void
  addMessage: (threadId: string, message: Message) => void
  setEpisodeDeadline: (episodeId: string, deadline: string | undefined, assignedRole?: ProductionRole) => void
  setPageDeadline: (episodeId: string, pageId: string, deadline: string | undefined, assignedRole?: ProductionRole) => void
}

type ProjectContextType = ProjectStateType & ProjectActionsType

const ProjectStateContext = createContext<ProjectStateType | null>(null)
const ProjectActionsContext = createContext<ProjectActionsType | null>(null)

function ProjectBridge({ children }: { children: ReactNode }) {
  const docState = useProjectDocumentState()
  const docActions = useProjectDocumentActions()
  const { activeEpisodeId, setActiveEpisodeId } = useWorkspace()
  const nextEpisodeId = activeEpisodeId && docState.project.episodes.some(episode => episode.id === activeEpisodeId)
    ? activeEpisodeId
    : getDefaultEpisodeId(docState.project)

  useEffect(() => {
    if (nextEpisodeId !== activeEpisodeId) {
      setActiveEpisodeId(nextEpisodeId)
    }
  }, [activeEpisodeId, nextEpisodeId, setActiveEpisodeId])

  const stateValue = useMemo<ProjectStateType>(() => ({
    ...docState,
    activeEpisodeId: nextEpisodeId ?? '',
  }), [docState, nextEpisodeId])

  const actionsValue = useMemo<ProjectActionsType>(() => ({
    ...docActions,
    setActiveEpisodeId: (id: string) => setActiveEpisodeId(id),
  }), [docActions, setActiveEpisodeId])

  return (
    <ProjectActionsContext.Provider value={actionsValue}>
      <ProjectStateContext.Provider value={stateValue}>
        {children}
      </ProjectStateContext.Provider>
    </ProjectActionsContext.Provider>
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

export function useProjectState() {
  const context = useContext(ProjectStateContext)
  if (!context) throw new Error('useProjectState must be used within ProjectProvider')
  return context
}

export function useProjectActions() {
  const context = useContext(ProjectActionsContext)
  if (!context) throw new Error('useProjectActions must be used within ProjectProvider')
  return context
}

/** Backward-compatible hook returning merged state + actions */
export function useProject(): ProjectContextType {
  const state = useProjectState()
  const actions = useProjectActions()
  return useMemo(() => ({ ...state, ...actions }), [state, actions])
}
