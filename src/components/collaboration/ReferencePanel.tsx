import { memo, useState, useEffect, useCallback } from 'react'
import { Trash2, FileText } from '../../icons'
import FileUploadZone from '../FileUploadZone'
import { uploadReferenceFile, listReferenceFiles, deleteReferenceFile } from '../../services/referenceFileService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { UploadedFile } from '../../types/files'

interface ReferencePanelProps {
  projectId: string
  episodeId: string | null
}

function isImageMime(mime: string): boolean {
  return mime.startsWith('image/')
}

function ReferencePanel({ projectId, episodeId }: ReferencePanelProps) {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)

  const loadFiles = useCallback(async () => {
    const result = await listReferenceFiles(projectId, episodeId ?? undefined)
    setFiles(result)
  }, [projectId, episodeId])

  useEffect(() => { void loadFiles() }, [loadFiles])

  const handleUpload = async (newFiles: File[]) => {
    if (!profile) return
    setUploading(true)
    for (const file of newFiles) {
      const result = await uploadReferenceFile(projectId, episodeId, file, profile.id, profile.role)
      if (result) {
        setFiles(prev => [result, ...prev])
      } else {
        showToast(`Failed to upload ${file.name}`, 'error')
      }
    }
    setUploading(false)
  }

  const handleDelete = async (fileId: string) => {
    await deleteReferenceFile(fileId, projectId)
    setFiles(prev => prev.filter(f => f.id !== fileId))
    showToast('File deleted', 'success')
  }

  const imageFiles = files.filter(f => isImageMime(f.mimeType))
  const docFiles = files.filter(f => !isImageMime(f.mimeType))

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-ink-border">
        <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">
          References
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {files.length === 0 && !uploading && (
          <div className="text-center py-6">
            <p className="text-xs text-ink-muted font-sans">No reference files yet.</p>
            <p className="text-[11px] text-ink-muted/60 font-sans mt-1">Drop images or documents below.</p>
          </div>
        )}

        {/* Image thumbnails */}
        {imageFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {imageFiles.map(file => (
              <div key={file.id} className="group relative rounded-lg border border-ink-border overflow-hidden bg-ink-panel">
                <img
                  src={file.publicUrl ?? ''}
                  alt={file.originalName}
                  className="w-full h-24 object-cover"
                  loading="lazy"
                />
                <div className="px-2 py-1.5">
                  <p className="text-[10px] text-ink-text font-sans truncate">{file.originalName}</p>
                </div>
                <button
                  aria-label="Delete file"
                  onClick={() => handleDelete(file.id)}
                  className="absolute top-1 right-1 p-1 rounded bg-ink-black/60 text-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Document files */}
        {docFiles.length > 0 && (
          <div className="space-y-1.5">
            {docFiles.map(file => (
              <div key={file.id} className="group flex items-center gap-2 px-2.5 py-2 rounded-lg border border-ink-border bg-ink-panel hover:border-ink-gold/20 transition-colors">
                <FileText size={14} className="text-ink-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink-text font-sans truncate">{file.originalName}</p>
                  <p className="text-[10px] text-ink-muted font-sans">{(file.sizeBytes / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  aria-label="Delete file"
                  onClick={() => handleDelete(file.id)}
                  className="p-1 rounded text-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload zone */}
      <div className="px-3 pb-3 pt-1">
        <FileUploadZone
          accept="reference-files"
          multiple
          uploading={uploading}
          compact
          label="Drop reference files here"
          onFiles={handleUpload}
        />
      </div>
    </div>
  )
}

export default memo(ReferencePanel)
