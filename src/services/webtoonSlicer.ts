import type { WebtoonSlice } from '../types/files'

export const WEBTOON_MAX_SLICE_HEIGHT = 800

export async function sliceWebtoonCanvas(
  sourceCanvas: HTMLCanvasElement,
  maxSliceHeightPx = WEBTOON_MAX_SLICE_HEIGHT,
): Promise<WebtoonSlice[]> {
  const { width, height } = sourceCanvas
  const sliceCount = Math.ceil(height / maxSliceHeightPx)
  const slices: WebtoonSlice[] = []

  for (let i = 0; i < sliceCount; i++) {
    const y = i * maxSliceHeightPx
    const sliceHeight = Math.min(maxSliceHeightPx, height - y)

    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = sliceHeight

    const ctx = offscreen.getContext('2d')
    if (!ctx) continue

    ctx.drawImage(sourceCanvas, 0, -y)

    const blob = await new Promise<Blob>((resolve) => {
      offscreen.toBlob(b => resolve(b!), 'image/png')
    })

    slices.push({ index: i, blob, heightPx: sliceHeight })
  }

  return slices
}
