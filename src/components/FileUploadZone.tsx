import { memo, useState, useRef, type DragEvent } from 'react'
import { Upload } from '../icons'
import type { FileCategory } from '../types/files'
import { ALLOWED_MIMES } from '../types/files'

interface FileUploadZoneProps {
  accept: FileCategory
  onFiles: (files: File[]) => void
  multiple?: boolean
  uploading?: boolean
  previewUrl?: string | null
  label?: string
  className?: string
  compact?: boolean
}

const CATEGORY_LABELS: Record<FileCategory, string> = {
  'panel-assets': 'images (PNG, JPG, WEBP, GIF, SVG)',
  'reference-files': 'images or documents',
  'script-imports': 'scripts (TXT, MD, DOCX, PDF)',
  'project-files': 'project files (JSON)',
  'avatars': 'images (PNG, JPG, WEBP)',
  'exports': 'files',
}

function mimeToAccept(category: FileCategory): string {
  const mimes = ALLOWED_MIMES[category]
  if (!mimes || mimes.length === 0) return '*/*'
  return mimes.join(',')
}

function FileUploadZone({
  accept,
  onFiles,
  multiple = false,
  uploading = false,
  previewUrl,
  label,
  className = '',
  compact = false,
}: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onFiles(multiple ? files : [files[0]])
  }

  const handleChange = () => {
    const files = inputRef.current?.files
    if (files && files.length > 0) {
      onFiles(multiple ? Array.from(files) : [files[0]])
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const hint = label ?? `Drop ${CATEGORY_LABELS[accept]} here or click to select`

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        rounded-lg border-2 border-dashed transition-colors cursor-pointer
        ${dragOver ? 'border-ink-gold ring-2 ring-ink-gold/20 bg-ink-gold/5' : 'border-ink-border bg-ink-panel hover:border-ink-gold/30'}
        ${className}
      `}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={mimeToAccept(accept)}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className={compact ? 'p-2' : 'p-3'}>
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-h-48 object-contain rounded"
          />
        </div>
      ) : (
        <div className={`flex flex-col items-center gap-2 text-ink-muted ${compact ? 'py-3 px-2' : 'py-5 px-4'}`}>
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-ink-gold border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-sans text-ink-gold">Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={compact ? 16 : 20} />
              <span className="text-xs font-sans text-center">{hint}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(FileUploadZone)
