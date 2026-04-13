import { useState, useCallback, useRef, useEffect } from 'react'
import type { ContentBlock } from '../types'

/* ─── Types ─── */

export interface BubbleData {
  id: string
  panelId: string
  type: ContentBlock['type']
  character?: string
  text: string
  x: number  // absolute px within the layout page
  y: number
}

export type BubbleFont = 'sans' | 'serif' | 'mono' | 'comic'

interface Props {
  bubbles: BubbleData[]
  onChange: (bubbles: BubbleData[]) => void
  scale: number
  font: BubbleFont
  containerRef: React.RefObject<HTMLDivElement | null>
}

/* ─── Bubble Shape Styles ─── */

function bubbleClasses(type: ContentBlock['type'], font: BubbleFont): string {
  const fontClass: Record<BubbleFont, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    comic: 'font-sans',
  }
  const base = `absolute select-none cursor-move touch-none ${fontClass[font]}`

  switch (type) {
    case 'dialogue':
      return `${base} bg-white border-2 border-gray-800 rounded-[50%] px-3 py-2 text-gray-900 shadow-sm`
    case 'caption':
      return `${base} bg-yellow-50 border border-gray-500 rounded-md px-3 py-1.5 text-gray-700 italic shadow-sm`
    case 'sfx':
      return `${base} text-red-600 font-black text-lg tracking-wider`
    default:
      return base
  }
}

/* ─── Component ─── */

export default function LetteringOverlay({ bubbles, onChange, scale, font, containerRef }: Props) {
  const [dragging, setDragging] = useState<string | null>(null)
  const dragOffset = useRef({ dx: 0, dy: 0 })

  const startDrag = useCallback((clientX: number, clientY: number, bubbleId: string) => {
    const bubble = bubbles.find(b => b.id === bubbleId)
    if (!bubble || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    dragOffset.current = {
      dx: clientX - rect.left - bubble.x * scale,
      dy: clientY - rect.top - bubble.y * scale,
    }
    setDragging(bubbleId)
  }, [bubbles, scale, containerRef])

  const handleMouseDown = useCallback((e: React.MouseEvent, bubbleId: string) => {
    e.preventDefault()
    e.stopPropagation()
    startDrag(e.clientX, e.clientY, bubbleId)
  }, [startDrag])

  const handleTouchStart = useCallback((e: React.TouchEvent, bubbleId: string) => {
    e.stopPropagation()
    const touch = e.touches[0]
    startDrag(touch.clientX, touch.clientY, bubbleId)
  }, [startDrag])

  useEffect(() => {
    if (!dragging) return

    const moveTo = (clientX: number, clientY: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newX = (clientX - rect.left - dragOffset.current.dx) / scale
      const newY = (clientY - rect.top - dragOffset.current.dy) / scale

      onChange(bubbles.map(b =>
        b.id === dragging ? { ...b, x: Math.max(0, newX), y: Math.max(0, newY) } : b
      ))
    }

    const handleMove = (e: MouseEvent) => moveTo(e.clientX, e.clientY)
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      moveTo(e.touches[0].clientX, e.touches[0].clientY)
    }
    const handleUp = () => setDragging(null)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [dragging, bubbles, onChange, scale, containerRef])

  return (
    <>
      {bubbles.map(b => (
        <div
          key={b.id}
          className={bubbleClasses(b.type, font)}
          style={{
            left: b.x * scale,
            top: b.y * scale,
            transform: 'translate(-50%, -50%)',
            fontSize: `${Math.max(8, (b.type === 'sfx' ? 16 : 11) * scale)}px`,
            lineHeight: 1.3,
            maxWidth: 180 * scale,
            zIndex: dragging === b.id ? 50 : 10,
            opacity: dragging === b.id ? 0.85 : 1,
          }}
          onMouseDown={e => handleMouseDown(e, b.id)}
          onTouchStart={e => handleTouchStart(e, b.id)}
        >
          {b.character && b.type === 'dialogue' && (
            <div
              className="font-bold text-gray-900 mb-0.5"
              style={{ fontSize: `${Math.max(7, 9 * scale)}px` }}
            >
              {b.character}
            </div>
          )}
          <div>{b.text}</div>
          {/* Dialogue tail */}
          {b.type === 'dialogue' && (
            <div
              className="absolute w-0 h-0"
              style={{
                bottom: -8 * scale,
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: `${6 * scale}px solid transparent`,
                borderRight: `${6 * scale}px solid transparent`,
                borderTop: `${10 * scale}px solid white`,
                filter: 'drop-shadow(0 1px 0 rgb(31 41 55))',
              }}
            />
          )}
        </div>
      ))}
    </>
  )
}
