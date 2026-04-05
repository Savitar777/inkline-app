import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas-pro'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { FORMAT_SPECS } from '../lib/assemblyEngine'

/* ─── Types ─── */

export interface ExportOptions {
  format: string
  dpi: number
  colorProfile: 'rgb' | 'cmyk'
  title: string
  episodeTitle: string
}

/* ─── Helpers ─── */

async function captureElement(el: HTMLElement, dpi: number): Promise<HTMLCanvasElement> {
  const scale = dpi / 72
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

/* ─── PDF Export ─── */

export async function exportPDF(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<void> {
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

    let pdf: jsPDF | null = null
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
  const pngs = await exportPNGSequence(containerEl, options)
  const zip = new JSZip()
  const folder = zip.folder(`${options.title} - ${options.episodeTitle}`)

  pngs.forEach((blob, i) => {
    folder?.file(`page-${String(i + 1).padStart(3, '0')}.png`, blob)
  })

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${options.title} - ${options.episodeTitle}.zip`)
}

/* ─── Single PNG download ─── */

export async function exportSinglePNG(
  containerEl: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const canvas = await captureElement(containerEl, options.dpi)
  const fc = options.format === 'manga' ? applyGrayscale(canvas) : canvas
  fc.toBlob(blob => {
    if (blob) saveAs(blob, `${options.title} - ${options.episodeTitle}.png`)
  }, 'image/png')
}
