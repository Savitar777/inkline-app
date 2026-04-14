import { useState, useMemo } from 'react'
import { Search, X } from '../icons'
import { GLOSSARY_ENTRIES } from '../data/tutorials/glossary'
import { TUTORIAL_MODULES } from '../data/tutorials/modules'
import type { GlossaryEntry } from '../data/tutorials/types'

/* ─── Glossary Modal (single entry) ─── */

interface GlossaryModalProps {
  entryId: string
  onClose: () => void
  onNavigate: (entryId: string) => void
}

export function GlossaryModal({ entryId, onClose, onNavigate }: GlossaryModalProps) {
  const entry = GLOSSARY_ENTRIES.find(e => e.id === entryId)
  if (!entry) return null

  const relatedTerms = (entry.relatedTermIds ?? [])
    .map(id => GLOSSARY_ENTRIES.find(e => e.id === id))
    .filter(Boolean) as GlossaryEntry[]

  const relatedModules = (entry.relatedModuleIds ?? [])
    .map(id => TUTORIAL_MODULES.find(m => m.id === id))
    .filter((m): m is (typeof TUTORIAL_MODULES)[number] => !!m)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ink-stage-enter">
      <div className="w-[400px] max-h-[60vh] bg-ink-dark border border-ink-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-border">
          <span className="text-sm font-serif text-ink-light">{entry.term}</span>
          <button onClick={onClose} className="p-1 rounded text-ink-muted hover:text-ink-text transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-xs text-ink-text font-sans leading-relaxed">{entry.definition}</p>

          {entry.formats && (
            <div className="flex gap-1.5">
              {entry.formats.map(f => (
                <span key={f} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-panel border border-ink-border text-ink-muted">{f}</span>
              ))}
            </div>
          )}

          {relatedTerms.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-1.5">Related Terms</span>
              <div className="flex flex-wrap gap-1.5">
                {relatedTerms.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onNavigate(t.id)}
                    className="text-[11px] font-sans px-2 py-1 rounded border border-ink-border text-ink-text hover:border-ink-gold/30 hover:text-ink-gold transition-colors"
                  >
                    {t.term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {relatedModules.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-1.5">Related Modules</span>
              <div className="space-y-1">
                {relatedModules.map(m => (
                  <div key={m.id} className="text-[11px] font-sans text-ink-text px-2 py-1.5 rounded border border-ink-border">
                    {m.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Glossary List (full tab) ─── */

interface GlossaryListProps {
  onSelectEntry?: (entryId: string) => void
}

export default function GlossaryList({ onSelectEntry }: GlossaryListProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return GLOSSARY_ENTRIES
    return GLOSSARY_ENTRIES.filter(e =>
      e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    )
  }, [search])

  // Group by first letter
  const grouped = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.term.localeCompare(b.term))
    const map = new Map<string, GlossaryEntry[]>()
    for (const entry of sorted) {
      const letter = entry.term[0].toUpperCase()
      const group = map.get(letter) ?? []
      group.push(entry)
      map.set(letter, group)
    }
    return map
  }, [filtered])

  const letters = Array.from(grouped.keys()).sort()

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search glossary..."
          className="w-full pl-9 pr-3 py-2 bg-ink-panel border border-ink-border rounded-lg text-xs font-sans text-ink-text placeholder:text-ink-muted outline-none focus:border-ink-gold/30"
        />
      </div>

      {/* Letter anchors */}
      {letters.length > 5 && (
        <div className="flex flex-wrap gap-1">
          {letters.map(letter => (
            <a
              key={letter}
              href={`#glossary-${letter}`}
              className="text-[10px] font-mono text-ink-muted hover:text-ink-gold px-1.5 py-0.5 rounded border border-ink-border hover:border-ink-gold/30 transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-ink-muted text-sm font-sans">No matching terms</div>
      ) : (
        <div className="space-y-4">
          {letters.map(letter => (
            <div key={letter} id={`glossary-${letter}`}>
              <div className="text-xs font-mono text-ink-gold mb-1.5 px-1">{letter}</div>
              <div className="space-y-1">
                {grouped.get(letter)!.map(entry => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onSelectEntry?.(entry.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg border border-ink-border bg-ink-dark hover:border-ink-gold/20 transition-colors"
                  >
                    <span className="text-sm font-serif text-ink-light">{entry.term}</span>
                    <p className="text-[11px] text-ink-text font-sans mt-0.5 line-clamp-2">{entry.definition}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
