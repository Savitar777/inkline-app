import { useState, useRef } from 'react'
import { PenLine, MessageSquare, Layers, User, Download, Upload, ChevronLeft } from './icons'
import ScriptEditor from './views/ScriptEditor'
import Collaboration from './views/Collaboration'
import CompileExport from './views/CompileExport'
import ProjectDashboard from './views/ProjectDashboard'
import { ProjectProvider, useProject } from './context/ProjectContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthGuard from './components/AuthGuard'

type View = 'editor' | 'collab' | 'compile'

const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'editor', label: 'Script Editor', icon: <PenLine size={16} /> },
  { id: 'collab', label: 'Collaboration', icon: <MessageSquare size={16} /> },
  { id: 'compile', label: 'Compile & Export', icon: <Layers size={16} /> },
]

function NavBar({
  activeView, setActiveView, onBackToDashboard,
}: {
  activeView: View
  setActiveView: (v: View) => void
  onBackToDashboard: () => void
}) {
  const { project, setProjectTitle, exportProject, importProject } = useProject()
  const { profile, signOut } = useAuth()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(project.title)
  const importRef = useRef<HTMLInputElement>(null)

  const saveTitle = () => {
    setProjectTitle(titleDraft || 'Untitled Project')
    setEditingTitle(false)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => importProject(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-ink-border bg-ink-dark shrink-0">
      <div className="flex items-center gap-4">
        {/* Back to dashboard */}
        <button
          aria-label="Back to projects"
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-ink-muted hover:text-ink-text transition-colors"
        >
          <ChevronLeft size={14} />
          <div className="w-6 h-6 rounded bg-ink-gold/20 flex items-center justify-center">
            <PenLine size={12} className="text-ink-gold" strokeWidth={2.5} />
          </div>
        </button>

        {/* Project title */}
        {editingTitle ? (
          <input
            className="bg-transparent border-b border-ink-gold/60 outline-none font-serif text-base text-ink-light"
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
            autoFocus
          />
        ) : (
          <button
            aria-label="Edit project title"
            onClick={() => { setTitleDraft(project.title); setEditingTitle(true) }}
            className="font-serif text-base text-ink-text hover:text-ink-light transition-colors"
          >
            {project.title}
          </button>
        )}

        <div className="w-px h-4 bg-ink-border mx-1" />

        {/* Tabs */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-sans transition-all duration-200 ${
                activeView === tab.id
                  ? 'bg-ink-panel text-ink-gold'
                  : 'text-ink-text hover:text-ink-light hover:bg-ink-panel/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Export project as JSON"
          onClick={exportProject}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans text-ink-text hover:text-ink-light hover:bg-ink-panel transition-colors"
        >
          <Download size={12} /> Export
        </button>
        <button
          aria-label="Import project from JSON"
          onClick={() => importRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans text-ink-text hover:text-ink-light hover:bg-ink-panel transition-colors"
        >
          <Upload size={12} /> Import
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <div className="w-px h-4 bg-ink-border" />

        {profile ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-text font-sans">{profile.name}</span>
            <button
              onClick={signOut}
              className="text-[11px] text-ink-muted font-sans hover:text-ink-text transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-ink-muted/30 flex items-center justify-center">
            <User size={14} className="text-ink-text" />
          </div>
        )}
      </div>
    </header>
  )
}

function AppShell() {
  const { user } = useAuth()
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<View>('editor')

  if (!activeProjectId) {
    if (user) {
      return <ProjectDashboard onOpenProject={id => setActiveProjectId(id)} />
    }
    return (
      <ProjectProvider>
        <div className="flex flex-col h-screen bg-ink-black">
          <NavBar activeView={activeView} setActiveView={setActiveView} onBackToDashboard={() => {}} />
          <main className="flex-1 overflow-hidden">
            {activeView === 'editor' && <ScriptEditor />}
            {activeView === 'collab' && <Collaboration />}
            {activeView === 'compile' && <CompileExport />}
          </main>
        </div>
      </ProjectProvider>
    )
  }

  return (
    <ProjectProvider projectId={activeProjectId} userId={user?.id}>
      <div className="flex flex-col h-screen bg-ink-black">
        <NavBar
          activeView={activeView}
          setActiveView={setActiveView}
          onBackToDashboard={() => setActiveProjectId(null)}
        />
        <main className="flex-1 overflow-hidden">
          {activeView === 'editor' && <ScriptEditor onGoToCollab={() => setActiveView('collab')} />}
          {activeView === 'collab' && <Collaboration />}
          {activeView === 'compile' && <CompileExport />}
        </main>
      </div>
    </ProjectProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    </AuthProvider>
  )
}
