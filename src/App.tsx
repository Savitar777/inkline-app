import { useState, useRef } from 'react'
import { PenLine, MessageSquare, Layers, User, Plus, Download, Upload } from './icons'
import ScriptEditor from './views/ScriptEditor'
import Collaboration from './views/Collaboration'
import CompileExport from './views/CompileExport'
import { ProjectProvider, useProject } from './context/ProjectContext'

type View = 'editor' | 'collab' | 'compile'

const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'editor', label: 'Script Editor', icon: <PenLine size={16} /> },
  { id: 'collab', label: 'Collaboration', icon: <MessageSquare size={16} /> },
  { id: 'compile', label: 'Compile & Export', icon: <Layers size={16} /> },
]

function NavBar({ activeView, setActiveView }: { activeView: View; setActiveView: (v: View) => void }) {
  const { project, setProjectTitle, newProject, exportProject, importProject } = useProject()
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

  const handleNew = () => {
    if (confirm('Start a new project? Unsaved changes will be lost.')) newProject()
  }

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-ink-border bg-ink-dark shrink-0">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-ink-gold flex items-center justify-center">
            <PenLine size={15} className="text-ink-black" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-xl text-ink-light tracking-wide">Inkline</span>
        </div>

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
        {/* Project title */}
        {editingTitle ? (
          <input
            className="bg-transparent border-b border-ink-gold/60 outline-none text-xs font-sans text-ink-light w-40"
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
            className="text-xs text-ink-text font-sans hover:text-ink-light transition-colors"
          >
            {project.title}
          </button>
        )}

        <div className="w-px h-4 bg-ink-border" />

        {/* New project */}
        <button
          aria-label="New project"
          onClick={handleNew}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans text-ink-text hover:text-ink-light hover:bg-ink-panel transition-colors"
        >
          <Plus size={12} /> New
        </button>

        {/* Export */}
        <button
          aria-label="Export project as JSON"
          onClick={exportProject}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans text-ink-text hover:text-ink-light hover:bg-ink-panel transition-colors"
        >
          <Download size={12} /> Export
        </button>

        {/* Import */}
        <button
          aria-label="Import project from JSON"
          onClick={() => importRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-sans text-ink-text hover:text-ink-light hover:bg-ink-panel transition-colors"
        >
          <Upload size={12} /> Import
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <div className="w-px h-4 bg-ink-border" />

        <div className="w-8 h-8 rounded-full bg-ink-muted flex items-center justify-center">
          <User size={14} className="text-ink-text" />
        </div>
      </div>
    </header>
  )
}

function AppShell() {
  const [activeView, setActiveView] = useState<View>('editor')

  return (
    <div className="flex flex-col h-screen bg-ink-black">
      <NavBar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-hidden">
        {activeView === 'editor' && <ScriptEditor />}
        {activeView === 'collab' && <Collaboration />}
        {activeView === 'compile' && <CompileExport />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ProjectProvider>
      <AppShell />
    </ProjectProvider>
  )
}
