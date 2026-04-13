import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  Download,
  Check,
  AlertCircle,
  Layers,
  Monitor,
  Smartphone,
  BookOpen,
  ScrollText,
  Image,
  FileDown,
  ChevronDown,
  X,
  FileText,
} from '../icons'
import AssemblyPreview from '../components/AssemblyPreview'
import LetteringOverlay, { type BubbleData, type BubbleFont } from '../components/LetteringOverlay'
import { useProject } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { generateBubblesFromContent } from '../domain/lettering'
import { useNotifications } from '../context/NotificationContext'
import { sendMessage } from '../services/projectService'
import type { ExportOptions } from '../services/exportService'
import { getFormatSpec } from '../lib/assemblyEngine'
import { getEpisodeById, getReviewablePanels } from '../domain/selectors'
import { useToast } from '../context/ToastContext'
import type { PanelStatus } from '../types'

/* ─── Types ─── */

type Format = 'webtoon' | 'manhwa' | 'manga' | 'comic'

interface PanelThumb {
  id: string
  page: number
  panel: number
  status: 'complete' | 'missing' | 'review'
  label: string
  pageId: string
}

/* ─── Static Data ─── */

const formats: { id: Format; label: string; desc: string; icon: React.ReactNode; specs: string }[] = [
  { id: 'webtoon', label: 'Webtoon', desc: 'Vertical scroll, single column', icon: <Smartphone size={18} />, specs: '800px wide · Infinite scroll · RGB' },
  { id: 'manhwa', label: 'Manhwa', desc: 'Korean format, vertical scroll', icon: <ScrollText size={18} />, specs: '720px wide · Vertical · RGB' },
  { id: 'manga', label: 'Manga', desc: 'Right-to-left, page-based', icon: <BookOpen size={18} />, specs: 'B5 (182×257mm) · RTL · Grayscale' },
  { id: 'comic', label: 'Comic', desc: 'Western format, page grid', icon: <Monitor size={18} />, specs: '6.625×10.25" · LTR · CMYK' },
]

const exportFormats = [
  { id: 'pdf', label: 'PDF (All Pages)', icon: <FileDown size={13} /> },
  { id: 'png', label: 'PNG (Single Image)', icon: <Image size={13} /> },
  { id: 'zip', label: 'ZIP (PNG Sequence)', icon: <Download size={13} /> },
]

/* ─── Component ─── */

function panelThumbStatus(status: PanelStatus | undefined): PanelThumb['status'] {
  if (status === 'approved') return 'complete'
  if (status === 'draft_received' || status === 'changes_requested') return 'review'
  return 'missing'
}

export default function CompileExport() {
  const { project, activeEpisodeId, updatePanel, updateThread } = useProject()
  const { user, profile } = useAuth()
  const { selectedFormat, setSelectedFormat, registerActionHandler } = useWorkspace()
  const { showToast } = useToast()
  const { addNotification } = useNotifications()
  const isLetterer = profile?.role === 'letterer'
  const isColorist = profile?.role === 'colorist'
  const [exportOpen, setExportOpen] = useState(false)
  const [changesNote, setChangesNote] = useState<Record<string, string>>({})
  const [showChangesFor, setShowChangesFor] = useState<string | null>(null)
  const [showLettering, setShowLettering] = useState(isLetterer)
  const [bubbles, setBubbles] = useState<BubbleData[]>([])
  const [bubbleFont, setBubbleFont] = useState<BubbleFont>('sans')
  const [dpi, setDpi] = useState(72)
  const [exporting, setExporting] = useState(false)
  const [previewScale, setPreviewScale] = useState(0.5)
  const previewRef = useRef<HTMLDivElement>(null)
  const exportDropdownRef = useRef<HTMLDivElement>(null)

  const episode = getEpisodeById(project, activeEpisodeId)

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

  const spec = useMemo(() => getFormatSpec(selectedFormat), [selectedFormat])

  const handleExport = useCallback(async (type: string) => {
    setExportOpen(false)
    if (!previewRef.current || !episode) return
    setExporting(true)
    const opts: ExportOptions = {
      format: selectedFormat,
      dpi,
      colorProfile: spec.colorProfile,
      title: project.title,
      episodeTitle: episode.title,
    }
    try {
      const { exportPDF, exportZIP, exportSinglePNG } = await import('../services/exportService')
      if (type === 'pdf') await exportPDF(previewRef.current, opts)
      else if (type === 'png') await exportSinglePNG(previewRef.current, opts)
      else if (type === 'zip') await exportZIP(previewRef.current, opts)
      showToast('Export complete!', 'success')
    } catch (e) {
      console.error('Export failed:', e)
      showToast('Export failed. Check console for details.', 'error')
    }
    setExporting(false)
  }, [selectedFormat, dpi, spec, project.title, episode, showToast])

  const initLettering = useCallback(() => {
    if (!episode) return
    const generated = generateBubblesFromContent(
      episode.pages.map(pg => ({
        id: pg.id,
        number: pg.number,
        panels: pg.panels.map(pan => ({ id: pan.id, number: pan.number, content: pan.content })),
      })),
      spec.widthPx,
      spec.heightPx ?? 1000,
    )
    setBubbles(generated)
    setShowLettering(true)
  }, [episode, spec])

  const panels: PanelThumb[] = useMemo(() => (
    episode
      ? episode.pages.flatMap(pg =>
          pg.panels.map(pan => ({
            id: pan.id,
            page: pg.number,
            panel: pan.number,
            status: panelThumbStatus(pan.status),
            label: pan.description ? pan.description.slice(0, 60) : `Panel ${pan.number}`,
            pageId: pg.id,
          }))
        )
      : []
  ), [episode])

  const completeCount = panels.filter((p) => p.status === 'complete').length
  const reviewCount = panels.filter((p) => p.status === 'review').length
  const totalCount = panels.length
  const percentage = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0

  // Check if all panels have been submitted (none are in 'draft' / 'missing')
  const allSubmitted = totalCount > 0 && panels.every(p => p.status !== 'missing')
  const allApproved = totalCount > 0 && completeCount === totalCount

  const syncThreadApprovedStatus = useCallback((approvedPanelIds: Set<string>) => {
    if (!episode) return
    const epThread = project.threads.find(t => t.episodeId === episode.id)
    if (!epThread) return

    const everyPanelApproved = episode.pages
      .flatMap(pg => pg.panels)
      .every(panel => approvedPanelIds.has(panel.id) || panel.status === 'approved')

    if (everyPanelApproved) {
      updateThread(epThread.id, { status: 'approved' })
    }
  }, [episode, project.threads, updateThread])

  const approve = useCallback((panelId: string, pageId: string) => {
    if (!episode) return
    updatePanel(episode.id, pageId, panelId, { status: 'approved' as PanelStatus })
    syncThreadApprovedStatus(new Set([panelId]))
    const pan = panels.find(p => p.id === panelId)
    addNotification({
      type: 'approval',
      title: 'Panel approved',
      body: pan ? `P${pan.page}/Panel ${pan.panel} in EP${episode.number} approved.` : `Panel in EP${episode.number} approved.`,
    })
  }, [addNotification, episode, panels, syncThreadApprovedStatus, updatePanel])

  const requestChanges = useCallback(async (panelId: string, pageId: string) => {
    if (!episode) return
    updatePanel(episode.id, pageId, panelId, { status: 'changes_requested' as PanelStatus })

    // Send the changes note as a message in the episode's thread
    const note = changesNote[panelId]?.trim()
    const epThread = project.threads.find(t => t.episodeId === episode.id)
    if (note && user && epThread) {
      const pan = panels.find(p => p.id === panelId)
      const label = pan ? `P${pan.page}/Panel ${pan.panel}` : 'a panel'
      await sendMessage(epThread.id, user.id, `Changes requested for ${label}: ${note}`)
    }
    // Thread goes back to in_progress when changes are requested
    if (epThread) {
      updateThread(epThread.id, { status: 'in_progress' })
    }
    const pan = panels.find(p => p.id === panelId)
    addNotification({
      type: 'changes_requested',
      title: 'Changes requested',
      body: pan ? `P${pan.page}/Panel ${pan.panel} in EP${episode.number} needs revisions.` : `Panel in EP${episode.number} needs revisions.`,
    })
    setChangesNote(prev => { const n = { ...prev }; delete n[panelId]; return n })
    setShowChangesFor(null)
  }, [addNotification, changesNote, episode, panels, project.threads, updatePanel, updateThread, user])

  // Bulk approve all reviewable panels on a given page
  const bulkApprovePage = useCallback((pageId: string) => {
    if (!episode) return
    const page = episode.pages.find(pg => pg.id === pageId)
    if (!page) return
    const approvedPanelIds = new Set<string>()
    for (const pan of page.panels) {
      if (pan.status === 'draft_received' || pan.status === 'changes_requested') {
        updatePanel(episode.id, pageId, pan.id, { status: 'approved' as PanelStatus })
        approvedPanelIds.add(pan.id)
      }
    }
    if (approvedPanelIds.size > 0) {
      syncThreadApprovedStatus(approvedPanelIds)
    }
  }, [episode, syncThreadApprovedStatus, updatePanel])

  useEffect(() => registerActionHandler('approveNextReviewable', episode ? () => {
    const next = getReviewablePanels(episode)[0]
    if (next) approve(next.panelId, next.pageId)
  } : null), [approve, episode, registerActionHandler])

  useEffect(() => registerActionHandler('requestChangesForNextReviewable', episode ? () => {
    const next = getReviewablePanels(episode)[0]
    if (next) setShowChangesFor(next.panelId)
  } : null), [episode, registerActionHandler])

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-border bg-ink-dark/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl text-ink-light">Compile & Export</h2>
                {isLetterer && (
                  <span className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-purple-400 font-sans">Letterer</span>
                )}
                {isColorist && (
                  <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400 font-sans">Colorist</span>
                )}
              </div>
              <p className="text-xs text-ink-text font-sans mt-1">
                {episode ? `EP${episode.number} — ${episode.title} · ` : ''}{totalCount} panel{totalCount !== 1 ? 's' : ''} across {episode?.pages.length ?? 0} page{episode?.pages.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Export dropdown */}
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
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Layout Preview</span>
              <div className="flex items-center gap-3">
                {/* Zoom */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-ink-muted font-sans">Zoom</span>
                  <input
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.05}
                    value={previewScale}
                    onChange={e => setPreviewScale(Number(e.target.value))}
                    className="w-20 accent-ink-gold h-1"
                  />
                  <span className="text-[10px] text-ink-muted font-mono w-8">{Math.round(previewScale * 100)}%</span>
                </div>
                {/* DPI */}
                <select
                  value={dpi}
                  onChange={e => setDpi(Number(e.target.value))}
                  className="bg-ink-panel border border-ink-border rounded px-2 py-1 text-[10px] font-mono text-ink-text outline-none"
                >
                  <option value={72}>72 DPI (Web)</option>
                  <option value={150}>150 DPI</option>
                  <option value={300}>300 DPI (Print)</option>
                </select>
                {/* Lettering toggle */}
                <button
                  onClick={() => showLettering ? setShowLettering(false) : initLettering()}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-sans border transition-colors ${
                    showLettering
                      ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                      : 'text-ink-muted border-ink-border hover:text-ink-text'
                  }`}
                >
                  <FileText size={10} />
                  Lettering {showLettering ? 'ON' : 'OFF'}
                </button>
                {showLettering && (
                  <select
                    value={bubbleFont}
                    onChange={e => setBubbleFont(e.target.value as BubbleFont)}
                    className="bg-ink-panel border border-ink-border rounded px-2 py-1 text-[10px] font-mono text-ink-text outline-none"
                  >
                    <option value="sans">Sans-Serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                    <option value="comic">Comic</option>
                  </select>
                )}
              </div>
            </div>
            <div className="overflow-auto max-h-[500px] bg-ink-panel rounded-lg border border-ink-border p-4 flex justify-center">
              <div className="relative" ref={previewRef}>
                {episode ? (
                  <>
                    <AssemblyPreview
                      pages={episode.pages}
                      format={selectedFormat}
                      scale={previewScale}
                      showLettering={false}
                    />
                    {showLettering && (
                      <LetteringOverlay
                        bubbles={bubbles}
                        onChange={setBubbles}
                        scale={previewScale}
                        font={bubbleFont}
                        containerRef={previewRef}
                      />
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center text-ink-muted text-sm font-sans">No episode selected</div>
                )}
              </div>
            </div>
            {exporting && (
              <div className="mt-2 text-center">
                <span className="text-xs text-ink-gold font-sans animate-pulse">Exporting…</span>
              </div>
            )}
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

            {/* Bulk approve per page */}
            {episode && episode.pages.some(pg => pg.panels.some(pan => pan.status === 'draft_received' || pan.status === 'changes_requested')) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {episode.pages.map(pg => {
                  const reviewable = pg.panels.filter(pan => pan.status === 'draft_received' || pan.status === 'changes_requested')
                  if (reviewable.length === 0) return null
                  return (
                    <button
                      key={pg.id}
                      onClick={() => bulkApprovePage(pg.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-sans bg-status-approved/10 text-status-approved border border-status-approved/20 hover:bg-status-approved/20 transition-colors"
                    >
                      <Check size={10} />
                      Approve Page {pg.number} ({reviewable.length} panel{reviewable.length !== 1 ? 's' : ''})
                    </button>
                  )
                })}
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              {panels.map((p) => {
                const ep = episode!
                const pageId = p.pageId
                const pan = ep.pages.find(pg => pg.id === pageId)?.panels.find(pan => pan.id === p.id)
                return (
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
                  {/* Thumbnail / asset area */}
                  <div className={`h-32 flex items-center justify-center relative ${
                    p.status === 'missing' ? 'bg-ink-panel' : 'bg-ink-muted/10'
                  }`}>
                    {pan?.assetUrl ? (
                      <img src={pan.assetUrl} alt={`Panel ${p.panel}`} className="w-full h-full object-cover" />
                    ) : p.status === 'complete' ? (
                      <>
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `linear-gradient(135deg, rgba(212,168,67,0.3) 0%, transparent 50%)` }} />
                        <Image size={20} className="text-ink-muted/50" />
                      </>
                    ) : p.status === 'review' ? (
                      <Image size={20} className="text-ink-muted/50" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Layers size={18} className="text-ink-muted/30" />
                        <span className="text-[9px] text-ink-muted font-sans">Awaiting art</span>
                      </div>
                    )}
                    {/* Status badge overlay */}
                    {p.status !== 'missing' && (
                      <div className="absolute top-2 right-2">
                        {p.status === 'complete'
                          ? <Check size={14} className="text-status-approved" />
                          : <AlertCircle size={14} className="text-status-draft" />}
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-2 bg-ink-dark border-t border-ink-border/50">
                    <div className="text-[10px] font-mono text-ink-text">P{p.page} · Panel {p.panel}</div>
                    <div className="text-[11px] text-ink-muted font-sans truncate mt-0.5">{p.label}</div>

                    {/* Review controls — only shown when draft received */}
                    {p.status === 'review' && (
                      <div className="mt-2 space-y-1">
                        {showChangesFor === p.id ? (
                          <div className="space-y-1">
                            <textarea
                              placeholder="Note for artist…"
                              value={changesNote[p.id] ?? ''}
                              onChange={e => setChangesNote(prev => ({ ...prev, [p.id]: e.target.value }))}
                              rows={2}
                              className="w-full bg-ink-panel border border-ink-border rounded px-2 py-1 text-[10px] font-sans text-ink-light placeholder:text-ink-muted outline-none resize-none"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => requestChanges(p.id, pageId)}
                                className="flex-1 py-1 rounded text-[10px] font-sans bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              >
                                Send
                              </button>
                              <button
                                onClick={() => setShowChangesFor(null)}
                                className="px-2 py-1 rounded text-[10px] text-ink-muted hover:text-ink-text transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => approve(p.id, pageId)}
                              className="flex-1 py-1 rounded text-[10px] font-sans bg-status-approved/20 text-status-approved hover:bg-status-approved/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <Check size={9} /> Approve
                            </button>
                            <button
                              onClick={() => setShowChangesFor(p.id)}
                              className="flex-1 py-1 rounded text-[10px] font-sans bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              Changes
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                )
              })}
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
              { label: 'All panels submitted', done: allSubmitted },
              { label: 'All panels approved', done: allApproved },
              { label: 'No panels in review', done: reviewCount === 0 },
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
