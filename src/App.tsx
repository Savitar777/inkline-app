import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronLeft, Download, Layers, MessageSquare, PenLine, Search, Upload } from './icons'
import { ProjectProvider, useProject } from './context/ProjectContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PreferencesProvider, useResolvedPlatformMode } from './context/PreferencesContext'
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext'
import AuthGuard from './components/AuthGuard'
import ToastContainer from './components/Toast'
import { ToastProvider } from './context/ToastContext'
import { NotificationProvider, useNotifications } from './context/NotificationContext'
import NotificationCenter from './components/NotificationCenter'
import ProfileAvatar from './components/ProfileAvatar'
import WorkspaceActivityRail from './components/workspace/WorkspaceActivityRail'
import CommandPalette from './components/workspace/CommandPalette'
import { useToast } from './context/ToastContext'
import { setServiceErrorCallback } from './services/projectService'
import { formatShortcut, matchesShortcut } from './domain/platform'
import { getEpisodeById, getProjectActivitySummary } from './domain/selectors'
import type { WorkspaceView } from './types/preferences'
import { useBreakpoint } from './hooks/useBreakpoint'

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
    <div className="flex h-full bg-ink-black">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-56 flex-col border-r border-ink-border bg-ink-dark p-4 gap-3">
        <div className="h-5 w-24 rounded ink-shimmer" />
        <div className="h-4 w-32 rounded ink-shimmer" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 rounded-lg ink-shimmer" />
          ))}
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 w-48 rounded ink-shimmer" />
        <div className="h-4 w-64 rounded ink-shimmer" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-xl border border-ink-border bg-ink-dark ink-shimmer" />
          ))}
        </div>
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
  const [notifOpen, setNotifOpen] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const { unreadCount } = useNotifications()

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

  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  return (
    <header className="border-b border-ink-border bg-ink-dark">
      <div className={`flex h-14 items-center justify-between ${isMobile ? 'px-3' : 'px-6'}`}>
        <div className="flex items-center gap-3 min-w-0">
          {onBackToDashboard ? (
            <button
              aria-label="Back to projects"
              onClick={onBackToDashboard}
              className="ink-focus flex items-center gap-1.5 rounded-md px-1 py-1 text-ink-muted transition-colors hover:text-ink-text shrink-0"
            >
              <ChevronLeft size={14} />
              <div className="flex h-6 w-6 items-center justify-center rounded bg-ink-gold/20">
                <PenLine size={12} className="text-ink-gold" strokeWidth={2.5} />
              </div>
            </button>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded bg-ink-gold shrink-0">
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
              className="ink-focus rounded-md border border-transparent bg-transparent px-2 py-1 font-serif text-base text-ink-light min-w-0"
            />
          ) : (
            <button
              aria-label="Edit project title"
              onClick={() => {
                setTitleDraft(project.title)
                setEditingTitle(true)
              }}
              className="ink-focus rounded-md px-2 py-1 font-serif text-base text-ink-text transition-colors hover:text-ink-light truncate min-w-0"
            >
              {project.title}
            </button>
          )}

          {!isMobile && (
            <>
              <div className="h-4 w-px bg-ink-border shrink-0" />

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
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status && !isMobile && (
            <div className={`rounded-lg border px-3 py-1.5 text-xs ${
              status.tone === 'success'
                ? 'border-status-approved/30 bg-status-approved/10 text-status-approved'
                : 'border-red-400/30 bg-red-500/10 text-red-300'
            }`}>
              {status.message}
            </div>
          )}

          {!isMobile && (
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
          )}
          {isMobile && (
            <button
              type="button"
              aria-label="Search"
              onClick={openCommandPalette}
              className="ink-focus rounded p-2 text-ink-muted hover:text-ink-text transition-colors"
            >
              <Search size={16} />
            </button>
          )}
          {!isMobile && (
            <>
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
            </>
          )}
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          {!isMobile && <div className="h-4 w-px bg-ink-border" />}

          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotifOpen(prev => !prev)}
              className="ink-focus relative rounded p-2 text-ink-muted hover:text-ink-text transition-colors"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ink-gold px-1 text-[9px] font-bold text-ink-black">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {profile && (
            <>
              <button
                type="button"
                onFocus={() => void loadSettingsPanel()}
                onMouseEnter={() => void loadSettingsPanel()}
                aria-label="Open profile and settings"
                onClick={() => setSettingsOpen(true)}
                className={`ink-focus flex items-center gap-3 rounded-full border border-ink-border bg-ink-panel text-left transition-colors hover:border-ink-gold/30 ${isMobile ? 'p-1' : 'px-2 py-1.5'}`}
              >
                <ProfileAvatar profile={profile} size="sm" />
                {!isMobile && (
                  <div className="min-w-0">
                    <div className="truncate text-xs text-ink-light">{profile.name}</div>
                    <div className="truncate text-[10px] uppercase tracking-wider text-ink-muted">
                      {profile.role}
                    </div>
                  </div>
                )}
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

const mobileTabIcons: Record<WorkspaceView, (p: { size: number; className?: string }) => React.ReactNode> = {
  editor: PenLine,
  collab: MessageSquare,
  compile: Layers,
}

function WorkspaceShell({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const { activeEpisodeId, activeProjectId, activeView, commandPaletteOpen, runAction, setActiveView, openCommandPalette } = useWorkspace()
  const { project, loading, addEpisode, addPage, addPanel, undo, redo } = useProject()
  const platformMode = useResolvedPlatformMode()
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const activity = useMemo(() => getProjectActivitySummary(project, activeEpisodeId), [activeEpisodeId, project])
  const activeEpisode = getEpisodeById(project, activeEpisodeId)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Undo/redo works even when typing
      if (matchesShortcut(event, platformMode, { key: 'z' })) {
        event.preventDefault()
        undo()
        return
      }
      if (matchesShortcut(event, platformMode, { key: 'z', shift: true })) {
        event.preventDefault()
        redo()
        return
      }

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
  }, [activeEpisode, addEpisode, addPage, addPanel, openCommandPalette, platformMode, runAction, setActiveView, undo, redo])

  return (
    <div className="flex h-screen flex-col bg-ink-black">
      <NavBar onBackToDashboard={onBackToDashboard} />
      <WorkspaceActivityRail summary={activity} />
      <main className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-gold border-t-transparent" />
              <span className="text-sm text-ink-muted">Loading project…</span>
            </div>
          </div>
        ) : (
          <div key={`${activeProjectId ?? 'offline'}:${activeView}`} className="ink-stage-enter h-full">
            <Suspense fallback={<ShellFallback />}>
              {activeView === 'editor' && <ScriptEditor onGoToCollab={() => setActiveView('collab')} />}
              {activeView === 'collab' && <Collaboration />}
              {activeView === 'compile' && <CompileExport />}
            </Suspense>
          </div>
        )}
      </main>
      {isMobile && (
        <nav className="flex border-t border-ink-border bg-ink-dark" aria-label="Mobile navigation">
          {viewTabs.map(tab => {
            const Icon = mobileTabIcons[tab.id]
            const active = activeView === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-sans transition-colors ${
                  active ? 'text-ink-gold' : 'text-ink-muted'
                }`}
              >
                <Icon size={18} />
                {tab.label.split(' ')[0]}
              </button>
            )
          })}
        </nav>
      )}
      {commandPaletteOpen && <CommandPalette />}
    </div>
  )
}

function ServiceErrorBridge() {
  const { showToast } = useToast()
  useEffect(() => {
    setServiceErrorCallback((context) => {
      showToast(`Operation failed: ${context}`, 'error')
    })
    return () => setServiceErrorCallback(null)
  }, [showToast])
  return null
}

function AppShell() {
  const { user } = useAuth()
  const { activeProjectId, setActiveProjectId } = useWorkspace()

  if (user && !activeProjectId) {
    return (
      <>
        <ServiceErrorBridge />
        <Suspense fallback={<ShellFallback />}>
          <ProjectDashboard onOpenProject={id => setActiveProjectId(id)} />
        </Suspense>
      </>
    )
  }

  if (user && activeProjectId) {
    return (
      <ProjectProvider projectId={activeProjectId}>
        <ServiceErrorBridge />
        <WorkspaceShell onBackToDashboard={() => setActiveProjectId(null)} />
      </ProjectProvider>
    )
  }

  return (
    <ProjectProvider>
      <ServiceErrorBridge />
      <WorkspaceShell />
    </ProjectProvider>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <AuthProvider>
          <PreferencesProvider>
            <WorkspaceProvider>
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            </WorkspaceProvider>
          </PreferencesProvider>
        </AuthProvider>
      </NotificationProvider>
      <ToastContainer />
    </ToastProvider>
  )
}
