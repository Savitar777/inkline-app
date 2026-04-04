import { useState } from 'react'
import {
  Download,
  Check,
  AlertCircle,
  Layers,
  ArrowRight,
  Monitor,
  Smartphone,
  BookOpen,
  ScrollText,
  Image,
  FileDown,
  ChevronDown,
} from '../icons'

/* ─── Types ─── */

type Format = 'webtoon' | 'manhwa' | 'manga' | 'comic'

interface PanelThumb {
  id: string
  page: number
  panel: number
  status: 'complete' | 'missing' | 'review'
  label: string
}

/* ─── Mock Data ─── */

const formats: { id: Format; label: string; desc: string; icon: React.ReactNode; specs: string }[] = [
  { id: 'webtoon', label: 'Webtoon', desc: 'Vertical scroll, single column', icon: <Smartphone size={18} />, specs: '800px wide · Infinite scroll · RGB' },
  { id: 'manhwa', label: 'Manhwa', desc: 'Korean format, vertical scroll', icon: <ScrollText size={18} />, specs: '720px wide · Vertical · RGB' },
  { id: 'manga', label: 'Manga', desc: 'Right-to-left, page-based', icon: <BookOpen size={18} />, specs: 'B5 (182×257mm) · RTL · Grayscale' },
  { id: 'comic', label: 'Comic', desc: 'Western format, page grid', icon: <Monitor size={18} />, specs: '6.625×10.25" · LTR · CMYK' },
]

const panels: PanelThumb[] = [
  { id: 'c1', page: 1, panel: 1, status: 'complete', label: 'Helix exterior — establishing' },
  { id: 'c2', page: 1, panel: 2, status: 'complete', label: 'Lobby — Mira walks in' },
  { id: 'c3', page: 1, panel: 3, status: 'complete', label: 'Elevator button close-up' },
  { id: 'c4', page: 1, panel: 4, status: 'review', label: 'Boardroom — Cole waiting' },
  { id: 'c5', page: 2, panel: 1, status: 'complete', label: 'Folder slide — Cole\'s hand' },
  { id: 'c6', page: 2, panel: 2, status: 'missing', label: 'Mira\'s eyes — extreme CU' },
  { id: 'c7', page: 2, panel: 3, status: 'missing', label: 'Boardroom wide — standoff' },
]

const exportFormats = ['PDF', 'PNG Sequence', 'PSD Layers', 'TIFF (Print)']

/* ─── Format Preview ─── */

function FormatPreview({ format }: { format: Format }) {
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
        {/* Right page first for RTL */}
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
  // Comic (Western)
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

/* ─── Component ─── */

export default function CompileExport() {
  const [selectedFormat, setSelectedFormat] = useState<Format>('webtoon')
  const [exportOpen, setExportOpen] = useState(false)

  const completeCount = panels.filter((p) => p.status === 'complete').length
  const totalCount = panels.length
  const percentage = Math.round((completeCount / totalCount) * 100)

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-border bg-ink-dark/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-ink-light">Compile & Export</h2>
              <p className="text-xs text-ink-text font-sans mt-1">EP3 — The Offer · {totalCount} panels across 2 pages</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Export dropdown */}
              <div className="relative">
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
                        key={fmt}
                        className="w-full text-left px-4 py-2 text-sm font-sans text-ink-text hover:text-ink-light hover:bg-ink-dark/50 transition-colors flex items-center gap-2"
                        onClick={() => setExportOpen(false)}
                      >
                        <FileDown size={13} className="text-ink-muted" />
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Format Selector */}
          <div className="px-6 py-5 border-b border-ink-border">
            <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium block mb-3">Output Format</span>
            <div className="grid grid-cols-4 gap-3">
              {formats.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
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

          {/* Layout Preview */}
          <div className="px-6 py-5 border-b border-ink-border">
            <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium block mb-4">Layout Preview</span>
            <div className="flex items-center justify-center py-6 bg-ink-panel rounded-lg border border-ink-border">
              <FormatPreview format={selectedFormat} />
            </div>
          </div>

          {/* Panel Grid */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Panels</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-status-approved" />
                  <span className="text-[10px] text-ink-muted font-sans">Complete</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-status-draft" />
                  <span className="text-[10px] text-ink-muted font-sans">In Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-ink-muted" />
                  <span className="text-[10px] text-ink-muted font-sans">Missing</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {panels.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-lg border overflow-hidden ${
                    p.status === 'complete'
                      ? 'border-status-approved/30'
                      : p.status === 'review'
                      ? 'border-status-draft/30'
                      : 'border-ink-border border-dashed'
                  }`}
                >
                  {/* Thumbnail area */}
                  <div className={`h-32 flex items-center justify-center relative ${
                    p.status === 'missing' ? 'bg-ink-panel' : 'bg-ink-muted/10'
                  }`}>
                    {p.status === 'complete' && (
                      <>
                        <div className="absolute inset-0 opacity-5" style={{
                          backgroundImage: `linear-gradient(135deg, rgba(212,168,67,0.3) 0%, transparent 50%, rgba(212,168,67,0.1) 100%)`,
                        }} />
                        <Image size={20} className="text-ink-muted/50" />
                        <div className="absolute top-2 right-2">
                          <Check size={14} className="text-status-approved" />
                        </div>
                      </>
                    )}
                    {p.status === 'review' && (
                      <>
                        <Image size={20} className="text-ink-muted/50" />
                        <div className="absolute top-2 right-2">
                          <AlertCircle size={14} className="text-status-draft" />
                        </div>
                      </>
                    )}
                    {p.status === 'missing' && (
                      <div className="flex flex-col items-center gap-1">
                        <Layers size={18} className="text-ink-muted/30" />
                        <span className="text-[9px] text-ink-muted font-sans">Awaiting art</span>
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2 bg-ink-dark border-t border-ink-border/50">
                    <div className="text-[10px] font-mono text-ink-text">
                      P{p.page} · Panel {p.panel}
                    </div>
                    <div className="text-[11px] text-ink-muted font-sans truncate mt-0.5">
                      {p.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar — Progress */}
      <aside className="w-64 border-l border-ink-border bg-ink-dark shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-ink-border">
          <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Progress</span>
        </div>

        {/* Completion Ring */}
        <div className="px-4 py-6 border-b border-ink-border flex flex-col items-center">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#2A2A2A" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="#D4A843"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.64} ${264 - percentage * 2.64}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono text-ink-light">{percentage}%</span>
              <span className="text-[10px] text-ink-muted font-sans">complete</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-4 border-b border-ink-border space-y-3">
          {[
            { label: 'Total panels', value: totalCount, color: 'text-ink-light' },
            { label: 'Complete', value: completeCount, color: 'text-status-approved' },
            { label: 'In review', value: panels.filter(p => p.status === 'review').length, color: 'text-status-draft' },
            { label: 'Missing', value: panels.filter(p => p.status === 'missing').length, color: 'text-ink-muted' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-xs text-ink-text font-sans">{stat.label}</span>
              <span className={`text-sm font-mono ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Format Info */}
        <div className="px-4 py-4 border-b border-ink-border">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Selected Format</span>
          <div className="bg-ink-panel rounded-lg p-3 border border-ink-border">
            <div className="text-sm font-sans text-ink-gold font-medium">
              {formats.find(f => f.id === selectedFormat)?.label}
            </div>
            <div className="text-[11px] text-ink-text font-sans mt-1">
              {formats.find(f => f.id === selectedFormat)?.desc}
            </div>
            <div className="text-[10px] text-ink-muted font-mono mt-2">
              {formats.find(f => f.id === selectedFormat)?.specs}
            </div>
          </div>
        </div>

        {/* Export Checklist */}
        <div className="px-4 py-4 flex-1">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Export Checklist</span>
          <div className="space-y-2">
            {[
              { label: 'All panels submitted', done: false },
              { label: 'All panels approved', done: false },
              { label: 'Lettering complete', done: false },
              { label: 'Format selected', done: true },
              { label: 'Color profile set', done: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.done ? (
                  <Check size={12} className="text-status-approved" />
                ) : (
                  <div className="w-3 h-3 rounded-sm border border-ink-border" />
                )}
                <span className={`text-[11px] font-sans ${item.done ? 'text-ink-text' : 'text-ink-muted'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
