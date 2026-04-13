import { useRef, useEffect, useState } from 'react'
import {
  Download,
  ChevronDown,
  FileDown,
  Image,
} from '../../icons'

/* ─── Static Data ─── */

const exportFormats = [
  { id: 'pdf', label: 'PDF (All Pages)', icon: <FileDown size={13} /> },
  { id: 'png', label: 'PNG (Single Image)', icon: <Image size={13} /> },
  { id: 'zip', label: 'ZIP (PNG Sequence)', icon: <Download size={13} /> },
]

/* ─── Component ─── */

interface ExportOptionsProps {
  exporting: boolean
  onExport: (type: string) => void
}

export default function ExportOptions({ exporting, onExport }: ExportOptionsProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement>(null)

  // Close export dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [exportOpen])

  const handleExport = (type: string) => {
    setExportOpen(false)
    onExport(type)
  }

  return (
    <div className="relative" ref={exportDropdownRef}>
      <button
        onClick={() => setExportOpen(!exportOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-sans bg-ink-gold text-ink-black font-medium hover:bg-ink-gold-dim transition-colors"
      >
        <Download size={14} />
        Export
        <ChevronDown size={12} />
      </button>
      {exportOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-ink-panel border border-ink-border rounded-lg shadow-xl z-10 py-1">
          {exportFormats.map((fmt) => (
            <button
              key={fmt.id}
              className="w-full text-left px-4 py-2 text-sm font-sans text-ink-text hover:text-ink-light hover:bg-ink-dark/50 transition-colors flex items-center gap-2"
              onClick={() => handleExport(fmt.id)}
              disabled={exporting}
            >
              <span className="text-ink-muted">{fmt.icon}</span>
              {fmt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
