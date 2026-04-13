import type { Page, ContentBlock } from '../types'

/* ─── Format Specs ─── */

export interface FormatSpec {
  id: 'webtoon' | 'manhwa' | 'manga' | 'comic'
  widthPx: number
  heightPx: number | null          // null = infinite scroll
  readingDirection: 'ltr' | 'rtl'
  colorProfile: 'rgb' | 'cmyk'
  dpiDefault: number
  gutterPx: number
  paddingPx: number
  cols: number
  rows: number
}

export const FORMAT_SPECS: Record<string, FormatSpec> = {
  webtoon: {
    id: 'webtoon',
    widthPx: 800,
    heightPx: null,
    readingDirection: 'ltr',
    colorProfile: 'rgb',
    dpiDefault: 72,
    gutterPx: 12,
    paddingPx: 0,
    cols: 1,
    rows: Infinity,
  },
  manhwa: {
    id: 'manhwa',
    widthPx: 720,
    heightPx: null,
    readingDirection: 'ltr',
    colorProfile: 'rgb',
    dpiDefault: 72,
    gutterPx: 10,
    paddingPx: 0,
    cols: 1,
    rows: Infinity,
  },
  manga: {
    id: 'manga',
    widthPx: 688,       // B5 at 300 DPI scaled to preview: 182mm ≈ 688px at preview scale
    heightPx: 972,      // 257mm ≈ 972px at preview scale
    readingDirection: 'rtl',
    colorProfile: 'rgb', // grayscale enforced at export
    dpiDefault: 300,
    gutterPx: 8,
    paddingPx: 24,
    cols: 2,
    rows: 3,
  },
  comic: {
    id: 'comic',
    widthPx: 663,       // 6.625" at 100dpi preview
    heightPx: 1025,     // 10.25" at 100dpi preview
    readingDirection: 'ltr',
    colorProfile: 'cmyk',
    dpiDefault: 300,
    gutterPx: 8,
    paddingPx: 24,
    cols: 2,
    rows: 3,
  },
}

/* ─── Layout Types ─── */

export interface LayoutPanel {
  panelId: string
  pageNumber: number
  panelNumber: number
  x: number
  y: number
  width: number
  height: number
  assetUrl?: string
  content: ContentBlock[]
  description: string
}

export interface LayoutPage {
  pageIndex: number
  pageNumber: number
  pageId?: string
  width: number
  height: number
  panels: LayoutPanel[]
}

/* ─── Layout Engines ─── */

/** Vertical scroll formats (webtoon / manhwa): stack all panels vertically */
function layoutVerticalScroll(pages: Page[], spec: FormatSpec): LayoutPage[] {
  const panels: LayoutPanel[] = []
  let y = 0
  const panelWidth = spec.widthPx

  for (const pg of pages) {
    for (const pan of pg.panels) {
      // Default panel height: 60% of width for a nice aspect ratio, or use image natural ratio
      const panelHeight = Math.round(panelWidth * 0.6)
      panels.push({
        panelId: pan.id,
        pageNumber: pg.number,
        panelNumber: pan.number,
        x: 0,
        y,
        width: panelWidth,
        height: panelHeight,
        assetUrl: pan.assetUrl,
        content: pan.content,
        description: pan.description,
      })
      y += panelHeight + spec.gutterPx
    }
  }

  // One big continuous page
  return [{
    pageIndex: 0,
    pageNumber: 1,
    pageId: pages[0]?.id,
    width: spec.widthPx,
    height: y > 0 ? y - spec.gutterPx : 400,
    panels,
  }]
}

/** Grid formats (manga / comic): arrange panels into fixed-size pages in a grid */
function layoutGrid(pages: Page[], spec: FormatSpec): LayoutPage[] {
  const result: LayoutPage[] = []
  const pageW = spec.widthPx
  const pageH = spec.heightPx ?? 1025
  const pad = spec.paddingPx
  const gap = spec.gutterPx
  const cols = spec.cols
  const rows = spec.rows
  const cellW = (pageW - pad * 2 - gap * (cols - 1)) / cols
  const cellH = (pageH - pad * 2 - gap * (rows - 1)) / rows
  const panelsPerPage = cols * rows

  // Order pages: manga is RTL (reverse column order within a row)
  const isRtl = spec.readingDirection === 'rtl'

  for (const pg of pages) {
    const layoutPanels: LayoutPanel[] = []

    for (let i = 0; i < pg.panels.length; i++) {
      const pan = pg.panels[i]
      const pageSlot = i % panelsPerPage
      const row = Math.floor(pageSlot / cols)
      let col = pageSlot % cols
      if (isRtl) col = cols - 1 - col

      const x = pad + col * (cellW + gap)
      const y = pad + row * (cellH + gap)

      // If panel is the only one or last in the row, it can span full width
      const isLastInRow = (i === pg.panels.length - 1) && (col === 0)
      const w = isLastInRow && pg.panels.length % cols !== 0 ? pageW - pad * 2 : cellW
      const h = cellH

      layoutPanels.push({
        panelId: pan.id,
        pageNumber: pg.number,
        panelNumber: pan.number,
        x,
        y,
        width: w,
        height: h,
        assetUrl: pan.assetUrl,
        content: pan.content,
        description: pan.description,
      })
    }

    result.push({
      pageIndex: result.length,
      pageNumber: pg.number,
      pageId: pg.id,
      width: pageW,
      height: pageH,
      panels: layoutPanels,
    })
  }

  return result
}

/** Main layout function — dispatches to the correct engine */
export function computeLayout(
  pages: Page[],
  format: string,
): LayoutPage[] {
  const spec = FORMAT_SPECS[format] ?? FORMAT_SPECS.webtoon

  if (format === 'webtoon' || format === 'manhwa') {
    return layoutVerticalScroll(pages, spec)
  }
  return layoutGrid(pages, spec)
}

/** Get the spec for a format */
export function getFormatSpec(format: string): FormatSpec {
  return FORMAT_SPECS[format] ?? FORMAT_SPECS.webtoon
}
