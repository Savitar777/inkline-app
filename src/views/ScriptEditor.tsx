import { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  FileText,
  Send,
  Plus,
  Eye,
  Swords,
  Trash2,
  Check,
  X,
} from '../icons'
import Tag from '../components/Tag'
import PageBlock from '../components/PageBlock'
import SubmitToArtistModal from '../components/SubmitToArtistModal'
import ConfirmDialog from '../components/workspace/ConfirmDialog'
import { useProject } from '../context/ProjectContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { getEpisodeStats } from '../domain/selectors'
import type { Character } from '../types'

/* ─── Add Character Form ─── */

const CHAR_COLORS = ['#22C55E', '#F97316', '#3B82F6', '#A78BFA', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444']

function AddCharacterForm({ onSave, onCancel }: { onSave: (c: Omit<Character, 'id'>) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState(CHAR_COLORS[0])

  const submit = () => {
    if (!name.trim()) return
    onSave({ name: name.trim().toUpperCase(), role: role.trim(), desc: desc.trim(), color })
  }

  return (
    <div className="px-4 py-3 border-b border-ink-border bg-ink-black/30 space-y-2">
      <input
        className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-mono text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50"
        placeholder="CHARACTER NAME"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      <input
        className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50"
        placeholder="Role (e.g. Protagonist)"
        value={role}
        onChange={e => setRole(e.target.value)}
      />
      <textarea
        className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-sans text-ink-light placeholder:text-ink-muted outline-none resize-none leading-relaxed focus:border-ink-gold/50"
        placeholder="Description…"
        rows={2}
        value={desc}
        onChange={e => setDesc(e.target.value)}
      />
      <div className="flex items-center gap-1.5">
        {CHAR_COLORS.map(c => (
          <button
            key={c}
            aria-label={`Pick color ${c}`}
            onClick={() => setColor(c)}
            className="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110"
            style={{ backgroundColor: c, borderColor: color === c ? '#F5F0E8' : 'transparent' }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        <button onClick={onCancel} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans text-ink-muted hover:text-ink-text transition-colors">
          <X size={11} /> Cancel
        </button>
        <button onClick={submit} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans bg-ink-gold/20 text-ink-gold hover:bg-ink-gold/30 transition-colors">
          <Check size={11} /> Add
        </button>
      </div>
    </div>
  )
}

/* ─── Character Card ─── */

function CharacterCard({ char }: { char: Character }) {
  const { updateCharacter, deleteCharacter } = useProject()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: char.name, role: char.role, desc: char.desc, color: char.color })
  const [confirmDel, setConfirmDel] = useState(false)

  const save = () => {
    updateCharacter(char.id, draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-4 py-3 border-b border-ink-border/50 space-y-2">
        <input
          className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-mono text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50"
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value.toUpperCase() }))}
          autoFocus
        />
        <input
          className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50"
          value={draft.role}
          onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
        />
        <textarea
          className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-sans text-ink-light placeholder:text-ink-muted outline-none resize-none leading-relaxed focus:border-ink-gold/50"
          rows={2}
          value={draft.desc}
          onChange={e => setDraft(d => ({ ...d, desc: e.target.value }))}
        />
        <div className="flex items-center gap-1.5">
          {CHAR_COLORS.map(c => (
            <button key={c} aria-label={`Pick color ${c}`} onClick={() => setDraft(d => ({ ...d, color: c }))}
              className="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: draft.color === c ? '#F5F0E8' : 'transparent' }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans text-ink-muted hover:text-ink-text transition-colors">
            <X size={11} /> Cancel
          </button>
          <button onClick={save} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans bg-ink-gold/20 text-ink-gold hover:bg-ink-gold/30 transition-colors">
            <Check size={11} /> Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-b border-ink-border/50 group/char">
        <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: char.color }} />
          <span className="text-xs font-mono font-medium text-ink-light">{char.name}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/char:opacity-100 transition-opacity">
          <button aria-label="Edit character" onClick={() => setEditing(true)} className="p-0.5 rounded text-ink-muted hover:text-ink-gold transition-colors">
            <Eye size={11} />
          </button>
          <button aria-label="Delete character" onClick={() => setConfirmDel(true)} className="p-0.5 rounded text-ink-muted hover:text-red-400 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-sans mb-1.5 flex items-center gap-1">
        <Swords size={9} />
        {char.role}
      </div>
      <p className="text-xs text-ink-text font-sans leading-relaxed">{char.desc}</p>

      <ConfirmDialog
        open={confirmDel}
        title={`Delete ${char.name}?`}
        message="This removes the character from the project reference list."
        confirmLabel="Delete character"
        onConfirm={() => {
          deleteCharacter(char.id)
          setConfirmDel(false)
        }}
        onCancel={() => setConfirmDel(false)}
      />
    </div>
  )
}

/* ─── Main View ─── */

interface Props {
  onGoToCollab?: () => void
}

export default function ScriptEditor({ onGoToCollab }: Props = {}) {
  const {
    project, activeEpisodeId, setActiveEpisodeId,
    addEpisode, updateEpisode, deleteEpisode,
    addPage, updatePage, deletePage,
    addPanel, updatePanel, deletePanel,
    addContentBlock, updateContentBlock, deleteContentBlock,
    addCharacter,
  } = useProject()
  const { registerActionHandler } = useWorkspace()

  const episode = project.episodes.find(e => e.id === activeEpisodeId)

  const [editingTitle, setEditingTitle] = useState(false)
  const [editingBrief, setEditingBrief] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [briefDraft, setBriefDraft] = useState('')
  const [showAddChar, setShowAddChar] = useState(false)
  const [confirmDelEp, setConfirmDelEp] = useState<string | null>(null)
  const [showSubmit, setShowSubmit] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const briefRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (editingTitle && titleRef.current) titleRef.current.focus() }, [editingTitle])
  useEffect(() => { if (editingBrief && briefRef.current) briefRef.current.focus() }, [editingBrief])

  const startEditTitle = () => {
    if (!episode) return
    setTitleDraft(episode.title)
    setEditingTitle(true)
  }

  const saveTitle = () => {
    if (episode) updateEpisode(episode.id, { title: titleDraft })
    setEditingTitle(false)
  }

  const startEditBrief = () => {
    if (!episode) return
    setBriefDraft(episode.brief)
    setEditingBrief(true)
  }

  const saveBrief = () => {
    if (episode) updateEpisode(episode.id, { brief: briefDraft })
    setEditingBrief(false)
  }

  const stats = getEpisodeStats(episode)

  useEffect(() => registerActionHandler('submitToArtist', episode ? () => setShowSubmit(true) : null), [
    episode,
    registerActionHandler,
  ])

  return (
    <div className="flex h-full">
      {/* Left Sidebar — Episode List */}
      <aside className="w-56 border-r border-ink-border bg-ink-dark shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-ink-border">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Episodes</span>
            <button
              aria-label="Add episode"
              onClick={addEpisode}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-ink-panel text-ink-text hover:text-ink-gold transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
        <div role="tree" aria-label="Episode list" className="flex-1 overflow-y-auto py-1">
          {project.episodes.length === 0 && (
            <p className="px-4 py-3 text-xs text-ink-muted font-sans italic">No episodes yet.</p>
          )}
          {project.episodes.map((ep) => (
            <div key={ep.id} role="treeitem" aria-selected={activeEpisodeId === ep.id} className="group/ep relative">
              <button
                onClick={() => setActiveEpisodeId(ep.id)}
                className={`w-full text-left px-4 py-2.5 flex items-start gap-2 transition-colors ${
                  activeEpisodeId === ep.id
                    ? 'bg-ink-panel border-l-2 border-ink-gold'
                    : 'hover:bg-ink-panel/50 border-l-2 border-transparent'
                }`}
              >
                <BookOpen size={13} className={`mt-0.5 shrink-0 ${activeEpisodeId === ep.id ? 'text-ink-gold' : 'text-ink-muted'}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-mono ${activeEpisodeId === ep.id ? 'text-ink-gold' : 'text-ink-text'}`}>
                    EP {ep.number}
                  </div>
                  <div className={`text-sm font-sans leading-tight truncate ${activeEpisodeId === ep.id ? 'text-ink-light' : 'text-ink-text'}`}>
                    {ep.title}
                  </div>
                </div>
              </button>
              <button
                aria-label="Delete episode"
                onClick={e => { e.stopPropagation(); setConfirmDelEp(ep.id) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/ep:opacity-100 p-1 rounded text-ink-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Script Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!episode ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText size={32} className="text-ink-muted mb-3" />
            <p className="text-sm text-ink-text font-sans">No episode selected.</p>
            <button onClick={addEpisode} className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans text-ink-gold border border-ink-gold/30 hover:bg-ink-gold/10 transition-colors">
              <Plus size={12} /> New Episode
            </button>
          </div>
        ) : (
          <>
            {/* Episode Header */}
            <div className="px-6 py-4 border-b border-ink-border bg-ink-dark/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag type="episode">Episode {episode.number}</Tag>
                  {editingTitle ? (
                    <input
                      ref={titleRef}
                      className="font-serif text-xl text-ink-light bg-transparent border-b border-ink-gold/60 outline-none"
                      value={titleDraft}
                      onChange={e => setTitleDraft(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
                    />
                  ) : (
                    <h2
                      role="button"
                      tabIndex={0}
                      aria-label="Edit episode title"
                      onClick={startEditTitle}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditTitle() }}
                      className="font-serif text-xl text-ink-light cursor-pointer hover:text-ink-gold transition-colors"
                    >
                      {episode.title}
                    </h2>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans text-ink-text hover:text-ink-light hover:bg-ink-panel transition-colors">
                    <Eye size={13} />
                    Preview
                  </button>
                  <button
                    onClick={() => setShowSubmit(true)}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-sans bg-ink-gold text-ink-black font-medium hover:bg-ink-gold-dim transition-colors"
                  >
                    <Send size={13} />
                    Submit to Artist
                  </button>
                </div>
              </div>
              {editingBrief ? (
                <textarea
                  ref={briefRef}
                  className="mt-2 text-sm text-ink-text font-sans leading-relaxed max-w-2xl w-full bg-transparent border border-ink-gold/40 rounded px-2 py-1 outline-none resize-none"
                  rows={3}
                  value={briefDraft}
                  onChange={e => setBriefDraft(e.target.value)}
                  onBlur={saveBrief}
                  onKeyDown={e => { if (e.key === 'Escape') setEditingBrief(false) }}
                />
              ) : (
                <p
                  role="button"
                  tabIndex={0}
                  aria-label="Edit episode brief"
                  onClick={startEditBrief}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditBrief() }}
                  className="text-sm text-ink-text font-sans mt-2 leading-relaxed max-w-2xl cursor-pointer hover:text-ink-light transition-colors"
                >
                  {episode.brief || <span className="text-ink-muted italic">Click to add episode brief…</span>}
                </p>
              )}
            </div>

            {/* Script Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {episode.pages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText size={32} className="text-ink-muted mb-3" />
                  <p className="text-sm text-ink-text font-sans">No pages yet.</p>
                  <button
                    aria-label="Add page"
                    onClick={() => addPage(episode.id)}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans text-ink-gold border border-ink-gold/30 hover:bg-ink-gold/10 transition-colors"
                  >
                    <Plus size={12} /> Add Page
                  </button>
                </div>
              ) : (
                <div role="tree" aria-label="Script pages" className="space-y-4 max-w-3xl">
                  {episode.pages.map(page => (
                    <PageBlock
                      key={page.id}
                      page={page}
                      episodeId={episode.id}
                      onUpdatePage={(pageId, updates) => updatePage(episode.id, pageId, updates)}
                      onDeletePage={pageId => deletePage(episode.id, pageId)}
                      onAddPanel={(pageId, shot) => addPanel(episode.id, pageId, shot)}
                      onUpdatePanel={(pageId, panelId, updates) => updatePanel(episode.id, pageId, panelId, updates)}
                      onDeletePanel={(pageId, panelId) => deletePanel(episode.id, pageId, panelId)}
                      onAddBlock={(pageId, panelId, type) => addContentBlock(episode.id, pageId, panelId, type)}
                      onUpdateBlock={(pageId, panelId, blockId, updates) => updateContentBlock(episode.id, pageId, panelId, blockId, updates)}
                      onDeleteBlock={(pageId, panelId, blockId) => deleteContentBlock(episode.id, pageId, panelId, blockId)}
                    />
                  ))}
                  <button
                    aria-label="Add page"
                    onClick={() => addPage(episode.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-sans text-ink-text border border-dashed border-ink-border hover:border-ink-gold/30 hover:text-ink-gold transition-colors mt-4"
                  >
                    <Plus size={12} /> Add Page
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar — Characters */}
      <aside className="w-64 border-l border-ink-border bg-ink-dark shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-ink-border">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Characters</span>
            <button
              aria-label="Add character"
              onClick={() => setShowAddChar(v => !v)}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-ink-panel text-ink-text hover:text-ink-gold transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {showAddChar && (
          <AddCharacterForm
            onSave={char => { addCharacter(char); setShowAddChar(false) }}
            onCancel={() => setShowAddChar(false)}
          />
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {project.characters.length === 0 && !showAddChar && (
            <p className="px-4 py-3 text-xs text-ink-muted font-sans italic">No characters yet.</p>
          )}
          {project.characters.map(char => (
            <CharacterCard key={char.id} char={char} />
          ))}
        </div>

        {/* Script Stats */}
        <div className="px-4 py-3 border-t border-ink-border">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Script Stats</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Pages', value: stats.pages },
              { label: 'Panels', value: stats.panels },
              { label: 'Dialogue', value: stats.dialogue },
              { label: 'SFX', value: stats.sfx },
            ].map(({ label, value }) => (
              <div key={label} className="bg-ink-panel rounded px-2 py-1.5">
                <div className="text-xs font-mono text-ink-light">{value}</div>
                <div className="text-[10px] text-ink-muted font-sans">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {showSubmit && episode && (
        <SubmitToArtistModal
          episode={episode}
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => { setShowSubmit(false); onGoToCollab?.() }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelEp}
        title="Delete Episode?"
        message="This removes the episode and all of its pages, panels, and collaboration context."
        confirmLabel="Delete episode"
        onConfirm={() => {
          if (confirmDelEp) deleteEpisode(confirmDelEp)
          setConfirmDelEp(null)
        }}
        onCancel={() => setConfirmDelEp(null)}
      />
    </div>
  )
}
