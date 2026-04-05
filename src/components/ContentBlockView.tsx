import { useState } from 'react'
import { MessageCircle, Quote, Volume2, Trash2, Check, X } from '../icons'
import type { ContentBlock } from '../types'

interface Props {
  block: ContentBlock
  episodeId: string
  pageId: string
  panelId: string
  onUpdate: (blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'type'>>) => void
  onDelete: (blockId: string) => void
}

export default function ContentBlockView({ block, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ character: block.character ?? '', parenthetical: block.parenthetical ?? '', text: block.text })

  const save = () => {
    onUpdate(block.id, {
      character: draft.character || undefined,
      parenthetical: draft.parenthetical || undefined,
      text: draft.text,
    })
    setEditing(false)
  }

  const cancel = () => {
    setDraft({ character: block.character ?? '', parenthetical: block.parenthetical ?? '', text: block.text })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="pl-4 py-2 border border-ink-border/60 rounded-md bg-ink-black/40 space-y-2 mx-1 my-1">
        {(block.type === 'dialogue' || block.type === 'caption') && (
          <div className="flex gap-2">
            <input
              className="flex-1 bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-mono text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50"
              placeholder="Character"
              value={draft.character}
              onChange={e => setDraft(d => ({ ...d, character: e.target.value }))}
            />
            {block.type === 'dialogue' && (
              <input
                className="w-32 bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-mono text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50"
                placeholder="parenthetical"
                value={draft.parenthetical}
                onChange={e => setDraft(d => ({ ...d, parenthetical: e.target.value }))}
              />
            )}
          </div>
        )}
        <textarea
          className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-mono text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50 resize-none leading-relaxed"
          rows={2}
          placeholder="Text..."
          value={draft.text}
          onChange={e => setDraft(d => ({ ...d, text: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save() }}
          autoFocus
        />
        <div className="flex items-center justify-between">
          <button
            aria-label="Delete block"
            onClick={() => onDelete(block.id)}
            className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} /> Delete
          </button>
          <div className="flex items-center gap-1.5">
            <button aria-label="Cancel" onClick={cancel} className="p-1 rounded hover:bg-ink-panel text-ink-muted hover:text-ink-text transition-colors">
              <X size={13} />
            </button>
            <button aria-label="Save" onClick={save} className="flex items-center gap-1 px-2 py-1 rounded bg-ink-gold/20 text-ink-gold text-[11px] font-sans hover:bg-ink-gold/30 transition-colors">
              <Check size={11} /> Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (block.type === 'dialogue') {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Edit dialogue block"
        onClick={() => setEditing(true)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEditing(true) }}
        className="flex items-start gap-3 pl-4 py-1.5 rounded hover:bg-ink-panel/40 cursor-pointer transition-colors group"
      >
        <MessageCircle size={12} className="text-tag-dialogue mt-1 shrink-0" />
        <div className="text-sm font-mono leading-relaxed">
          <span className="text-tag-dialogue font-medium">{block.character || 'CHARACTER'}</span>
          {block.parenthetical && <span className="text-ink-text text-xs ml-1">({block.parenthetical})</span>}
          <span className="text-ink-light">: {block.text || <em className="text-ink-muted not-italic">empty</em>}</span>
        </div>
      </div>
    )
  }

  if (block.type === 'caption') {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Edit caption block"
        onClick={() => setEditing(true)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEditing(true) }}
        className="flex items-start gap-3 pl-4 py-1.5 rounded hover:bg-ink-panel/40 cursor-pointer transition-colors group"
      >
        <Quote size={12} className="text-tag-caption mt-1 shrink-0" />
        <div className="text-sm font-mono leading-relaxed">
          <span className="text-tag-caption font-medium">CAPTION</span>
          {block.character && <span className="text-ink-text text-xs ml-1">({block.character})</span>}
          <span className="text-ink-light italic">: {block.text || <em className="text-ink-muted not-italic">empty</em>}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Edit SFX block"
      onClick={() => setEditing(true)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEditing(true) }}
      className="flex items-start gap-3 pl-4 py-1.5 rounded hover:bg-ink-panel/40 cursor-pointer transition-colors group"
    >
      <Volume2 size={12} className="text-[#F97316] mt-1 shrink-0" />
      <div className="text-sm font-mono leading-relaxed">
        <span className="text-[#F97316] font-medium">SFX</span>
        <span className="text-ink-light">: {block.text || <em className="text-ink-muted not-italic">empty</em>}</span>
      </div>
    </div>
  )
}
