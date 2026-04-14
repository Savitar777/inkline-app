import { memo, useState, useCallback } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronDown, ChevronRight, Grip, Plus, Trash2 } from '../icons'
import Tag from './Tag'
import SortablePanelBlock from './SortablePanelBlock'
import ConfirmDialog from './workspace/ConfirmDialog'
import type { Character, Page, Panel, ContentBlock } from '../types'

const SHOT_TYPES = ['Wide / Establishing', 'Wide', 'Medium-wide', 'Medium', 'Close-up', 'Extreme close-up', 'Over-the-shoulder', 'POV', 'Insert']

interface Props {
  page: Page
  episodeId: string
  characters?: Character[]
  onUpdatePage: (pageId: string, updates: Partial<Pick<Page, 'layoutNote'>>) => void
  onDeletePage: (pageId: string) => void
  onAddPanel: (pageId: string, shot: string) => void
  onUpdatePanel: (pageId: string, panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description' | 'status' | 'panelType' | 'assetUrl' | 'changeRequests' | 'revisions'>>) => void
  onDeletePanel: (pageId: string, panelId: string) => void
  onReorderPanels: (pageId: string, orderedPanelIds: string[]) => void
  onAddBlock: (pageId: string, panelId: string, type: ContentBlock['type']) => void
  onUpdateBlock: (pageId: string, panelId: string, blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'type'>>) => void
  onDeleteBlock: (pageId: string, panelId: string, blockId: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragListeners?: any
}

export default memo(function PageBlock({
  page, episodeId, characters,
  onUpdatePage, onDeletePage,
  onAddPanel, onUpdatePanel, onDeletePanel, onReorderPanels,
  onAddBlock, onUpdateBlock, onDeleteBlock, dragListeners,
}: Props) {
  const [open, setOpen] = useState(true)
  const [editingNote, setEditingNote] = useState(false)
  const [noteDraft, setNoteDraft] = useState(page.layoutNote)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [selectedShot, setSelectedShot] = useState(SHOT_TYPES[0])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handlePanelDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = page.panels.findIndex(p => p.id === active.id)
    const newIndex = page.panels.findIndex(p => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...page.panels]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    onReorderPanels(page.id, reordered.map(p => p.id))
  }, [page.panels, page.id, onReorderPanels])

  const saveNote = () => {
    onUpdatePage(page.id, { layoutNote: noteDraft })
    setEditingNote(false)
  }

  const handleAddPanel = () => {
    onAddPanel(page.id, selectedShot)
    setShowAddPanel(false)
    setSelectedShot(SHOT_TYPES[0])
    setOpen(true)
  }

  return (
    <div role="treeitem" aria-expanded={open} className="border-l-2 border-tag-page/20 group/page ink-fade-in">
      <div className="flex items-center gap-1 w-full">
        <span {...dragListeners} className="cursor-grab active:cursor-grabbing touch-none pl-2" aria-label="Drag to reorder page">
          <Grip size={10} className="text-ink-muted shrink-0" />
        </span>
        <button
          aria-label={open ? 'Collapse page' : 'Expand page'}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 px-3 py-2.5 hover:bg-tag-page/5 transition-colors text-left"
        >
          {open ? <ChevronDown size={14} className="text-tag-page shrink-0" /> : <ChevronRight size={14} className="text-tag-page shrink-0" />}
          <Tag type="page">Page {page.number}</Tag>
          <span className="text-xs text-ink-text font-sans ml-2">{page.panels.length} panel{page.panels.length !== 1 ? 's' : ''}</span>

          {/* Layout note inline edit */}
          <div className="ml-auto mr-2" onClick={e => e.stopPropagation()}>
            {editingNote ? (
              <input
                className="bg-ink-panel border border-ink-gold/40 rounded px-2 py-0.5 text-[10px] font-sans text-ink-light outline-none w-56"
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                onBlur={saveNote}
                onKeyDown={e => { if (e.key === 'Enter') saveNote(); if (e.key === 'Escape') { setNoteDraft(page.layoutNote); setEditingNote(false) } }}
                autoFocus
              />
            ) : (
              <span
                role="button"
                tabIndex={0}
                aria-label="Edit layout note"
                onClick={() => { setNoteDraft(page.layoutNote); setEditingNote(true) }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setNoteDraft(page.layoutNote); setEditingNote(true) } }}
                className="text-[10px] text-ink-muted font-sans cursor-pointer hover:text-ink-text transition-colors"
              >
                {page.layoutNote || 'Add layout note…'}
              </span>
            )}
          </div>
        </button>

        {/* Delete page */}
        <button
          aria-label="Delete page"
          onClick={() => setConfirmDelete(true)}
          className="opacity-0 group-hover/page:opacity-100 mr-2 p-1 rounded text-ink-muted hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {open && (
        <div className="space-y-1 pb-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePanelDragEnd}>
            <SortableContext items={page.panels.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {page.panels.map(panel => (
                <SortablePanelBlock
                  key={panel.id}
                  panel={panel}
                  episodeId={episodeId}
                  pageId={page.id}
                  characters={characters}
                  onUpdate={(panelId, updates) => onUpdatePanel(page.id, panelId, updates)}
                  onDelete={panelId => onDeletePanel(page.id, panelId)}
                  onAddBlock={(panelId, type) => onAddBlock(page.id, panelId, type)}
                  onUpdateBlock={(panelId, blockId, updates) => onUpdateBlock(page.id, panelId, blockId, updates)}
                  onDeleteBlock={(panelId, blockId) => onDeleteBlock(page.id, panelId, blockId)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add panel row */}
          {showAddPanel ? (
            <div className="ml-4 flex items-center gap-2 px-3 py-2 border border-dashed border-tag-panel/30 rounded-md bg-tag-panel/5">
              <select
                aria-label="Select shot type"
                value={selectedShot}
                onChange={e => setSelectedShot(e.target.value)}
                className="bg-ink-panel border border-ink-border rounded px-2 py-1 text-xs font-sans text-ink-light outline-none focus:border-ink-gold/50"
              >
                {SHOT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                aria-label="Confirm add panel"
                onClick={handleAddPanel}
                className="px-3 py-1 rounded text-xs font-sans bg-ink-gold text-ink-black font-medium hover:bg-ink-gold-dim transition-colors"
              >
                Add Panel
              </button>
              <button
                aria-label="Cancel add panel"
                onClick={() => setShowAddPanel(false)}
                className="px-2 py-1 rounded text-xs font-sans text-ink-muted hover:text-ink-text transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              aria-label="Add panel to page"
              onClick={() => setShowAddPanel(true)}
              className="ml-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans text-ink-muted border border-dashed border-ink-border/60 rounded hover:border-tag-panel/40 hover:text-tag-panel transition-colors"
            >
              <Plus size={11} /> Add Panel
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete Page ${page.number}?`}
        message="This removes the page and all of its panels from the current episode."
        confirmLabel="Delete page"
        onConfirm={() => {
          onDeletePage(page.id)
          setConfirmDelete(false)
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
})
