import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, Download, PenLine, Search, Upload } from './icons'
import { ProjectProvider, useProject } from './context/ProjectContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PreferencesProvider, useResolvedPlatformMode } from './context/PreferencesContext'
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext'
import AuthGuard from './components/AuthGuard'
import ProfileAvatar from './components/ProfileAvatar'
import WorkspaceActivityRail from './components/workspace/WorkspaceActivityRail'
import CommandPalette from './components/workspace/CommandPalette'
import { formatShortcut, matchesShortcut } from './domain/platform'
import { getEpisodeById, getProjectActivitySummary } from './domain/selectors'
import type { WorkspaceView } from './types/preferences'

const loadScriptEditor = () => import('./views/ScriptEditor')
const loadCollaboration = () => import('./views/Collaboration')
const loadCompileExport = () => import('./views/CompileExport')
const loadProjectDashboard = () => import('./views/ProjectDashboard')
const loadSettingsPanel = () => import('./components/SettingsPanel')

const ScriptEditor = lazy(loadScriptEditor)
const Collaboration = lazy(loadCollaboration)
const CompileExport = lazy(loadCompileExport)
const ProjectDashboard = lazy(loadProjectDashboard)
const SettingsPanel = lazy(loadSettingsPanel)

const viewTabs: Array<{
  id: WorkspaceView
  label: string
  preload: () => Promise<unknown>
}> = [
  { id: 'editor', label: 'Script Editor', preload: loadScriptEditor },
  { id: 'collab', label: 'Collaboration', preload: loadCollaboration },
  { id: 'compile', label: 'Compile & Export', preload: loadCompileExport },
]

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null
  if (!element) return false
  const tag = element.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable
}

function ShellFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-ink-black">
      <div className="rounded-xl border border-ink-border bg-ink-dark px-4 py-3 text-sm text-ink-text">
        Loading workspace…
      </div>
    </div>
  )
}

function NavBar({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const { profile } = useAuth()
  const { project, exportProject, importProject, setProjectTitle } = useProject()
  const { activeView, setActiveView, openCommandPalette } = useWorkspace()
  const platformMode = useResolvedPlatformMode()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(project.title)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!status) return
    const timer = window.setTimeout(() => setStatus(null), 2800)
    return () => window.clearTimeout(timer)
  }, [status])

  const saveTitle = () => {
    const nextTitle = titleDraft.trim() || 'Untitled Project'
    setProjectTitle(nextTitle)
    setEditingTitle(false)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = loadEvent => {
      const result = importProject(loadEvent.target?.result as string)
      setStatus(result.ok
        ? { tone: 'success', message: `Imported ${file.name}.` }
        : { tone: 'error', message: result.error?.message ?? 'That project file could not be imported.' })
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <header className="border-b border-ink-border bg-ink-dark">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {onBackToDashboard ? (
            <button
              aria-label="Back to projects"
              onClick={onBackToDashboard}
              className="ink-focus flex items-center gap-1.5 rounded-md px-1 py-1 text-ink-muted transition-colors hover:text-ink-text"
            >
              <ChevronLeft size={14} />
              <div className="flex h-6 w-6 items-center justify-center rounded bg-ink-gold/20">
                <PenLine size={12} className="text-ink-gold" strokeWidth={2.5} />
              </div>
            </button>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded bg-ink-gold">
              <PenLine size={12} className="text-ink-black" strokeWidth={2.5} />
            </div>
          )}

          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onBlur={saveTitle}
              onChange={event => setTitleDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') saveTitle()
                if (event.key === 'Escape') {
                  setTitleDraft(project.title)
                  setEditingTitle(false)
                }
              }}
              className="ink-focus rounded-md border border-transparent bg-transparent px-2 py-1 font-serif text-base text-ink-light"
            />
          ) : (
            <button
              aria-label="Edit project title"
              onClick={() => {
                setTitleDraft(project.title)
                setEditingTitle(true)
              }}
              className="ink-focus rounded-md px-2 py-1 font-serif text-base text-ink-text transition-colors hover:text-ink-light"
            >
              {project.title}
            </button>
          )}

          <div className="h-4 w-px bg-ink-border" />

          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {viewTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onFocus={() => void tab.preload()}
                onMouseEnter={() => void tab.preload()}
                onClick={() => setActiveView(tab.id)}
                className={`ink-focus rounded-md px-4 py-2 text-sm transition-colors ${
                  activeView === tab.id
                    ? 'bg-ink-panel text-ink-gold'
                    : 'text-ink-text hover:bg-ink-panel/60 hover:text-ink-light'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {status && (
            <div className={`rounded-lg border px-3 py-1.5 text-xs ${
              status.tone === 'success'
                ? 'border-status-approved/30 bg-status-approved/10 text-status-approved'
                : 'border-red-400/30 bg-red-500/10 text-red-300'
            }`}>
              {status.message}
            </div>
          )}

          <button
            type="button"
            onClick={openCommandPalette}
            className="ink-focus hidden items-center gap-2 rounded-lg border border-ink-border bg-ink-panel px-3 py-2 text-xs text-ink-text transition-colors hover:border-ink-gold/30 hover:text-ink-light md:flex"
          >
            <Search size={13} />
            Search
            <span className="rounded border border-ink-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              {formatShortcut(platformMode, ['primary', 'k'])}
            </span>
          </button>
          <button
            type="button"
            aria-label="Export project as JSON"
            onClick={exportProject}
            className="ink-focus flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-ink-text transition-colors hover:bg-ink-panel hover:text-ink-light"
          >
            <Download size={12} /> Export
          </button>
          <button
            type="button"
            aria-label="Import project from JSON"
            onClick={() => importRef.current?.click()}
            className="ink-focus flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-ink-text transition-colors hover:bg-ink-panel hover:text-ink-light"
          >
            <Upload size={12} /> Import
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          <div className="h-4 w-px bg-ink-border" />

          {profile && (
            <>
              <button
                type="button"
                onFocus={() => void loadSettingsPanel()}
                onMouseEnter={() => void loadSettingsPanel()}
                aria-label="Open profile and settings"
                onClick={() => setSettingsOpen(true)}
                className="ink-focus flex items-center gap-3 rounded-full border border-ink-border bg-ink-panel px-2 py-1.5 text-left transition-colors hover:border-ink-gold/30"
              >
                <ProfileAvatar profile={profile} size="sm" />
                <div className="min-w-0">
                  <div className="truncate text-xs text-ink-light">{profile.name}</div>
                  <div className="truncate text-[10px] uppercase tracking-wider text-ink-muted">
                    {profile.role}
                  </div>
                </div>
              </button>

              <Suspense fallback={null}>
                {settingsOpen && (
                  <SettingsPanel
                    onClose={() => setSettingsOpen(false)}
                    projectActions={{
                      title: project.title,
                      onExport: exportProject,
                      onImport: value => {
                        const result = importProject(value)
                        setStatus(result.ok
                          ? { tone: 'success', message: 'Imported backup into the active project.' }
                          : { tone: 'error', message: result.error?.message ?? 'That project file could not be imported.' })
                      },
                    }}
                  />
                )}
              </Suspense>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function WorkspaceShell({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const { activeEpisodeId, activeProjectId, activeView, commandPaletteOpen, runAction, setActiveView, openCommandPalette } = useWorkspace()
  const { project, addEpisode, addPage, addPanel } = useProject()
  const platformMode = useResolvedPlatformMode()
  const activity = useMemo(() => getProjectActivitySummary(project, activeEpisodeId), [activeEpisodeId, project])
  const activeEpisode = getEpisodeById(project, activeEpisodeId)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) && !matchesShortcut(event, platformMode, { key: 'k' })) return

      if (matchesShortcut(event, platformMode, { key: 'k' })) {
        event.preventDefault()
        openCommandPalette()
        return
      }

      if (matchesShortcut(event, platformMode, { key: '1' })) {
        event.preventDefault()
        setActiveView('editor')
        return
      }

      if (matchesShortcut(event, platformMode, { key: '2' })) {
        event.preventDefault()
        setActiveView('collab')
        return
      }

      if (matchesShortcut(event, platformMode, { key: '3' })) {
        event.preventDefault()
        setActiveView('compile')
        return
      }

      if (matchesShortcut(event, platformMode, { key: 'e', shift: true })) {
        event.preventDefault()
        setActiveView('editor')
        addEpisode()
        return
      }

      if (matchesShortcut(event, platformMode, { key: 'p', shift: true }) && activeEpisode) {
        event.preventDefault()
        setActiveView('editor')
        addPage(activeEpisode.id)
        return
      }

      if (matchesShortcut(event, platformMode, { key: 'n', shift: true }) && activeEpisode?.pages.at(-1)) {
        event.preventDefault()
        setActiveView('editor')
        addPanel(activeEpisode.id, activeEpisode.pages.at(-1)!.id, 'Wide / Establishing')
        return
      }

      if (matchesShortcut(event, platformMode, { key: 'enter' })) {
        event.preventDefault()
        runAction('submitToArtist')
        return
      }

      if (matchesShortcut(event, platformMode, { key: 'a', shift: true })) {
        event.preventDefault()
        setActiveView('compile')
        runAction('approveNextReviewable')
        return
      }

      if (matchesShortcut(event, platformMode, { key: 'r', shift: true })) {
        event.preventDefault()
        setActiveView('compile')
        runAction('requestChangesForNextReviewable')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeEpisode, addEpisode, addPage, addPanel, openCommandPalette, platformMode, runAction, setActiveView])

  return (
    <div className="flex h-screen flex-col bg-ink-black">
      <NavBar onBackToDashboard={onBackToDashboard} />
      <WorkspaceActivityRail summary={activity} />
      <main className="flex-1 overflow-hidden">
        <div key={`${activeProjectId ?? 'offline'}:${activeView}`} className="ink-stage-enter h-full">
          <Suspense fallback={<ShellFallback />}>
            {activeView === 'editor' && <ScriptEditor onGoToCollab={() => setActiveView('collab')} />}
            {activeView === 'collab' && <Collaboration />}
            {activeView === 'compile' && <CompileExport />}
          </Suspense>
        </div>
      </main>
      {commandPaletteOpen && <CommandPalette />}
    </div>
  )
}

function AppShell() {
  const { user } = useAuth()
  const { activeProjectId, setActiveProjectId } = useWorkspace()

  if (user && !activeProjectId) {
    return (
      <Suspense fallback={<ShellFallback />}>
        <ProjectDashboard onOpenProject={id => setActiveProjectId(id)} />
      </Suspense>
    )
  }

  if (user && activeProjectId) {
    return (
      <ProjectProvider projectId={activeProjectId}>
        <WorkspaceShell onBackToDashboard={() => setActiveProjectId(null)} />
      </ProjectProvider>
    )
  }

  return (
    <ProjectProvider>
      <WorkspaceShell />
    </ProjectProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <WorkspaceProvider>
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        </WorkspaceProvider>
      </PreferencesProvider>
    </AuthProvider>
  )
}
