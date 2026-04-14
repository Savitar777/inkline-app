import type { Episode } from '../types'
import type { ExportOutputFormat, PreflightIssue, PreflightResult } from '../types/files'

/* ─── Size Estimation Constants (MB per panel, keyed by DPI) ─── */

const SIZE_PER_PANEL: Record<number, Record<string, number>> = {
  72:  { pdf: 0.15, png: 0.25, webp: 0.08, zip: 0.25, jpg: 0.1,  json: 0.01, thumbnail: 0.02 },
  150: { pdf: 0.5,  png: 0.8,  webp: 0.25, zip: 0.8,  jpg: 0.35, json: 0.01, thumbnail: 0.02 },
  300: { pdf: 1.5,  png: 2.5,  webp: 0.7,  zip: 2.5,  jpg: 1.0,  json: 0.01, thumbnail: 0.02 },
}

function estimateFileSizeMB(panelCount: number, dpi: number, outputFormat: ExportOutputFormat): number {
  const dpiKey = dpi <= 72 ? 72 : dpi <= 150 ? 150 : 300
  const perPanel = SIZE_PER_PANEL[dpiKey]?.[outputFormat] ?? 0.3
  return Math.round(panelCount * perPanel * 100) / 100
}

/* ─── Preflight Engine ─── */

export function runPreflight(
  episode: Episode,
  options: {
    format: string
    dpi: number
    outputFormat: ExportOutputFormat
    colorProfile: 'rgb' | 'cmyk'
    scope?: string
    pageIds?: string[]
    panelIds?: string[]
  },
): PreflightResult {
  const issues: PreflightIssue[] = []

  // Resolve panels in scope
  let pages = episode.pages
  if (options.pageIds?.length) {
    pages = pages.filter(pg => options.pageIds!.includes(pg.id))
  }

  let panels = pages.flatMap(pg => pg.panels)
  if (options.panelIds?.length) {
    panels = panels.filter(pan => options.panelIds!.includes(pan.id))
  }

  // 1. No panels in scope
  if (panels.length === 0) {
    issues.push({
      code: 'no_panels_in_scope',
      severity: 'error',
      message: 'No panels found in the selected scope.',
    })
  }

  // 2. Panels not approved
  const unapproved = panels.filter(p => p.status !== 'approved')
  if (unapproved.length > 0) {
    issues.push({
      code: 'panels_not_approved',
      severity: 'error',
      message: `${unapproved.length} panel${unapproved.length === 1 ? '' : 's'} not yet approved.`,
      affectedIds: unapproved.map(p => p.id),
    })
  }

  // 3. Open change requests
  const withOpenCRs = panels.filter(p =>
    p.changeRequests?.some(cr => cr.status === 'open'),
  )
  if (withOpenCRs.length > 0) {
    issues.push({
      code: 'open_change_requests',
      severity: 'error',
      message: `${withOpenCRs.length} panel${withOpenCRs.length === 1 ? ' has' : 's have'} open change requests.`,
      affectedIds: withOpenCRs.map(p => p.id),
    })
  }

  // 4. CMYK + WebP conflict
  if (options.colorProfile === 'cmyk' && options.outputFormat === 'webp') {
    issues.push({
      code: 'cmyk_webp_conflict',
      severity: 'error',
      message: 'CMYK color profile is not supported with WebP format.',
    })
  }

  // 5. DPI / format mismatch warnings
  const isWebFormat = options.format === 'webtoon' || options.format === 'manhwa'
  if (isWebFormat && options.dpi > 150) {
    issues.push({
      code: 'dpi_format_mismatch',
      severity: 'warning',
      message: `DPI ${options.dpi} is unusually high for web format. Consider 72 DPI.`,
    })
  }
  const isPrintFormat = options.format === 'manga' || options.format === 'comic'
  if (isPrintFormat && options.dpi < 150) {
    issues.push({
      code: 'dpi_format_mismatch',
      severity: 'warning',
      message: `DPI ${options.dpi} may be too low for print. Consider 300 DPI.`,
    })
  }

  // 6. Low resolution for print PDF
  if (isPrintFormat && options.outputFormat === 'pdf' && options.dpi < 300) {
    issues.push({
      code: 'low_resolution_print',
      severity: 'warning',
      message: 'Print PDF at less than 300 DPI may appear pixelated.',
    })
  }

  const pass = !issues.some(i => i.severity === 'error')
  const estimatedFileSizeMB = estimateFileSizeMB(panels.length, options.dpi, options.outputFormat)

  return { pass, issues, estimatedFileSizeMB }
}
