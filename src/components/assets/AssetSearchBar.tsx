import { memo, useState, useEffect, useRef } from 'react'
import { Search, X } from '../../icons'

interface AssetSearchBarProps {
  value: string
  onChange: (query: string) => void
  debounceMs?: number
}

function AssetSearchBar({ value, onChange, debounceMs = 300 }: AssetSearchBarProps) {
  const [local, setLocal] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setLocal(value)
  }, [value])

  const handleChange = (next: string) => {
    setLocal(next)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(next), debounceMs)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-ink-border bg-ink-panel focus-within:border-ink-gold/40 transition-colors">
      <Search size={13} className="text-ink-muted shrink-0" />
      <input
        type="text"
        value={local}
        onChange={e => handleChange(e.target.value)}
        placeholder="Search files, tags\u2026"
        className="flex-1 bg-transparent text-xs text-ink-text font-sans outline-none placeholder:text-ink-muted/60"
      />
      {local && (
        <button onClick={() => handleChange('')} className="p-0.5 text-ink-muted hover:text-ink-text transition-colors">
          <X size={11} />
        </button>
      )}
    </div>
  )
}

export default memo(AssetSearchBar)
