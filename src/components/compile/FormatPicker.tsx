/* eslint-disable react-refresh/only-export-components */
import {
  Monitor,
  Smartphone,
  BookOpen,
  ScrollText,
} from '../../icons'

/* ─── Types ─── */

export type Format = 'webtoon' | 'manhwa' | 'manga' | 'comic'

export interface FormatOption {
  id: Format
  label: string
  desc: string
  icon: React.ReactNode
  specs: string
}

export const formats: FormatOption[] = [
  { id: 'webtoon', label: 'Webtoon', desc: 'Vertical scroll, single column', icon: <Smartphone size={18} />, specs: '800px wide · Infinite scroll · RGB' },
  { id: 'manhwa', label: 'Manhwa', desc: 'Korean format, vertical scroll', icon: <ScrollText size={18} />, specs: '720px wide · Vertical · RGB' },
  { id: 'manga', label: 'Manga', desc: 'Right-to-left, page-based', icon: <BookOpen size={18} />, specs: 'B5 (182×257mm) · RTL · Grayscale' },
  { id: 'comic', label: 'Comic', desc: 'Western format, page grid', icon: <Monitor size={18} />, specs: '6.625×10.25" · LTR · CMYK' },
]

interface FormatPickerProps {
  selectedFormat: Format
  onSelectFormat: (format: Format) => void
}

export default function FormatPicker({ selectedFormat, onSelectFormat }: FormatPickerProps) {
  return (
    <div className="px-6 py-5 border-b border-ink-border">
      <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium block mb-3">Output Format</span>
      <div className="grid grid-cols-4 gap-3">
        {formats.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => onSelectFormat(fmt.id)}
            className={`text-left p-4 rounded-lg border transition-all ${
              selectedFormat === fmt.id
                ? 'border-ink-gold bg-ink-gold/5'
                : 'border-ink-border bg-ink-panel hover:border-ink-muted'
            }`}
          >
            <div className={`mb-2 ${selectedFormat === fmt.id ? 'text-ink-gold' : 'text-ink-muted'}`}>
              {fmt.icon}
            </div>
            <div className={`text-sm font-sans font-medium ${selectedFormat === fmt.id ? 'text-ink-gold' : 'text-ink-light'}`}>
              {fmt.label}
            </div>
            <div className="text-[11px] text-ink-text font-sans mt-0.5">{fmt.desc}</div>
            <div className="text-[10px] text-ink-muted font-mono mt-2">{fmt.specs}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
