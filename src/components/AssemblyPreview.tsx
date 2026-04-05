import { useMemo, forwardRef } from 'react'
import { Image, Layers } from '../icons'
import type { Page } from '../types'
import type { LayoutPage, LayoutPanel } from '../lib/assemblyEngine'
import { computeLayout, getFormatSpec } from '../lib/assemblyEngine'
import type { BubbleData } from './LetteringOverlay'

interface Props {
  pages: Page[]
  format: string
  scale?: number
  showLettering?: boolean
  bubbles?: BubbleData[]
}

function PanelSlot({ panel, scale }: { panel: LayoutPanel; scale: number }) {
  const w = panel.width * scale
  const h = panel.height * scale

  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left: panel.x * scale,
        top: panel.y * scale,
        width: w,
        height: h,
      }}
    >
      {panel.assetUrl ? (
        <img
          src={panel.assetUrl}
          alt={`P${panel.pageNumber} Panel ${panel.panelNumber}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-ink-panel border border-ink-border border-dashed flex flex-col items-center justify-center gap-1">
          {panel.description ? (
            <>
              <Layers size={16} className="text-ink-muted/40" />
              <span className="text-[9px] text-ink-muted font-sans text-center px-2 line-clamp-2">
                {panel.description}
              </span>
            </>
          ) : (
            <>
              <Image size={16} className="text-ink-muted/30" />
              <span className="text-[8px] text-ink-muted/50 font-mono">
                P{panel.pageNumber}·{panel.panelNumber}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function BubbleOverlay({ bubble, scale }: { bubble: BubbleData; scale: number }) {
  const bgMap: Record<string, string> = {
    dialogue: 'bg-white',
    caption: 'bg-yellow-50',
    sfx: 'bg-transparent',
  }
  const borderMap: Record<string, string> = {
    dialogue: 'border-gray-800 rounded-[50%]',
    caption: 'border-gray-600 rounded-md',
    sfx: 'border-transparent',
  }
  const fontMap: Record<string, string> = {
    dialogue: 'font-sans text-gray-900',
    caption: 'font-sans italic text-gray-700',
    sfx: 'font-mono font-black text-red-600',
  }

  return (
    <div
      className={`absolute px-2 py-1 border ${bgMap[bubble.type]} ${borderMap[bubble.type]} pointer-events-none`}
      style={{
        left: bubble.x * scale,
        top: bubble.y * scale,
        maxWidth: 160 * scale,
        transform: 'translate(-50%, -50%)',
        fontSize: `${Math.max(8, 11 * scale)}px`,
        lineHeight: 1.3,
      }}
    >
      {bubble.character && bubble.type === 'dialogue' && (
        <span className="font-bold text-gray-900 block" style={{ fontSize: `${Math.max(7, 9 * scale)}px` }}>
          {bubble.character}
        </span>
      )}
      <span className={fontMap[bubble.type]}>{bubble.text}</span>
    </div>
  )
}

const AssemblyPreview = forwardRef<HTMLDivElement, Props>(
  function AssemblyPreview({ pages, format, scale = 0.5, showLettering = false, bubbles = [] }, ref) {
    const spec = getFormatSpec(format)
    const layoutPages = useMemo(() => computeLayout(pages, format), [pages, format])

    const isScroll = format === 'webtoon' || format === 'manhwa'

    return (
      <div ref={ref} className="flex flex-col items-center gap-6">
        {layoutPages.map((lp: LayoutPage) => (
          <div key={lp.pageIndex} className="relative">
            {/* Page label */}
            {!isScroll && (
              <div className="text-[10px] text-ink-muted font-mono mb-1 text-center">
                Page {lp.pageNumber}
                {spec.readingDirection === 'rtl' && <span className="ml-2 text-ink-muted/50">← RTL</span>}
              </div>
            )}
            {/* Page canvas */}
            <div
              className="relative bg-white shadow-lg"
              style={{
                width: lp.width * scale,
                height: lp.height * scale,
                ...(isScroll ? {} : { border: '1px solid #333' }),
              }}
            >
              {lp.panels.map(panel => (
                <PanelSlot key={panel.panelId} panel={panel} scale={scale} />
              ))}
              {/* Lettering bubbles */}
              {showLettering && bubbles
                .filter(b => {
                  // Match bubbles to panels on this layout page
                  return lp.panels.some(p => p.panelId === b.panelId)
                })
                .map(b => (
                  <BubbleOverlay key={b.id} bubble={b} scale={scale} />
                ))
              }
            </div>
          </div>
        ))}
      </div>
    )
  }
)

export default AssemblyPreview
