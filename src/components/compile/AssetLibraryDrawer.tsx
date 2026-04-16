import { memo, useState, useEffect, useMemo } from 'react'
import { X, Trash2, FileText, Image as ImageIcon } from '../../icons'
import { listProjectFiles, deleteFileRecord, searchProjectFiles, updateFileTags } from '../../services/fileMetadataService'
import { useToast } from '../../context/ToastContext'
import AssetSearchBar from '../assets/AssetSearchBar'
import TagChips from '../assets/TagChips'
import TagEditor from '../assets/TagEditor'
import type { UploadedFile, FileCategory } from '../../types/files'

interface AssetLibraryDrawerProps {
  projectId: string
  open: boolean
  onClose: () => void
}

const CATEGORY_LABELS: Record<FileCategory, string> = {
  'panel-assets': 'Panel Artwork',
  'reference-files': 'References',
  'script-imports': 'Script Imports',
  'project-files': 'Project Files',
  'avatars': 'Avatars',
  'exports': 'Exports',
}

function isImageMime(mime: string): boolean {
  return mime.startsWith('image/')
}

function AssetLibraryDrawer({ projectId, open, onClose }: AssetLibraryDrawerProps) {
  const { showToast } = useToast()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null)
  const requestKey = useMemo(() => (
    open
      ? `${projectId}:${searchQuery.trim()}:${[...activeTags].sort().join('|')}`
      : null
  ), [open, projectId, searchQuery, activeTags])
  const loading = requestKey !== null && loadedKey !== requestKey

  useEffect(() => {
    if (!open || !requestKey) return

    let cancelled = false

    void (async () => {
      const result = (searchQuery || activeTags.length > 0)
        ? await searchProjectFiles(projectId, searchQuery, activeTags)
        : await listProjectFiles(projectId)

      if (!cancelled) {
        setFiles(result)
        setLoadedKey(requestKey)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, requestKey, projectId, searchQuery, activeTags])

  const handleDelete = async (fileId: string) => {
    await deleteFileRecord(fileId, projectId)
    setFiles(prev => prev.filter(f => f.id !== fileId))
    showToast('File deleted', 'success')
  }

  const handleCopyUrl = (url: string | null) => {
    if (!url) return
    navigator.clipboard.writeText(url)
    showToast('URL copied', 'success')
  }

  const handleTagToggle = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleAddTag = async (fileId: string, tag: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return
    const newTags = [...(file.metadata.tags ?? []), tag]
    await updateFileTags(fileId, newTags, file.metadata.autoTags ?? [], projectId)
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, metadata: { ...f.metadata, tags: newTags } } : f
    ))
  }

  const handleRemoveTag = async (fileId: string, tag: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return
    const newTags = (file.metadata.tags ?? []).filter(t => t !== tag)
    await updateFileTags(fileId, newTags, file.metadata.autoTags ?? [], projectId)
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, metadata: { ...f.metadata, tags: newTags } } : f
    ))
  }

  // Group by category
  const grouped = files.reduce<Record<string, UploadedFile[]>>((acc, file) => {
    const key = file.category
    if (!acc[key]) acc[key] = []
    acc[key].push(file)
    return acc
  }, {})

  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    for (const file of files) {
      const all = [...(file.metadata.tags ?? []), ...(file.metadata.autoTags ?? [])]
      for (const t of all) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
    }
    return [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 20)
  }, [files])

  const isFiltered = searchQuery || activeTags.length > 0

  const renderFileCard = (file: UploadedFile) => (
    <div key={file.id}>
      <div
        className="group flex items-center gap-2 px-2.5 py-2 rounded-lg border border-ink-border bg-ink-panel hover:border-ink-gold/20 transition-colors cursor-pointer"
        onClick={() => setExpandedFileId(expandedFileId === file.id ? null : file.id)}
      >
        {isImageMime(file.mimeType) ? (
          <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-ink-black/30">
            {file.publicUrl ? (
              <img src={file.publicUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <ImageIcon size={14} className="text-ink-muted m-auto mt-1.5" />
            )}
          </div>
        ) : (
          <FileText size={14} className="text-ink-muted shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-text font-sans truncate">{file.originalName}</p>
          <p className="text-[10px] text-ink-muted font-sans">
            {(file.sizeBytes / 1024).toFixed(1)} KB
          </p>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {file.publicUrl && (
            <button
              aria-label="Copy URL"
              onClick={(e) => { e.stopPropagation(); handleCopyUrl(file.publicUrl) }}
              className="p-1 rounded text-ink-muted hover:text-ink-gold transition-colors text-[10px] font-sans"
              title="Copy URL"
            >
              URL
            </button>
          )}
          <button
            aria-label="Delete file"
            onClick={(e) => { e.stopPropagation(); void handleDelete(file.id) }}
            className="p-1 rounded text-ink-muted hover:text-red-400 transition-colors"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
      {expandedFileId === file.id && (
        <div className="px-2.5 pb-2">
          <TagEditor
            tags={file.metadata.tags ?? []}
            autoTags={file.metadata.autoTags ?? []}
            onAddTag={(tag) => void handleAddTag(file.id, tag)}
            onRemoveTag={(tag) => void handleRemoveTag(file.id, tag)}
          />
        </div>
      )}
    </div>
  )

  if (!open) return null

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-72 bg-ink-dark border-l border-ink-border shadow-2xl flex flex-col ink-stage-enter">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border">
        <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Asset Library</span>
        <button onClick={onClose} aria-label="Close" className="p-1 rounded text-ink-muted hover:text-ink-text transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="px-3 py-2 space-y-2 border-b border-ink-border">
        <AssetSearchBar value={searchQuery} onChange={setSearchQuery} />
        <TagChips tags={allTags} activeTags={activeTags} onToggle={handleTagToggle} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-ink-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && files.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-ink-muted font-sans">No files uploaded yet.</p>
            <p className="text-[11px] text-ink-muted/60 font-sans mt-1">Upload assets through the collaboration or script editor views.</p>
          </div>
        )}

        {!loading && isFiltered ? (
          <>
            <p className="text-[10px] text-ink-muted font-sans mb-2">{files.length} file{files.length !== 1 ? 's' : ''} matching</p>
            <div className="space-y-1.5">
              {files.map(renderFileCard)}
            </div>
          </>
        ) : (
          !loading && Object.entries(grouped).map(([category, catFiles]) => (
            <div key={category}>
              <p className="text-[10px] uppercase tracking-wider text-ink-muted font-sans mb-2">
                {CATEGORY_LABELS[category as FileCategory] ?? category} ({catFiles.length})
              </p>
              <div className="space-y-1.5">
                {catFiles.map(renderFileCard)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default memo(AssetLibraryDrawer)
