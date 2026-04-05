import { ArrowRight } from '../icons'

type Format = 'webtoon' | 'manhwa' | 'manga' | 'comic'

export default function FormatPreview({ format }: { format: Format }) {
  if (format === 'webtoon' || format === 'manhwa') {
    return (
      <div className="flex flex-col items-center gap-1.5 w-24">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-full rounded-sm ${
              i <= 4 ? 'bg-ink-gold/20 border border-ink-gold/30' : 'bg-ink-muted/20 border border-ink-border border-dashed'
            }`}
            style={{ height: i === 1 ? 48 : i === 3 ? 28 : 36 }}
          />
        ))}
        <ArrowRight size={12} className="text-ink-muted rotate-90 mt-1" />
        <span className="text-[9px] text-ink-muted font-mono">scroll ↓</span>
      </div>
    )
  }

  if (format === 'manga') {
    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-20 h-28 rounded-sm border border-ink-border bg-ink-panel p-1.5 grid grid-cols-2 grid-rows-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`rounded-sm ${i <= 4 ? 'bg-ink-gold/20 border border-ink-gold/30' : 'bg-ink-muted/20 border border-ink-border border-dashed'}`} />
            ))}
          </div>
          <span className="text-[9px] text-ink-muted font-mono">P2</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-20 h-28 rounded-sm border border-ink-gold/30 bg-ink-panel p-1.5 grid grid-cols-2 grid-rows-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-sm bg-ink-gold/20 border border-ink-gold/30" />
            ))}
          </div>
          <span className="text-[9px] text-ink-muted font-mono">P1</span>
        </div>
        <div className="flex items-center">
          <span className="text-[9px] text-ink-muted font-mono">← RTL</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-28 rounded-sm border border-ink-gold/30 bg-ink-panel p-1.5 grid grid-cols-2 grid-rows-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-sm bg-ink-gold/20 border border-ink-gold/30" />
          ))}
        </div>
        <span className="text-[9px] text-ink-muted font-mono">P1</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-28 rounded-sm border border-ink-border bg-ink-panel p-1.5 grid grid-cols-2 grid-rows-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`rounded-sm ${i <= 4 ? 'bg-ink-gold/20 border border-ink-gold/30' : 'bg-ink-muted/20 border border-ink-border border-dashed'}`} />
          ))}
        </div>
        <span className="text-[9px] text-ink-muted font-mono">P2</span>
      </div>
      <div className="flex items-center">
        <span className="text-[9px] text-ink-muted font-mono">LTR →</span>
      </div>
    </div>
  )
}
