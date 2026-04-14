import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PanelBlock from './PanelBlock'
import type { Character, Panel, ContentBlock } from '../types'

interface Props {
  panel: Panel
  episodeId: string
  pageId: string
  characters?: Character[]
  onUpdate: (panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description' | 'status' | 'panelType' | 'assetUrl' | 'changeRequests' | 'revisions'>>) => void
  onDelete: (panelId: string) => void
  onAddBlock: (panelId: string, type: ContentBlock['type']) => void
  onUpdateBlock: (panelId: string, blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'type'>>) => void
  onDeleteBlock: (panelId: string, blockId: string) => void
}

export default function SortablePanelBlock(props: Props) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.panel.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <PanelBlock {...props} dragListeners={listeners} />
    </div>
  )
}
