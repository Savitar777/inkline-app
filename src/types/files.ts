import type { UserRole } from '../lib/database.types'

/* ─── File Categories ─── */

export type FileCategory =
  | 'panel-assets'
  | 'reference-files'
  | 'script-imports'
  | 'project-files'
  | 'avatars'
  | 'exports'

/* ─── MIME Types ─── */

export type SupportedMimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/gif'
  | 'image/svg+xml'
  | 'text/plain'
  | 'text/markdown'
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/json'

/* ─── Processing Status ─── */

export type FileProcessingStatus =
  | 'pending'
  | 'validating'
  | 'processing'
  | 'uploading'
  | 'complete'
  | 'error'
  | 'offline'

/* ─── Core File Record ─── */

export interface FileMetadata {
  width?: number
  height?: number
  thumbnailUrl?: string
  pageCount?: number
  wordCount?: number
  panelId?: string
  episodeId?: string
  pageId?: string
  importedAsScriptId?: string
  exportJobId?: string
  tags?: string[]
  autoTags?: string[]
}

export interface UploadedFile {
  id: string
  projectId: string
  category: FileCategory
  originalName: string
  storagePath: string
  publicUrl: string | null
  mimeType: string
  sizeBytes: number
  uploadedBy: string
  uploadedAt: string
  status: FileProcessingStatus
  errorMessage?: string
  metadata: FileMetadata
}

/* ─── Validation ─── */

export type FileValidationErrorCode =
  | 'file_too_large'
  | 'mime_type_rejected'
  | 'extension_mismatch'
  | 'magic_bytes_mismatch'
  | 'svg_unsafe'
  | 'filename_unsafe'
  | 'dimensions_too_large'
  | 'duplicate_detected'
  | 'permission_denied'
  | 'rate_limited'
  | 'upload_cap_exceeded'

export class FileValidationError extends Error {
  code: FileValidationErrorCode

  constructor(code: FileValidationErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'FileValidationError'
  }
}

export interface ValidationResult {
  ok: boolean
  error?: FileValidationError
  sanitizedName?: string
  detectedMime?: string
}

/* ─── Script Import ─── */

export type ScriptImportFormat = 'txt' | 'md' | 'docx' | 'pdf'
export type ScriptImportMode = 'structured' | 'reference'

export interface ScriptMappingResult {
  episodesDetected: number
  pagesDetected: number
  panelsDetected: number
  unmappedLines: string[]
  warnings: string[]
}

export interface ScriptImportRecord {
  id: string
  projectId: string
  fileId: string
  format: ScriptImportFormat
  mode: ScriptImportMode
  rawText: string
  importedAt: string
  mappingResult?: ScriptMappingResult
}

/* ─── Document Import Results ─── */

export interface TxtImportResult {
  format: 'txt'
  text: string
  lineCount: number
}

export interface MarkdownImportResult {
  format: 'md'
  text: string
  html: string
  headings: string[]
}

export interface DocxImportResult {
  format: 'docx'
  text: string
  warnings: string[]
}

export interface PdfImportResult {
  format: 'pdf'
  text: string
  pageCount: number
  extractionQuality: 'full' | 'partial' | 'failed'
}

export type DocumentImportResult =
  | TxtImportResult
  | MarkdownImportResult
  | DocxImportResult
  | PdfImportResult

/* ─── Export ─── */

export type ExportScope = 'episode' | 'page' | 'panel' | 'project'
export type ExportOutputFormat = 'pdf' | 'png' | 'jpg' | 'webp' | 'zip' | 'json' | 'thumbnail'
export type ExportPresetId = 'webtoon-web' | 'manga-print' | 'comic-print' | 'manhwa-web' | 'webtoon-slice'

export interface ExportJob {
  id: string
  projectId: string
  episodeId?: string
  pageIds?: string[]
  panelIds?: string[]
  scope: ExportScope
  outputFormat: ExportOutputFormat
  preset?: ExportPresetId
  dpi: number
  status: 'queued' | 'running' | 'complete' | 'error'
  startedAt: string
  completedAt?: string
  outputUrl?: string
  errorMessage?: string
}

/* ─── Preflight Validation ─── */

export type PreflightSeverity = 'error' | 'warning' | 'info'

export interface PreflightIssue {
  code: string
  severity: PreflightSeverity
  message: string
  affectedIds?: string[]
}

export interface PreflightResult {
  pass: boolean
  issues: PreflightIssue[]
  estimatedFileSizeMB: number
}

/* ─── Thumbnail Generation ─── */

export type ThumbnailSize = '300x300' | '600x600' | '1200x630'

export interface ThumbnailPreset {
  id: ThumbnailSize
  label: string
  widthPx: number
  heightPx: number
}

/* ─── Webtoon Slicing ─── */

export interface WebtoonSlice {
  index: number
  blob: Blob
  heightPx: number
}

/* ─── Storage Adapter ─── */

export interface StorageAdapter {
  upload(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: { contentType?: string; upsert?: boolean },
  ): Promise<{ url: string; path: string } | null>

  getUrl(bucket: string, path: string): string | Promise<string>

  remove(bucket: string, paths: string[]): Promise<void>
}

/* ─── Upload Config ─── */

export const FILE_SIZE_LIMITS: Record<FileCategory, number> = {
  'panel-assets': 10 * 1024 * 1024,        // 10 MB
  'reference-files': 25 * 1024 * 1024,      // 25 MB
  'script-imports': 5 * 1024 * 1024,        // 5 MB
  'project-files': 2 * 1024 * 1024,         // 2 MB
  'avatars': 2 * 1024 * 1024,               // 2 MB
  'exports': 100 * 1024 * 1024,             // 100 MB
}

export const ALLOWED_MIMES: Record<FileCategory, readonly string[]> = {
  'panel-assets': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
  'reference-files': [
    'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
    'text/plain', 'text/markdown', 'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  'script-imports': [
    'text/plain', 'text/markdown', 'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  'project-files': ['application/json'],
  'avatars': ['image/png', 'image/jpeg', 'image/webp'],
  'exports': [],
}

export const CATEGORY_ROLE_PERMISSIONS: Record<FileCategory, readonly UserRole[]> = {
  'panel-assets': ['artist', 'colorist'],
  'reference-files': ['writer', 'artist', 'colorist', 'letterer', 'admin'],
  'script-imports': ['writer', 'admin'],
  'project-files': ['writer', 'admin'],
  'avatars': ['writer', 'artist', 'colorist', 'letterer', 'admin'],
  'exports': ['writer', 'artist', 'colorist', 'letterer', 'admin'],
}

export const PRIVATE_BUCKETS = new Set(['reference-files', 'script-imports', 'exports'])
