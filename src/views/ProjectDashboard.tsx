import { useState, useEffect } from 'react'
import { PenLine, Plus, BookOpen, Layers } from '../icons'
import { useAuth } from '../context/AuthContext'
import { listProjects, createProject } from '../services/projectService'
import type { ProjectFormat } from '../lib/database.types'

const FORMAT_LABELS: Record<ProjectFormat, string> = {
  webtoon: 'Webtoon',
  manhwa: 'Manhwa',
  manga: 'Manga',
  comic: 'Comic',
}

const FORMATS: ProjectFormat[] = ['webtoon', 'manhwa', 'manga', 'comic']

interface ProjectRow {
  id: string
  title: string
  format: ProjectFormat
  created_at: string
}

interface Props {
  onOpenProject: (projectId: string) => void
}

export default function ProjectDashboard({ onOpenProject }: Props) {
  const { profile, signOut } = useAuth()
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newFormat, setNewFormat] = useState<ProjectFormat>('webtoon')
  const [creating, setCreating] = useState(false)

  const load = async () => {
    if (!profile) return
    setLoading(true)
    const data = await listProjects(profile.id)
    setProjects(data as ProjectRow[])
    setLoading(false)
  }

  useEffect(() => { load() }, [profile])

  const handleCreate = async () => {
    if (!newTitle.trim() || !profile) return
    setCreating(true)
    const id = await createProject(newTitle.trim(), newFormat, profile.id)
    if (id) {
      setShowNew(false)
      setNewTitle('')
      setNewFormat('webtoon')
      onOpenProject(id)
    }
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-ink-black flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 h-14 border-b border-ink-border bg-ink-dark shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-ink-gold flex items-center justify-center">
            <PenLine size={14} className="text-ink-black" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-xl text-ink-light tracking-wide">Inkline</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-ink-text font-sans">{profile?.name}</span>
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans border border-ink-border rounded px-1.5 py-0.5">
            {profile?.role}
          </span>
          <button
            onClick={signOut}
            className="text-xs text-ink-muted font-sans hover:text-ink-text transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-8 py-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl text-ink-light">Your Projects</h1>
            <p className="text-xs text-ink-text font-sans mt-1">Select a project to open, or create a new one.</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-gold text-ink-black text-sm font-sans font-semibold hover:bg-ink-gold-dim transition-colors"
          >
            <Plus size={14} /> New Project
          </button>
        </div>

        {/* New project form */}
        {showNew && (
          <div className="mb-6 bg-ink-dark border border-ink-gold/30 rounded-xl p-6 space-y-4">
            <h2 className="font-serif text-lg text-ink-light">New Project</h2>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">Title</label>
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
                className="w-full bg-ink-panel border border-ink-border rounded-lg px-3 py-2.5 text-sm font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/60 transition-colors"
                placeholder="e.g. The Obsidian Protocol"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-2">Format</label>
              <div className="flex gap-2">
                {FORMATS.map(f => (
                  <button
                    key={f}
                    onClick={() => setNewFormat(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans border transition-all ${
                      newFormat === f
                        ? 'border-ink-gold/60 bg-ink-gold/10 text-ink-gold'
                        : 'border-ink-border bg-ink-panel text-ink-text hover:border-ink-gold/30'
                    }`}
                  >
                    {FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || creating}
                className="px-4 py-2 rounded-lg bg-ink-gold text-ink-black text-sm font-sans font-semibold hover:bg-ink-gold-dim transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button
                onClick={() => { setShowNew(false); setNewTitle(''); setNewFormat('webtoon') }}
                className="px-4 py-2 rounded-lg text-sm font-sans text-ink-muted hover:text-ink-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Project grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-xl bg-ink-dark border border-ink-border animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-xl bg-ink-dark border border-ink-border flex items-center justify-center mb-4">
              <BookOpen size={22} className="text-ink-muted" />
            </div>
            <p className="text-sm text-ink-text font-sans mb-1">No projects yet.</p>
            <p className="text-xs text-ink-muted font-sans">Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {projects.map(proj => (
              <button
                key={proj.id}
                onClick={() => onOpenProject(proj.id)}
                className="text-left bg-ink-dark border border-ink-border hover:border-ink-gold/40 rounded-xl p-5 transition-all group hover:bg-ink-panel"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-ink-gold/10 border border-ink-gold/20 flex items-center justify-center group-hover:bg-ink-gold/20 transition-colors">
                    <Layers size={16} className="text-ink-gold" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans border border-ink-border rounded px-1.5 py-0.5">
                    {FORMAT_LABELS[proj.format]}
                  </span>
                </div>
                <h3 className="font-serif text-base text-ink-light leading-tight mb-1 group-hover:text-ink-gold transition-colors">
                  {proj.title}
                </h3>
                <p className="text-[11px] text-ink-muted font-sans">
                  {new Date(proj.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
