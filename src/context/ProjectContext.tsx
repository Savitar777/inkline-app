import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Project, Episode, Page, Panel, ContentBlock, Character } from '../types'
import { defaultProject } from '../data/mockData'

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
  updatePanel: (episodeId: string, pageId: string, panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description'>>) => void
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

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(loadProject)
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(
    () => {
      const p = loadProject()
      return p.episodes[0]?.id ?? ''
    }
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    }, 400)
    return () => clearTimeout(timer)
  }, [project])

  const setProjectTitle = useCallback((title: string) => {
    setProject(p => ({ ...p, title }))
  }, [])

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
      return { ...p, episodes: [...p.episodes, ep] }
    })
    setActiveEpisodeId(id)
  }, [])

  const updateEpisode = useCallback((episodeId: string, updates: Partial<Pick<Episode, 'title' | 'brief'>>) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => ep.id === episodeId ? { ...ep, ...updates } : ep),
    }))
  }, [])

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
  }, [project.episodes])

  // ── Page ─────────────────────────────────────────────────────────────────

  const addPage = useCallback((episodeId: string) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        const number = ep.pages.length + 1
        const page: Page = { id: genId(), number, layoutNote: '', panels: [] }
        return { ...ep, pages: [...ep.pages, page] }
      }),
    }))
  }, [])

  const updatePage = useCallback((episodeId: string, pageId: string, updates: Partial<Pick<Page, 'layoutNote'>>) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        return { ...ep, pages: ep.pages.map(pg => pg.id === pageId ? { ...pg, ...updates } : pg) }
      }),
    }))
  }, [])

  const deletePage = useCallback((episodeId: string, pageId: string) => {
    setProject(p => ({
      ...p,
      episodes: p.episodes.map(ep => {
        if (ep.id !== episodeId) return ep
        const pages = ep.pages.filter(pg => pg.id !== pageId).map((pg, i) => ({ ...pg, number: i + 1 }))
        return { ...ep, pages }
      }),
    }))
  }, [])

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
            return { ...pg, panels: [...pg.panels, panel] }
          }),
        }
      }),
    }))
  }, [])

  const updatePanel = useCallback((episodeId: string, pageId: string, panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description'>>) => {
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
  }, [])

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
  }, [])

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
                return { ...pan, content: [...pan.content, block] }
              }),
            }
          }),
        }
      }),
    }))
  }, [])

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
  }, [])

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
  }, [])

  // ── Character ─────────────────────────────────────────────────────────────

  const addCharacter = useCallback((char: Omit<Character, 'id'>) => {
    setProject(p => ({ ...p, characters: [...p.characters, { id: genId(), ...char }] }))
  }, [])

  const updateCharacter = useCallback((id: string, updates: Partial<Omit<Character, 'id'>>) => {
    setProject(p => ({
      ...p,
      characters: p.characters.map(c => c.id === id ? { ...c, ...updates } : c),
    }))
  }, [])

  const deleteCharacter = useCallback((id: string) => {
    setProject(p => ({ ...p, characters: p.characters.filter(c => c.id !== id) }))
  }, [])

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
