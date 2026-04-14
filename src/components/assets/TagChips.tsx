import { memo } from 'react'

interface TagChipsProps {
  tags: string[]
  activeTags: string[]
  onToggle: (tag: string) => void
}

function TagChips({ tags, activeTags, onToggle }: TagChipsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tags.map(tag => {
        const active = activeTags.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-sans transition-colors ${
              active
                ? 'bg-ink-gold text-ink-dark font-medium'
                : 'bg-ink-panel border border-ink-border text-ink-muted hover:text-ink-text hover:border-ink-gold/30'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}

export default memo(TagChips)
