import { FORMAT_SPECS } from '../lib/assemblyEngine'
import type { ExportScope, ExportOutputFormat, ExportPresetId, ExportJob } from '../types/files'

/* ─── Types ─── */

export interface ExportOptions {
  format: string
  dpi: number
  colorProfile: 'rgb' | 'cmyk'
  title: string
  episodeTitle: string
  scope?: ExportScope
  pageIds?: string[]
  panelIds?: string[]
  outputFormat?: ExportOutputFormat
  webpQuality?: number
  preset?: ExportPresetId
}

/* ─── Presets ─── */

export const EXPORT_PRESETS: Record<ExportPresetId, Partial<ExportOptions>> = {
  'webtoon-web':    { dpi: 72,  colorProfile: 'rgb',  outputFormat: 'zip' },
  'manga-print':    { dpi: 300, colorProfile: 'rgb',  outputFormat: 'pdf' },
  'comic-print':    { dpi: 300, colorProfile: 'cmyk', outputFormat: 'pdf' },
  'manhwa-web':     { dpi: 72,  colorProfile: 'rgb',  outputFormat: 'zip' },
  'webtoon-slice':  { dpi: 72,  colorProfile: 'rgb',  outputFormat: 'zip' },
}

/* ─── Export History ─── */

const MAX_HISTORY = 20
const exportHistory: ExportJob[] = []

function recordExport(job: Omit<ExportJob, 'id' | 'startedAt'>): ExportJob {
  const entry: ExportJob = {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    ...job,
  }
  exportHistory.unshift(entry)
  if (exportHistory.length > MAX_HISTORY) exportHistory.pop()
  return entry
}

export function getExportHistory(): ExportJob[] {
  return [...exportHistory]
}

/* ─── Helpers ─── */

async function captureElement(el: HTMLElement, dpi: number): Promise<HTMLCanvasElement> {
  const scale = dpi / 72
  const { default: html2canvas } = await import('html2canvas-pro')
  return html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  })
}

function applyGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/** Filter DOM elements by scope (page/panel IDs) */
function getScopedElements(containerEl: HTMLElement, options: ExportOptions): HTMLElement[] {
  if (options.panelIds?.length) {
    return options.panelIds
      .map(id => containerEl.querySelector(`[data-panel="${id}"]`) as HTMLElement)
      .filter(Boolean)
  }
  if (options.pageIds?.length) {
    return options.pageIds
      .map(id => containerEl.querySelector(`[data-page="${id}"]`) as HTMLElement)
      .filter(Boolean)
  }
  const pages = Array.from(containerEl.querySelectorAll('[data-page]')) as HTMLElement[]
  return pages.length > 0 ? pages : [containerEl]
}

/* ─── WEBP Export ─── */

export async function exportWebP(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<Blob> {
  const canvas = await captureElement(containerEl, options.dpi)
  const fc = options.format === 'manga' ? applyGrayscale(canvas) : canvas
  return new Promise<Blob>((resolve) => {
    fc.toBlob(b => resolve(b!), 'image/webp', options.webpQuality ?? 0.85)
  })
}

export async function exportWebPSequence(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<Blob[]> {
  const targets = getScopedElements(containerEl, options)
  const blobs: Blob[] = []
  for (const el of targets) {
    const canvas = await captureElement(el, options.dpi)
    const fc = options.format === 'manga' ? applyGrayscale(canvas) : canvas
    const blob = await new Promise<Blob>((resolve) => {
      fc.toBlob(b => resolve(b!), 'image/webp', options.webpQuality ?? 0.85)
    })
    blobs.push(blob)
  }
  return blobs
}

export async function exportSingleWebP(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const { saveAs } = await import('file-saver')
  const blob = await exportWebP(containerEl, options)
  saveAs(blob, `${options.title} - ${options.episodeTitle}.webp`)
  recordExport({
    projectId: '',
    scope: options.scope ?? 'episode',
    outputFormat: 'webp',
    dpi: options.dpi,
    status: 'complete',
    completedAt: new Date().toISOString(),
  })
}

/* ─── PDF Export ─── */

export async function exportPDF(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const spec = FORMAT_SPECS[options.format] ?? FORMAT_SPECS.webtoon
  const isScroll = options.format === 'webtoon' || options.format === 'manhwa'

  // Capture the rendered preview as a canvas
  const canvas = await captureElement(containerEl, options.dpi)

  // Apply grayscale for manga
  const finalCanvas = options.format === 'manga' ? applyGrayscale(canvas) : canvas

  if (isScroll) {
    // Vertical scroll: create a tall PDF
    const widthMM = (spec.widthPx / options.dpi) * 25.4
    const pdfW = widthMM
    const pdfH = (finalCanvas.height / finalCanvas.width) * widthMM

    const pdf = new jsPDF({
      orientation: pdfH > pdfW ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pdfW, pdfH],
    })

    const imgData = finalCanvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
    pdf.save(`${options.title} - ${options.episodeTitle}.pdf`)
  } else {
    // Page-based: split into pages
    const pageEls = containerEl.querySelectorAll('[data-page]')
    if (pageEls.length === 0) {
      // Fallback: single page capture
      const widthIn = spec.widthPx / 100
      const heightIn = (spec.heightPx ?? 1025) / 100
      const pdf = new jsPDF({
        orientation: heightIn > widthIn ? 'portrait' : 'landscape',
        unit: 'in',
        format: [widthIn, heightIn],
      })
      const imgData = finalCanvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, widthIn, heightIn)
      pdf.save(`${options.title} - ${options.episodeTitle}.pdf`)
      return
    }

    let pdf: InstanceType<typeof jsPDF> | null = null
    for (let i = 0; i < pageEls.length; i++) {
      const pageCanvas = await captureElement(pageEls[i] as HTMLElement, options.dpi)
      const fc = options.format === 'manga' ? applyGrayscale(pageCanvas) : pageCanvas

      const widthIn = spec.widthPx / 100
      const heightIn = (spec.heightPx ?? 1025) / 100

      if (!pdf) {
        pdf = new jsPDF({
          orientation: heightIn > widthIn ? 'portrait' : 'landscape',
          unit: 'in',
          format: [widthIn, heightIn],
        })
      } else {
        pdf.addPage([widthIn, heightIn])
      }

      const imgData = fc.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, widthIn, heightIn)
    }
    pdf?.save(`${options.title} - ${options.episodeTitle}.pdf`)
  }

  recordExport({
    projectId: '',
    scope: options.scope ?? 'episode',
    outputFormat: 'pdf',
    dpi: options.dpi,
    status: 'complete',
    completedAt: new Date().toISOString(),
  })
}

/* ─── PNG Export ─── */

export async function exportPNGSequence(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<Blob[]> {
  const pageEls = containerEl.querySelectorAll('[data-page]')
  const blobs: Blob[] = []

  const targets = pageEls.length > 0
    ? Array.from(pageEls) as HTMLElement[]
    : [containerEl]

  for (const el of targets) {
    const canvas = await captureElement(el, options.dpi)
    const fc = options.format === 'manga' ? applyGrayscale(canvas) : canvas
    const blob = await new Promise<Blob>((resolve) => {
      fc.toBlob(b => resolve(b!), 'image/png')
    })
    blobs.push(blob)
  }

  return blobs
}

/* ─── ZIP Export ─── */

export async function exportZIP(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import('jszip'),
    import('file-saver'),
  ])
  const pngs = await exportPNGSequence(containerEl, options)
  const zip = new JSZip()
  const folder = zip.folder(`${options.title} - ${options.episodeTitle}`)

  pngs.forEach((blob, i) => {
    folder?.file(`page-${String(i + 1).padStart(3, '0')}.png`, blob)
  })

  // Add manifest
  const manifest = {
    project: options.title,
    episode: options.episodeTitle,
    exportedAt: new Date().toISOString(),
    format: options.format,
    dpi: options.dpi,
    pages: pngs.length,
  }
  folder?.file('manifest.json', JSON.stringify(manifest, null, 2))

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${options.title} - ${options.episodeTitle}.zip`)

  recordExport({
    projectId: '',
    scope: options.scope ?? 'episode',
    outputFormat: 'zip',
    dpi: options.dpi,
    status: 'complete',
    completedAt: new Date().toISOString(),
  })
}

/* ─── Single PNG download ─── */

export async function exportSinglePNG(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const { saveAs } = await import('file-saver')
  const canvas = await captureElement(containerEl, options.dpi)
  const fc = options.format === 'manga' ? applyGrayscale(canvas) : canvas
  fc.toBlob(blob => {
    if (blob) saveAs(blob, `${options.title} - ${options.episodeTitle}.png`)
  }, 'image/png')

  recordExport({
    projectId: '',
    scope: options.scope ?? 'episode',
    outputFormat: 'png',
    dpi: options.dpi,
    status: 'complete',
    completedAt: new Date().toISOString(),
  })
}

/* ─── Webtoon Slice Export ─── */

export async function exportWebtoonZIP(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const [{ default: JSZip }, { saveAs }, { sliceWebtoonCanvas }] = await Promise.all([
    import('jszip'),
    import('file-saver'),
    import('./webtoonSlicer'),
  ])

  const canvas = await captureElement(containerEl, options.dpi)
  const slices = await sliceWebtoonCanvas(canvas)

  const zip = new JSZip()
  const folder = zip.folder(`${options.title} - ${options.episodeTitle} - Webtoon`)

  slices.forEach((slice, i) => {
    const name = `${options.title.toLowerCase().replace(/\s+/g, '-')}-${String(i + 1).padStart(3, '0')}.png`
    folder?.file(name, slice.blob)
  })

  // Add manifest
  folder?.file('manifest.json', JSON.stringify({
    project: options.title,
    episode: options.episodeTitle,
    exportedAt: new Date().toISOString(),
    format: 'webtoon-slice',
    dpi: options.dpi,
    slices: slices.length,
    maxSliceHeight: 800,
  }, null, 2))

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${options.title} - ${options.episodeTitle} - Webtoon.zip`)

  recordExport({
    projectId: '',
    scope: options.scope ?? 'episode',
    outputFormat: 'zip',
    preset: 'webtoon-slice',
    dpi: options.dpi,
    status: 'complete',
    completedAt: new Date().toISOString(),
  })
}
