import type { ContentBlock } from '../types'
import type { BubbleData } from '../components/LetteringOverlay'

export function generateBubblesFromContent(
  pages: { id: string; number: number; panels: { id: string; number: number; content: ContentBlock[] }[] }[],
  layoutWidth: number,
  layoutHeight: number,
): BubbleData[] {
  const bubbles: BubbleData[] = []
  let index = 0

  for (const page of pages) {
    for (const panel of page.panels) {
      const blockCount = panel.content.length
      panel.content.forEach((block, blockIndex) => {
        const yRatio = blockCount > 1 ? 0.2 + (blockIndex / (blockCount - 1)) * 0.6 : 0.5
        bubbles.push({
          id: `bubble-${index++}`,
          panelId: panel.id,
          type: block.type,
          character: block.character,
          text: block.text,
          x: layoutWidth * 0.5,
          y: layoutHeight * yRatio,
        })
      })
    }
  }

  return bubbles
}
