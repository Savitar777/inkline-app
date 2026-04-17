import { memo, useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  Check,
  Download,
  FileText,
  FolderOpen,
} from '../icons'
import AssemblyPreview from '../components/AssemblyPreview'
import LetteringOverlay, { type BubbleData, type BubbleFont } from '../components/LetteringOverlay'
import FormatPicker, { formats } from '../components/compile/FormatPicker'
import PanelGrid, { type PanelThumb } from '../components/compile/PanelGrid'
import ExportScopeDialog from '../components/compile/ExportScopeDialog'
import AssetLibraryDrawer from '../components/compile/AssetLibraryDrawer'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { generateBubblesFromContent } from '../domain/lettering'
import { useNotifications } from '../context/NotificationContext'
import { sendMessage } from '../services/projectService'
import type { ExportOptions as ExportOpts } from '../services/exportService'
import type { ExportOutputFormat, ExportScope, ExportPresetId, ThumbnailSize } from '../types/files'
import { runPreflight } from '../services/preflightService'
import { getFormatSpec } from '../lib/assemblyEngine'
import { getEpisodeById, getReviewablePanels } from '../domain/selectors'
import { useToast } from '../context/ToastContext'
import type { PanelStatus } from '../types'
import ContextualTipBanner from '../components/ContextualTipBanner'
import { useProjectActions, useProjectState } from '../context/ProjectContext'
import { scheduleIdleTask } from '../lib/viewPreload'
import AsyncActionLabel from '../components/AsyncActionLabel'

/* ─── Helpers ─── */

function panelThumbStatus(status: PanelStatus | undefined): PanelThumb['status'] {
  if (status === 'approved') return 'complete'
  if (status === 'draft_received' || status === 'changes_requested') return 'review'
  return 'missing'
}

/* ─── Component ─── */

function CompileExport() {
  const { activeEpisodeId, project } = useProjectState()
  const { updatePanel, updateThread } = useProjectActions()
  const { user, profile } = useAuth()
  const { selectedFormat, setSelectedFormat, registerActionHandler } = useWorkspace()
  const { showToast } = useToast()
  const { addNotification } = useNotifications()
  const isLetterer = profile?.role === 'letterer'
  const isColorist = profile?.role === 'colorist'
  const [changesNote, setChangesNote] = useState<Record<string, string>>({})
  const [showChangesFor, setShowChangesFor] = useState<string | null>(null)
  const [showLettering, setShowLettering] = useState(isLetterer)
  const [bubbles, setBubbles] = useState<BubbleData[]>([])
  const [bubbleFont, setBubbleFont] = useState<BubbleFont>('sans')
  const [dpi, setDpi] = useState(72)
  const [exporting, setExporting] = useState(false)
  const [previewScale, setPreviewScale] = useState(0.5)
  const [showAssets, setShowAssets] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [preflightResult, setPreflightResult] = useState<ReturnType<typeof runPreflight> | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const episode = getEpisodeById(project, activeEpisodeId)
  const spec = useMemo(() => getFormatSpec(selectedFormat), [selectedFormat])
  const selectedFormatInfo = useMemo(
    () => formats.find(format => format.id === selectedFormat),
    [selectedFormat],
  )

  const handleExport = useCallback(async (dialogOpts: {
    outputFormat: ExportOutputFormat
    scope: ExportScope
    pageIds?: string[]
    panelIds?: string[]
    preset?: ExportPresetId
    dpi: number
    webpQuality?: number
    webtoonSlice?: boolean
    thumbnailSizes?: ThumbnailSize[]
  }) => {
    if (!previewRef.current || !episode) return
    setExporting(true)
    const opts: ExportOpts = {
      format: selectedFormat,
      dpi: dialogOpts.dpi,
      colorProfile: spec.colorProfile,
      title: project.title,
      episodeTitle: episode.title,
    }
    try {
      if (dialogOpts.outputFormat === 'thumbnail' && dialogOpts.thumbnailSizes?.length) {
        const { exportThumbnailSet } = await import('../services/thumbnailService')
        await exportThumbnailSet(previewRef.current, {
          title: project.title,
          episodeTitle: episode.title,
          sizes: dialogOpts.thumbnailSizes,
        })
      } else if (dialogOpts.webtoonSlice) {
        const { exportWebtoonZIP } = await import('../services/exportService')
        await exportWebtoonZIP(previewRef.current, opts)
      } else {
        const { exportPDF, exportZIP, exportSinglePNG, exportWebP } = await import('../services/exportService')
        const fmt = dialogOpts.outputFormat
        if (fmt === 'pdf') await exportPDF(previewRef.current, opts)
        else if (fmt === 'png') await exportSinglePNG(previewRef.current, opts)
        else if (fmt === 'zip') await exportZIP(previewRef.current, opts)
        else if (fmt === 'webp') await exportWebP(previewRef.current, opts)
      }
      showToast('Export complete!', 'success')
    } catch (e) {
      if (import.meta.env.DEV) console.error('Export failed:', e)
      showToast('Export failed. Please try again.', 'error')
    }
    setExporting(false)
    setShowExportDialog(false)
  }, [selectedFormat, spec, project.title, episode, showToast])

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
  const allSubmitted = totalCount > 0 && panels.every(p => p.status !== 'missing')
  const allApproved = totalCount > 0 && completeCount === totalCount

  useEffect(() => {
    if (!episode) {
      setPreflightResult(null)
      return
    }

    return scheduleIdleTask(() => {
      setPreflightResult(runPreflight(episode, {
        format: selectedFormat,
        dpi,
        outputFormat: 'pdf',
        colorProfile: spec.colorProfile,
        scope: 'episode',
      }))
    })
  }, [dpi, episode, selectedFormat, spec.colorProfile])

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
    const note = changesNote[panelId]?.trim()
    const pan = panels.find(p => p.id === panelId)

    // Build a structured ChangeRequest and append it to the panel
    const existingPanel = episode.pages.find(pg => pg.id === pageId)?.panels.find(p => p.id === panelId)
    const prevCRs = existingPanel?.changeRequests ?? []
    const newCR = {
      id: crypto.randomUUID(),
      note: note || 'Changes requested',
      status: 'open' as const,
      createdBy: profile?.name ?? user?.id ?? 'unknown',
      createdAt: new Date().toISOString(),
    }
    updatePanel(episode.id, pageId, panelId, {
      status: 'changes_requested' as PanelStatus,
      changeRequests: [...prevCRs, newCR],
    })

    // Also send thread message for visibility
    const epThread = project.threads.find(t => t.episodeId === episode.id)
    if (note && user && epThread) {
      const label = pan ? `P${pan.page}/Panel ${pan.panel}` : 'a panel'
      await sendMessage(epThread.id, user.id, `Changes requested for ${label}: ${note}`)
    }
    if (epThread) {
      updateThread(epThread.id, { status: 'in_progress' })
    }
    addNotification({
      type: 'changes_requested',
      title: 'Changes requested',
      body: pan ? `P${pan.page}/Panel ${pan.panel} in EP${episode.number} needs revisions.` : `Panel in EP${episode.number} needs revisions.`,
    })
    setChangesNote(prev => { const n = { ...prev }; delete n[panelId]; return n })
    setShowChangesFor(null)
  }, [addNotification, changesNote, episode, panels, profile, project.threads, updatePanel, updateThread, user])

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

  const handleChangesNoteChange = useCallback((panelId: string, value: string) => {
    setChangesNote(prev => ({ ...prev, [panelId]: value }))
  }, [])

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
              <button
                onClick={() => setShowAssets(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-sans border transition-colors ${
                  showAssets
                    ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                    : 'text-ink-muted border-ink-border hover:text-ink-text'
                }`}
              >
                <FolderOpen size={14} />
                Assets
              </button>
              <button
                onClick={() => setShowExportDialog(true)}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-sans bg-ink-gold text-ink-black font-medium hover:bg-ink-gold-dim transition-colors disabled:opacity-50"
              >
                <Download size={14} />
                <AsyncActionLabel loading={exporting} idleLabel="Export" loadingLabel="Exporting…" />
              </button>
            </div>
          </div>
        </div>

        <ContextualTipBanner view="compile" />
        <div className="flex-1 overflow-y-auto">
          {/* Format Selector */}
          <FormatPicker selectedFormat={selectedFormat} onSelectFormat={setSelectedFormat} />

          {/* Layout Preview */}
          <div className="px-6 py-5 border-b border-ink-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Layout Preview</span>
              <div className="flex items-center gap-3">
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
                <select
                  value={dpi}
                  onChange={e => setDpi(Number(e.target.value))}
                  className="bg-ink-panel border border-ink-border rounded px-2 py-1 text-[10px] font-mono text-ink-text outline-none"
                >
                  <option value={72}>72 DPI (Web)</option>
                  <option value={150}>150 DPI</option>
                  <option value={300}>300 DPI (Print)</option>
                </select>
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
                <span className="text-xs text-ink-gold font-sans">Capturing pages for export…</span>
              </div>
            )}
          </div>

          {/* Panel Grid */}
          <PanelGrid
            panels={panels}
            episode={episode}
            changesNote={changesNote}
            showChangesFor={showChangesFor}
            onApprove={approve}
            onRequestChanges={requestChanges}
            onBulkApprovePage={bulkApprovePage}
            onChangesNoteChange={handleChangesNoteChange}
            onShowChangesFor={setShowChangesFor}
          />
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
              {selectedFormatInfo?.label}
            </div>
            <div className="text-[11px] text-ink-text font-sans mt-1">
              {selectedFormatInfo?.desc}
            </div>
            <div className="text-[10px] text-ink-muted font-mono mt-2">
              {selectedFormatInfo?.specs}
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
              { label: 'Preflight passed', done: preflightResult?.pass ?? false },
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

      {/* Asset Library Drawer */}
      <AssetLibraryDrawer
        projectId={project.id}
        open={showAssets}
        onClose={() => setShowAssets(false)}
      />

      {/* Export Dialog */}
      {showExportDialog && episode && (
        <ExportScopeDialog
          pages={episode.pages}
          episode={episode}
          format={selectedFormat}
          colorProfile={spec.colorProfile}
          exporting={exporting}
          onExport={handleExport}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  )
}

export default memo(CompileExport)
