interface TagProps {
  type: 'episode' | 'page' | 'panel' | 'dialogue' | 'caption' | 'sfx'
  children: React.ReactNode
}

const colors: Record<string, string> = {
  episode: 'bg-tag-episode/15 text-tag-episode border-tag-episode/30',
  page: 'bg-tag-page/15 text-tag-page border-tag-page/30',
  panel: 'bg-tag-panel/15 text-tag-panel border-tag-panel/30',
  dialogue: 'bg-tag-dialogue/15 text-tag-dialogue border-tag-dialogue/30',
  caption: 'bg-tag-caption/15 text-tag-caption border-tag-caption/30',
  sfx: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30',
}

export default function Tag({ type, children }: TagProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono font-medium border ${colors[type]}`}>
      {children}
    </span>
  )
}
