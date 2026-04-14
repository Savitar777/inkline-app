import { memo, useState, useMemo } from 'react'
import { X, Download, FileDown, Image, History, Check, AlertCircle } from '../../icons'
import { EXPORT_PRESETS, getExportHistory } from '../../services/exportService'
import { runPreflight } from '../../services/preflightService'
import { THUMBNAIL_PRESETS } from '../../services/thumbnailService'
import type { ExportScope, ExportOutputFormat, ExportPresetId, ExportJob, ThumbnailSize } from '../../types/files'
import type { Page, Episode } from '../../types'

type DialogMode = 'export' | 'thumbnails'

interface ExportScopeDialogProps {
  pages: Page[]
  episode: Episode
  format: string
  colorProfile: 'rgb' | 'cmyk'
  exporting: boolean
  onExport: (opts: {
    outputFormat: ExportOutputFormat
    scope: ExportScope
    pageIds?: string[]
    panelIds?: string[]
    preset?: ExportPresetId
    dpi: number
    webpQuality?: number
    webtoonSlice?: boolean
    thumbnailSizes?: ThumbnailSize[]
  }) => void
  onClose: () => void
}

const FORMAT_OPTIONS: { id: ExportOutputFormat; label: string; icon: React.ReactNode }[] = [
  { id: 'pdf', label: 'PDF', icon: <FileDown size={13} /> },
  { id: 'png', label: 'PNG', icon: <Image size={13} /> },
  { id: 'webp', label: 'WEBP', icon: <Image size={13} /> },
  { id: 'zip', label: 'ZIP', icon: <Download size={13} /> },
]

const PRESET_INFO: Record<ExportPresetId, { label: string; desc: string }> = {
  'webtoon-web': { label: 'Webtoon (Web)', desc: '72 DPI, RGB, ZIP sequence' },
  'manga-print': { label: 'Manga (Print)', desc: '300 DPI, RGB, PDF' },
  'comic-print': { label: 'Comic (Print)', desc: '300 DPI, CMYK, PDF' },
  'manhwa-web': { label: 'Manhwa (Web)', desc: '72 DPI, RGB, ZIP sequence' },
  'webtoon-slice': { label: 'Webtoon Slice', desc: '72 DPI, RGB, ≤800px chunks' },
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function ExportScopeDialog({ pages, episode, format, colorProfile, exporting, onExport, onClose }: ExportScopeDialogProps) {
  const [mode, setMode] = useState<DialogMode>('export')
  const [outputFormat, setOutputFormat] = useState<ExportOutputFormat>('pdf')
  const [scope, setScope] = useState<ExportScope>('episode')
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([])
  const [selectedPreset, setSelectedPreset] = useState<ExportPresetId | null>(null)
  const [dpi, setDpi] = useState(72)
  const [webpQuality, setWebpQuality] = useState(0.85)
  const [showHistory, setShowHistory] = useState(false)
  const [webtoonSlice, setWebtoonSlice] = useState(false)
  const [selectedThumbSizes, setSelectedThumbSizes] = useState<ThumbnailSize[]>(['300x300', '600x600'])

  const history: ExportJob[] = getExportHistory().slice(0, 5)

  const isScrollFormat = format === 'webtoon' || format === 'manhwa'

  const preflight = useMemo(
    () => runPreflight(episode, {
      format,
      dpi,
      outputFormat,
      colorProfile,
      scope,
      pageIds: scope === 'page' ? selectedPageIds : undefined,
    }),
    [episode, format, dpi, outputFormat, colorProfile, scope, selectedPageIds],
  )

  const applyPreset = (preset: ExportPresetId) => {
    setSelectedPreset(preset)
    const p = EXPORT_PRESETS[preset]
    if (p.dpi) setDpi(p.dpi)
    if (p.outputFormat) setOutputFormat(p.outputFormat)
    if (preset === 'webtoon-slice') setWebtoonSlice(true)
  }

  const togglePage = (pageId: string) => {
    setSelectedPageIds(prev =>
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    )
  }

  const toggleThumbSize = (size: ThumbnailSize) => {
    setSelectedThumbSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const handleExport = () => {
    if (mode === 'thumbnails') {
      onExport({
        outputFormat: 'thumbnail',
        scope: 'episode',
        dpi,
        thumbnailSizes: selectedThumbSizes,
      })
      return
    }
    onExport({
      outputFormat,
      scope,
      pageIds: scope === 'page' ? selectedPageIds : undefined,
      preset: selectedPreset ?? undefined,
      dpi,
      webpQuality: outputFormat === 'webp' ? webpQuality : undefined,
      webtoonSlice,
    })
  }

  const canExport = mode === 'thumbnails'
    ? selectedThumbSizes.length > 0
    : preflight.pass && !(scope === 'page' && selectedPageIds.length === 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ink-stage-enter">
      <div className="w-[520px] max-h-[85vh] bg-ink-dark border border-ink-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-border">
          <div className="flex items-center gap-3">
            <span className="text-sm font-sans font-medium text-ink-light">Export Options</span>
            <div className="flex gap-1">
              {(['export', 'thumbnails'] as DialogMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-2.5 py-1 rounded text-[10px] font-sans border transition-colors ${
                    mode === m
                      ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                      : 'text-ink-muted border-ink-border hover:text-ink-text'
                  }`}
                >
                  {m === 'export' ? 'Export' : 'Thumbnails'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-ink-muted hover:text-ink-text transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {mode === 'export' ? (
            <>
              {/* Preflight Banner */}
              <div>
                {preflight.pass && preflight.issues.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                    <Check size={13} className="text-emerald-400 shrink-0" />
                    <span className="text-xs font-sans text-emerald-300">Ready to export</span>
                    <span className="ml-auto text-[10px] font-mono text-ink-muted">~{preflight.estimatedFileSizeMB} MB</span>
                  </div>
                ) : preflight.pass ? (
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={13} className="text-yellow-400 shrink-0" />
                      <span className="text-xs font-sans text-yellow-300">Warnings</span>
                      <span className="ml-auto text-[10px] font-mono text-ink-muted">~{preflight.estimatedFileSizeMB} MB</span>
                    </div>
                    {preflight.issues.map((issue, i) => (
                      <p key={i} className="text-[10px] text-yellow-200/70 font-sans pl-5">{issue.message}</p>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={13} className="text-red-400 shrink-0" />
                      <span className="text-xs font-sans text-red-300">Cannot export</span>
                      <span className="ml-auto text-[10px] font-mono text-ink-muted">~{preflight.estimatedFileSizeMB} MB</span>
                    </div>
                    {preflight.issues.map((issue, i) => (
                      <p key={i} className={`text-[10px] font-sans pl-5 ${
                        issue.severity === 'error' ? 'text-red-200/70' : 'text-yellow-200/70'
                      }`}>
                        {issue.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Output Format */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Output Format</label>
                <div className="flex gap-2">
                  {FORMAT_OPTIONS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setOutputFormat(f.id); setSelectedPreset(null); setWebtoonSlice(false) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans border transition-colors ${
                        outputFormat === f.id
                          ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                          : 'text-ink-muted border-ink-border hover:text-ink-text'
                      }`}
                    >
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Webtoon Slice Toggle */}
              {isScrollFormat && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webtoonSlice}
                      onChange={e => {
                        setWebtoonSlice(e.target.checked)
                        if (e.target.checked) setOutputFormat('zip')
                      }}
                      className="rounded border-ink-border accent-ink-gold"
                    />
                    <span className="text-xs font-sans text-ink-text">Slice for upload (&le;800px chunks)</span>
                    <span className="text-[10px] text-ink-muted font-sans">LINE Webtoon compatible</span>
                  </label>
                </div>
              )}

              {/* Scope */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Scope</label>
                <div className="flex gap-2">
                  {(['episode', 'page'] as ExportScope[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setScope(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-sans border transition-colors ${
                        scope === s
                          ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                          : 'text-ink-muted border-ink-border hover:text-ink-text'
                      }`}
                    >
                      {s === 'episode' ? 'Full Episode' : 'Select Pages'}
                    </button>
                  ))}
                </div>
                {scope === 'page' && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pages.map(pg => (
                      <button
                        key={pg.id}
                        onClick={() => togglePage(pg.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
                          selectedPageIds.includes(pg.id)
                            ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                            : 'text-ink-muted border-ink-border hover:text-ink-text'
                        }`}
                      >
                        Page {pg.number}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Presets */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PRESET_INFO) as ExportPresetId[]).map(id => (
                    <button
                      key={id}
                      onClick={() => applyPreset(id)}
                      className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                        selectedPreset === id
                          ? 'bg-ink-gold/10 border-ink-gold/30'
                          : 'border-ink-border hover:border-ink-gold/20'
                      }`}
                    >
                      <p className="text-xs font-sans text-ink-text">{PRESET_INFO[id].label}</p>
                      <p className="text-[10px] text-ink-muted font-sans mt-0.5">{PRESET_INFO[id].desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-1">DPI</label>
                  <select
                    value={dpi}
                    onChange={e => setDpi(Number(e.target.value))}
                    className="bg-ink-panel border border-ink-border rounded px-2 py-1 text-[11px] font-mono text-ink-text outline-none"
                  >
                    <option value={72}>72 (Web)</option>
                    <option value={150}>150</option>
                    <option value={300}>300 (Print)</option>
                  </select>
                </div>
                {outputFormat === 'webp' && (
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-1">
                      Quality: {Math.round(webpQuality * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={webpQuality}
                      onChange={e => setWebpQuality(Number(e.target.value))}
                      className="w-full accent-ink-gold h-1"
                    />
                  </div>
                )}
              </div>

              {/* History */}
              {history.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHistory(v => !v)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-sans mb-2 hover:text-ink-text transition-colors"
                  >
                    <History size={10} /> Recent Exports ({history.length})
                  </button>
                  {showHistory && (
                    <div className="space-y-1">
                      {history.map(job => (
                        <div key={job.id} className="flex items-center justify-between px-2.5 py-1.5 rounded border border-ink-border text-[10px] font-sans">
                          <span className="text-ink-text uppercase">{job.outputFormat} · {job.dpi} DPI</span>
                          <span className="text-ink-muted">{formatTime(job.startedAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Thumbnail Mode */
            <div className="space-y-4">
              <p className="text-xs text-ink-text font-sans">Generate thumbnail images for cover art or previews.</p>
              <div className="space-y-2">
                {(Object.entries(THUMBNAIL_PRESETS) as [ThumbnailSize, { label: string; widthPx: number; heightPx: number }][]).map(([size, preset]) => (
                  <label key={size} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-ink-border hover:border-ink-gold/20 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedThumbSizes.includes(size)}
                      onChange={() => toggleThumbSize(size)}
                      className="rounded border-ink-border accent-ink-gold"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-sans text-ink-text">{preset.label}</p>
                      <p className="text-[10px] text-ink-muted font-mono">{preset.widthPx} x {preset.heightPx} px</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-ink-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-sans text-ink-muted hover:text-ink-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || !canExport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-sans bg-ink-gold text-ink-black font-semibold hover:bg-ink-gold-dim transition-colors disabled:opacity-50"
          >
            <Download size={12} />
            {exporting ? 'Exporting...' : mode === 'thumbnails' ? 'Generate Thumbnails' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ExportScopeDialog)
