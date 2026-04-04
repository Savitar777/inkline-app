import { useState } from 'react'
import { PenLine, MessageSquare, Layers, User } from './icons'
import ScriptEditor from './views/ScriptEditor'
import Collaboration from './views/Collaboration'
import CompileExport from './views/CompileExport'

type View = 'editor' | 'collab' | 'compile'

const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'editor', label: 'Script Editor', icon: <PenLine size={16} /> },
  { id: 'collab', label: 'Collaboration', icon: <MessageSquare size={16} /> },
  { id: 'compile', label: 'Compile & Export', icon: <Layers size={16} /> },
]

export default function App() {
  const [activeView, setActiveView] = useState<View>('editor')

  return (
    <div className="flex flex-col h-screen bg-ink-black">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-ink-border bg-ink-dark shrink-0">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-ink-gold flex items-center justify-center">
              <PenLine size={15} className="text-ink-black" strokeWidth={2.5} />
            </div>
            <span className="font-serif text-xl text-ink-light tracking-wide">Inkline</span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1">
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
        <div className="flex items-center gap-4">
          <span className="text-xs text-ink-text font-sans">The Obsidian Protocol</span>
          <div className="w-8 h-8 rounded-full bg-ink-muted flex items-center justify-center">
            <User size={14} className="text-ink-text" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeView === 'editor' && <ScriptEditor />}
        {activeView === 'collab' && <Collaboration />}
        {activeView === 'compile' && <CompileExport />}
      </main>
    </div>
  )
}
