import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Project, Episode, Page, Panel, ContentBlock, Character } from '../types'
import { defaultProject } from '../data/mockData'
import * as svc from '../services/projectService'

const genId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

interface ProjectContextType {
  project: Project
  activeEpisodeId: string
  setActiveEpisodeId: (id: string) => void

  // Project
  setProjectTitle: (title: string) => void
  newProject: () => void
  exportProject: () => void
  importProject: (json: string) => void

  // Episode
  addEpisode: () => void
  updateEpisode: (episodeId: string, updates: Partial<Pick<Episode, 'title' | 'brief'>>) => void
  deleteEpisode: (episodeId: string) => void

  // Page
  addPage: (episodeId: string) => void
  updatePage: (episodeId: string, pageId: string, updates: Partial<Pick<Page, 'layoutNote'>>) => void
  deletePage: (episodeId: string, pageId: string) => void

  // Panel
  addPanel: (episodeId: string, pageId: string, shot: string) => void
  updatePanel: (episodeId: string, pageId: string, panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description' | 'status' | 'assetUrl'>>) => void
  deletePanel: (episodeId: string, pageId: string, panelId: string) => void

  // Content Block
  addContentBlock: (episodeId: string, pageId: string, panelId: string, type: ContentBlock['type']) => void
  updateContentBlock: (episodeId: string, pageId: string, panelId: string, blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'type'>>) => void
  deleteContentBlock: (episodeId: string, pageId: string, panelId: string, blockId: string) => void

  // Character
  addCharacter: (char: Omit<Character, 'id'>) => void
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void
  deleteCharacter: (id: string) => void
}

const ProjectContext = createContext<ProjectContextType | null>(null)

const STORAGE_KEY = 'inkline-project'

function loadProject(): Project {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as Project
  } catch {}
  return defaultProject
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
  userId?: string
}

export function ProjectProvider({ children, projectId, userId: _userId }: ProviderProps) {
  const [project, setProject] = useState<Project>(loadProject)
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(
    () => {
      const p = loadProject()
      return p.episodes[0]?.id ?? ''
    }
  )
  const [syncing, setSyncing] = useState(false)

  // Load from Supabase when a real projectId is provided
  useEffect(() => {
    if (!projectId) return
    setSyncing(true)
    svc.fetchProject(projectId).then(remote => {
      if (remote) {
        setProject(remote)
        setActiveEpisodeId(remote.episodes[0]?.id ?? '')
      }
      setSyncing(false)
    })
  }, [projectId])

  // Persist to localStorage as offline fallback (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    }, 400)
    return () => clearTimeout(timer)
  }, [project])

  const setProjectTitle = useCallback((title: string) => {
    setProject(p => ({ ...p, title }))
    if (projectId) svc.updateProjectTitle(projectId, title)
  }, [projectId])

  const newProject = useCallback(() => {
    const fresh = emptyProject()
    setProject(fresh)
    setActiveEpisodeId('')
  }, [])

  const exportProject = useCallback(() => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [project])

  const importProject = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as Project
      setProject(parsed)
      setActiveEpisodeId(parsed.episodes[0]?.id ?? '')
    } catch {
      alert('Invalid project file.')
    }
  }, [])

  // ── Episode ──────────────────────────────────────────────────────────────

  const addEpisode = useCallback(() => {
    const id = genId()
    setProject(p => {
      const number = p.episodes.length + 1
      const ep: Episode = { id, number, title: `Episode ${number}`, brief: '', pages: [] }
      if (projectId) svc.createEpisode(projectId, number)
      return { ...p, episodes: [...p.episodes, ep] }
    })
    setActiveEpisodeId(id)
  }, [projectId])

  const updateEpisode = useCallback((episodeId: string, updates: Partial<Pick<Episode, 'title' | 'brief'>>) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => ep.id === episodeId ? { ...ep, ...updates } : ep),
    }))
    if (projectId) svc.updateEpisode(episodeId, updates)
  }, [projectId])

  const deleteEpisode = useCallback((episodeId: string) => {
    setProject(p => {
      const remaining = p.episodes.filter(ep => ep.id !== episodeId)
      return { ...p, episodes: remaining }
    })
    setActiveEpisodeId(prev => {
      if (prev !== episodeId) return prev
      const remaining = project.episodes.filter(ep => ep.id !== episodeId)
      return remaining[0]?.id ?? ''
    })
    if (projectId) svc.deleteEpisode(episodeId)
  }, [project.episodes, projectId])

  // ── Page ─────────────────────────────────────────────────────────────────

  const addPage = useCallback((episodeId: string) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        const number = ep.pages.length + 1
        const page: Page = { id: genId(), number, layoutNote: '', panels: [] }
        if (projectId) svc.createPage(episodeId, number)
        return { ...ep, pages: [...ep.pages, page] }
      }),
    }))
  }, [projectId])

  const updatePage = useCallback((episodeId: string, pageId: string, updates: Partial<Pick<Page, 'layoutNote'>>) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        return { ...ep, pages: ep.pages.map(pg => pg.id === pageId ? { ...pg, ...updates } : pg) }
      }),
    }))
    if (projectId) svc.updatePage(pageId, { layout_note: updates.layoutNote })
  }, [projectId])

  const deletePage = useCallback((episodeId: string, pageId: string) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        const pages = ep.pages.filter(pg => pg.id !== pageId).map((pg, i) => ({ ...pg, number: i + 1 }))
        return { ...ep, pages }
      }),
    }))
    if (projectId) svc.deletePage(pageId)
  }, [projectId])

  // ── Panel ─────────────────────────────────────────────────────────────────

  const addPanel = useCallback((episodeId: string, pageId: string, shot: string) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        return {
          ...ep,
          pages: ep.pages.map(pg => {
            if (pg.id !== pageId) return pg
            const number = pg.panels.length + 1
            const panel: Panel = { id: genId(), number, shot, description: '', content: [] }
            if (projectId) svc.createPanel(pageId, number, shot)
            return { ...pg, panels: [...pg.panels, panel] }
          }),
        }
      }),
    }))
  }, [projectId])

  const updatePanel = useCallback((episodeId: string, pageId: string, panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description' | 'status' | 'assetUrl'>>) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        return {
          ...ep,
          pages: ep.pages.map(pg => {
            if (pg.id !== pageId) return pg
            return { ...pg, panels: pg.panels.map(pan => pan.id === panelId ? { ...pan, ...updates } : pan) }
          }),
        }
      }),
    }))
    if (projectId) svc.updatePanel(panelId, updates)
  }, [projectId])

  const deletePanel = useCallback((episodeId: string, pageId: string, panelId: string) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        return {
          ...ep,
          pages: ep.pages.map(pg => {
            if (pg.id !== pageId) return pg
            const panels = pg.panels.filter(pan => pan.id !== panelId).map((pan, i) => ({ ...pan, number: i + 1 }))
            return { ...pg, panels }
          }),
        }
      }),
    }))
    if (projectId) svc.deletePanel(panelId)
  }, [projectId])

  // ── Content Block ─────────────────────────────────────────────────────────

  const addContentBlock = useCallback((episodeId: string, pageId: string, panelId: string, type: ContentBlock['type']) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        return {
          ...ep,
          pages: ep.pages.map(pg => {
            if (pg.id !== pageId) return pg
            return {
              ...pg,
              panels: pg.panels.map(pan => {
                if (pan.id !== panelId) return pan
                const block: ContentBlock = { id: genId(), type, text: '' }
                if (projectId) svc.createContentBlock(panelId, type, pan.content.length)
                return { ...pan, content: [...pan.content, block] }
              }),
            }
          }),
        }
      }),
    }))
  }, [projectId])

  const updateContentBlock = useCallback((
    episodeId: string, pageId: string, panelId: string, blockId: string,
    updates: Partial<Omit<ContentBlock, 'id' | 'type'>>
  ) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        return {
          ...ep,
          pages: ep.pages.map(pg => {
            if (pg.id !== pageId) return pg
            return {
              ...pg,
              panels: pg.panels.map(pan => {
                if (pan.id !== panelId) return pan
                return { ...pan, content: pan.content.map(cb => cb.id === blockId ? { ...cb, ...updates } : cb) }
              }),
            }
          }),
        }
      }),
    }))
    if (projectId) svc.updateContentBlock(blockId, {
      character: updates.character ?? null,
      parenthetical: updates.parenthetical ?? null,
      text: updates.text,
    })
  }, [projectId])

  const deleteContentBlock = useCallback((episodeId: string, pageId: string, panelId: string, blockId: string) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        return {
          ...ep,
          pages: ep.pages.map(pg => {
            if (pg.id !== pageId) return pg
            return {
              ...pg,
              panels: pg.panels.map(pan => {
                if (pan.id !== panelId) return pan
                return { ...pan, content: pan.content.filter(cb => cb.id !== blockId) }
              }),
            }
          }),
        }
      }),
    }))
    if (projectId) svc.deleteContentBlock(blockId)
  }, [projectId])

  // ── Character ─────────────────────────────────────────────────────────────

  const addCharacter = useCallback((char: Omit<Character, 'id'>) => {
    setProject(p => ({ ...p, characters: [...p.characters, { id: genId(), ...char }] }))
    if (projectId) svc.createCharacter(projectId, char)
  }, [projectId])

  const updateCharacter = useCallback((id: string, updates: Partial<Omit<Character, 'id'>>) => {
    setProject(p => ({
      ...p,
      characters: p.characters.map(c => c.id === id ? { ...c, ...updates } : c),
    }))
    if (projectId) svc.updateCharacter(id, updates)
  }, [projectId])

  const deleteCharacter = useCallback((id: string) => {
    setProject(p => ({ ...p, characters: p.characters.filter(c => c.id !== id) }))
    if (projectId) svc.deleteCharacter(id)
  }, [projectId])

  if (syncing) {
    return (
      <div className="min-h-screen bg-ink-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-ink-gold/20 border border-ink-gold/30 animate-pulse" />
          <span className="text-xs text-ink-muted font-sans">Loading project…</span>
        </div>
      </div>
    )
  }

  return (
    <ProjectContext.Provider value={{
      project, activeEpisodeId, setActiveEpisodeId,
      setProjectTitle, newProject, exportProject, importProject,
      addEpisode, updateEpisode, deleteEpisode,
      addPage, updatePage, deletePage,
      addPanel, updatePanel, deletePanel,
      addContentBlock, updateContentBlock, deleteContentBlock,
      addCharacter, updateCharacter, deleteCharacter,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
