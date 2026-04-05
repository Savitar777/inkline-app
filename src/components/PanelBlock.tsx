import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, Grip, Plus, Trash2, MessageCircle, Quote, Volume2 } from '../icons'
import Tag from './Tag'
import ContentBlockView from './ContentBlockView'
import type { Panel, ContentBlock } from '../types'

const SHOT_TYPES = ['Wide / Establishing', 'Wide', 'Medium-wide', 'Medium', 'Close-up', 'Extreme close-up', 'Over-the-shoulder', 'POV', 'Insert']

interface Props {
  panel: Panel
  episodeId: string
  pageId: string
  onUpdate: (panelId: string, updates: Partial<Pick<Panel, 'shot' | 'description'>>) => void
  onDelete: (panelId: string) => void
  onAddBlock: (panelId: string, type: ContentBlock['type']) => void
  onUpdateBlock: (panelId: string, blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'type'>>) => void
  onDeleteBlock: (panelId: string, blockId: string) => void
}

export default function PanelBlock({ panel, episodeId, pageId, onUpdate, onDelete, onAddBlock, onUpdateBlock, onDeleteBlock }: Props) {
  const [open, setOpen] = useState(true)
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState(panel.description)
  const [showShotPicker, setShowShotPicker] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const descRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingDesc && descRef.current) descRef.current.focus()
  }, [editingDesc])

  const saveDesc = () => {
    onUpdate(panel.id, { description: descDraft })
    setEditingDesc(false)
  }

  return (
    <div role="treeitem" aria-expanded={open} className="ml-4 border-l-2 border-tag-panel/20 group/panel">
      <div className="flex items-center gap-1 w-full">
        <button
          aria-label={open ? 'Collapse panel' : 'Expand panel'}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 px-3 py-2 hover:bg-tag-panel/5 transition-colors text-left"
        >
          <Grip size={10} className="text-ink-muted shrink-0" />
          {open ? <ChevronDown size={14} className="text-tag-panel shrink-0" /> : <ChevronRight size={14} className="text-tag-panel shrink-0" />}
          <Tag type="panel">Panel {panel.number}</Tag>

          {/* Shot type picker */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              aria-label="Change shot type"
              onClick={() => setShowShotPicker(v => !v)}
              className="text-xs text-ink-text font-sans ml-2 hover:text-ink-gold transition-colors px-1.5 py-0.5 rounded hover:bg-ink-panel"
            >
              {panel.shot || 'Shot type'}
            </button>
            {showShotPicker && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-ink-panel border border-ink-border rounded-lg shadow-xl z-20 py-1">
                {SHOT_TYPES.map(shot => (
                  <button
                    key={shot}
                    className={`w-full text-left px-3 py-1.5 text-xs font-sans transition-colors ${panel.shot === shot ? 'text-ink-gold bg-ink-gold/10' : 'text-ink-text hover:text-ink-light hover:bg-ink-dark/50'}`}
                    onClick={() => { onUpdate(panel.id, { shot }); setShowShotPicker(false) }}
                  >
                    {shot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </button>

        {/* Delete panel */}
        {confirmDelete ? (
          <div className="flex items-center gap-1 pr-2 shrink-0">
            <span className="text-[10px] text-ink-muted font-sans">Delete panel?</span>
            <button
              aria-label="Confirm delete panel"
              onClick={() => onDelete(panel.id)}
              className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-sans"
            >
              Yes
            </button>
            <button
              aria-label="Cancel delete"
              onClick={() => setConfirmDelete(false)}
              className="px-1.5 py-0.5 rounded text-[10px] text-ink-muted hover:text-ink-text transition-colors font-sans"
            >
              No
            </button>
          </div>
        ) : (
          <button
            aria-label="Delete panel"
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover/panel:opacity-100 mr-2 p-1 rounded text-ink-muted hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {open && (
        <div className="px-3 pb-3">
          {/* Description */}
          {editingDesc ? (
            <div className="pl-4 ml-2 mb-2">
              <textarea
                ref={descRef}
                className="w-full bg-ink-panel border border-ink-gold/40 rounded px-2 py-1.5 text-sm font-sans text-ink-light placeholder:text-ink-muted outline-none resize-none leading-relaxed"
                rows={3}
                value={descDraft}
                onChange={e => setDescDraft(e.target.value)}
                onBlur={saveDesc}
                onKeyDown={e => { if (e.key === 'Escape') { setDescDraft(panel.description); setEditingDesc(false) } }}
                placeholder="Panel description..."
              />
            </div>
          ) : (
            <p
              role="button"
              tabIndex={0}
              aria-label="Edit panel description"
              onClick={() => { setDescDraft(panel.description); setEditingDesc(true) }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setDescDraft(panel.description); setEditingDesc(true) } }}
              className="text-sm text-ink-text leading-relaxed pl-4 mb-2 font-sans border-l border-ink-border/50 ml-2 cursor-pointer hover:text-ink-light hover:border-ink-gold/30 transition-colors"
            >
              {panel.description || <span className="text-ink-muted italic">Click to add description…</span>}
            </p>
          )}

          {/* Content blocks */}
          <div className="space-y-0.5">
            {panel.content.map(block => (
              <ContentBlockView
                key={block.id}
                block={block}
                episodeId={episodeId}
                pageId={pageId}
                panelId={panel.id}
                onUpdate={(blockId, updates) => onUpdateBlock(panel.id, blockId, updates)}
                onDelete={blockId => onDeleteBlock(panel.id, blockId)}
              />
            ))}
          </div>

          {/* Add content block toolbar */}
          <div className="flex items-center gap-1 mt-2 pl-4">
            <span className="text-[10px] text-ink-muted font-sans mr-1">Add:</span>
            <button
              aria-label="Add dialogue block"
              onClick={() => onAddBlock(panel.id, 'dialogue')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans text-tag-dialogue border border-tag-dialogue/30 bg-tag-dialogue/10 hover:bg-tag-dialogue/20 transition-colors"
            >
              <MessageCircle size={9} /> Dialogue
            </button>
            <button
              aria-label="Add caption block"
              onClick={() => onAddBlock(panel.id, 'caption')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans text-tag-caption border border-tag-caption/30 bg-tag-caption/10 hover:bg-tag-caption/20 transition-colors"
            >
              <Quote size={9} /> Caption
            </button>
            <button
              aria-label="Add SFX block"
              onClick={() => onAddBlock(panel.id, 'sfx')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans text-[#F97316] border border-[#F97316]/30 bg-[#F97316]/10 hover:bg-[#F97316]/20 transition-colors"
            >
              <Volume2 size={9} /> SFX
            </button>
            <span className="text-ink-muted/40 mx-1">·</span>
            <Plus size={9} className="text-ink-muted" />
          </div>
        </div>
      )}
    </div>
  )
}
