import { memo, useState } from 'react'
import { X, Plus } from '../../icons'

interface TagEditorProps {
  tags: string[]
  autoTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

function TagEditor({ tags, autoTags, onAddTag, onRemoveTag }: TagEditorProps) {
  const [adding, setAdding] = useState(false)
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed) && !autoTags.includes(trimmed)) {
      onAddTag(trimmed)
    }
    setInput('')
    setAdding(false)
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {autoTags.map(tag => (
        <span
          key={`auto-${tag}`}
          className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-ink-panel border border-ink-border text-ink-muted"
        >
          {tag}
        </span>
      ))}

      {tags.map(tag => (
        <span
          key={`user-${tag}`}
          className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-ink-panel border border-ink-gold/30 text-ink-text flex items-center gap-1"
        >
          {tag}
          <button onClick={() => onRemoveTag(tag)} className="text-ink-muted hover:text-ink-text">
            <X size={8} />
          </button>
        </span>
      ))}

      {adding ? (
        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onBlur={handleAdd}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setInput(''); setAdding(false) } }}
          className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-ink-panel border border-ink-gold/40 text-ink-text outline-none w-20"
          placeholder="tag name"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-2 py-0.5 rounded-full text-[10px] font-sans border border-dashed border-ink-gold/30 text-ink-gold/70 hover:text-ink-gold hover:border-ink-gold/50 flex items-center gap-0.5 transition-colors"
        >
          <Plus size={8} /> add tag
        </button>
      )}
    </div>
  )
}

export default memo(TagEditor)
