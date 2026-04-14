import { memo, useState, useEffect, useCallback } from 'react'
import { X, Trash2, FileText, Image as ImageIcon } from '../../icons'
import { listProjectFiles, deleteFileRecord } from '../../services/fileMetadataService'
import { useToast } from '../../context/ToastContext'
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
  const [loading, setLoading] = useState(false)

  const loadFiles = useCallback(async () => {
    setLoading(true)
    const result = await listProjectFiles(projectId)
    setFiles(result)
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    if (open) void loadFiles()
  }, [open, loadFiles])

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

  // Group by category
  const grouped = files.reduce<Record<string, UploadedFile[]>>((acc, file) => {
    const key = file.category
    if (!acc[key]) acc[key] = []
    acc[key].push(file)
    return acc
  }, {})

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

        {Object.entries(grouped).map(([category, catFiles]) => (
          <div key={category}>
            <p className="text-[10px] uppercase tracking-wider text-ink-muted font-sans mb-2">
              {CATEGORY_LABELS[category as FileCategory] ?? category} ({catFiles.length})
            </p>
            <div className="space-y-1.5">
              {catFiles.map(file => (
                <div key={file.id} className="group flex items-center gap-2 px-2.5 py-2 rounded-lg border border-ink-border bg-ink-panel hover:border-ink-gold/20 transition-colors">
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
                        onClick={() => handleCopyUrl(file.publicUrl)}
                        className="p-1 rounded text-ink-muted hover:text-ink-gold transition-colors text-[10px] font-sans"
                        title="Copy URL"
                      >
                        URL
                      </button>
                    )}
                    <button
                      aria-label="Delete file"
                      onClick={() => handleDelete(file.id)}
                      className="p-1 rounded text-ink-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(AssetLibraryDrawer)
