import type { ThumbnailSize, ThumbnailPreset } from '../types/files'

export const THUMBNAIL_PRESETS: Record<ThumbnailSize, ThumbnailPreset> = {
  '300x300':  { id: '300x300',  label: 'Square (300)',      widthPx: 300,  heightPx: 300  },
  '600x600':  { id: '600x600',  label: 'Square (600)',      widthPx: 600,  heightPx: 600  },
  '1200x630': { id: '1200x630', label: 'Banner (1200x630)', widthPx: 1200, heightPx: 630 },
}

export async function generateThumbnail(
  containerEl: HTMLElement,
  size: ThumbnailSize,
  dpi = 72,
): Promise<Blob> {
  const preset = THUMBNAIL_PRESETS[size]
  const scale = dpi / 72
  const { default: html2canvas } = await import('html2canvas-pro')

  const sourceCanvas = await html2canvas(containerEl, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  // Center-crop (cover) to target dimensions
  const targetW = preset.widthPx
  const targetH = preset.heightPx
  const srcW = sourceCanvas.width
  const srcH = sourceCanvas.height

  const srcAspect = srcW / srcH
  const targetAspect = targetW / targetH

  let cropW: number, cropH: number, cropX: number, cropY: number
  if (srcAspect > targetAspect) {
    // Source is wider — crop sides
    cropH = srcH
    cropW = srcH * targetAspect
    cropX = (srcW - cropW) / 2
    cropY = 0
  } else {
    // Source is taller — crop top/bottom
    cropW = srcW
    cropH = srcW / targetAspect
    cropX = 0
    cropY = (srcH - cropH) / 2
  }

  const thumb = document.createElement('canvas')
  thumb.width = targetW
  thumb.height = targetH
  const ctx = thumb.getContext('2d')!
  ctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH)

  return new Promise<Blob>((resolve) => {
    thumb.toBlob(b => resolve(b!), 'image/png')
  })
}

export async function exportThumbnailSet(
  containerEl: HTMLElement,
  options: { title: string; episodeTitle: string; sizes: ThumbnailSize[] },
): Promise<void> {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import('jszip'),
    import('file-saver'),
  ])

  const zip = new JSZip()
  const folder = zip.folder(`${options.title} - ${options.episodeTitle} - Thumbnails`)

  for (const size of options.sizes) {
    const blob = await generateThumbnail(containerEl, size)
    folder?.file(`thumbnail-${size}.png`, blob)
  }

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${options.title} - ${options.episodeTitle} - Thumbnails.zip`)
}
