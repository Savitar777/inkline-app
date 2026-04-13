import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { FileCategory, UploadedFile, FileMetadata } from '../types/files'
import { getStorageAdapter } from './fileStorageService'

/* ─── Rate Limiter (matches projectService pattern) ─── */

function createRateLimiter(maxCalls: number, windowMs: number) {
  const timestamps: number[] = []
  return function check(): boolean {
    const now = Date.now()
    while (timestamps.length > 0 && timestamps[0] <= now - windowMs) timestamps.shift()
    if (timestamps.length >= maxCalls) return false
    timestamps.push(now)
    return true
  }
}

const uploadLimiter = createRateLimiter(10, 60_000)

function handleError(context: string, error: unknown): void {
  if (import.meta.env.DEV) console.error(`[fileMetadataService] ${context}:`, error)
}

/* ─── Offline Fallback Store ─── */

const OFFLINE_PREFIX = 'inkline-file-records-'

function getOfflineRecords(projectId: string): UploadedFile[] {
  try {
    return JSON.parse(localStorage.getItem(`${OFFLINE_PREFIX}${projectId}`) ?? '[]')
  } catch {
    return []
  }
}

function setOfflineRecords(projectId: string, records: UploadedFile[]) {
  localStorage.setItem(`${OFFLINE_PREFIX}${projectId}`, JSON.stringify(records))
}

/* ─── CRUD Functions ─── */

export async function createFileRecord(
  record: Omit<UploadedFile, 'id'>,
): Promise<UploadedFile | null> {
  if (!uploadLimiter()) {
    handleError('createFileRecord', new Error('Rate limited — too many uploads.'))
    return null
  }

  const id = crypto.randomUUID()

  if (!isSupabaseConfigured) {
    const file: UploadedFile = { id, ...record }
    const records = getOfflineRecords(record.projectId)
    records.push(file)
    setOfflineRecords(record.projectId, records)
    return file
  }

  const { data, error } = await supabase
    .from('uploaded_files')
    .insert({
      id,
      project_id: record.projectId,
      category: record.category,
      original_name: record.originalName,
      storage_path: record.storagePath,
      public_url: record.publicUrl,
      mime_type: record.mimeType,
      size_bytes: record.sizeBytes,
      uploaded_by: record.uploadedBy,
      status: record.status,
      metadata: record.metadata as Record<string, unknown>,
    })
    .select('*')
    .single()

  if (error) {
    handleError('createFileRecord', error)
    return null
  }

  return mapRow(data)
}

export async function listProjectFiles(
  projectId: string,
  category?: FileCategory,
): Promise<UploadedFile[]> {
  if (!isSupabaseConfigured) {
    const records = getOfflineRecords(projectId)
    return category ? records.filter(r => r.category === category) : records
  }

  let query = supabase
    .from('uploaded_files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) { handleError('listProjectFiles', error); return [] }
  return (data ?? []).map(mapRow)
}

export async function getFileRecord(fileId: string): Promise<UploadedFile | null> {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('id', fileId)
    .single()

  if (error) { handleError('getFileRecord', error); return null }
  return mapRow(data)
}

export async function deleteFileRecord(fileId: string, projectId?: string): Promise<void> {
  if (!isSupabaseConfigured) {
    if (!projectId) return
    const records = getOfflineRecords(projectId)
    const record = records.find(r => r.id === fileId)
    if (record) {
      const storage = getStorageAdapter()
      await storage.remove(bucketForCategory(record.category), [record.storagePath])
    }
    setOfflineRecords(projectId, records.filter(r => r.id !== fileId))
    return
  }

  // Fetch record to get storage path before deletion
  const record = await getFileRecord(fileId)
  if (record) {
    const storage = getStorageAdapter()
    await storage.remove(bucketForCategory(record.category), [record.storagePath])
  }

  const { error } = await supabase
    .from('uploaded_files')
    .delete()
    .eq('id', fileId)

  if (error) handleError('deleteFileRecord', error)
}

/* ─── Helpers ─── */

function bucketForCategory(category: FileCategory): string {
  switch (category) {
    case 'panel-assets': return 'panel-artwork'
    case 'reference-files': return 'reference-files'
    case 'script-imports': return 'script-imports'
    case 'avatars': return 'avatars'
    case 'exports': return 'exports'
    case 'project-files': return 'project-files'
    default: return 'panel-artwork'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): UploadedFile {
  return {
    id: row.id,
    projectId: row.project_id,
    category: row.category,
    originalName: row.original_name,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.created_at,
    status: row.status,
    metadata: (row.metadata ?? {}) as FileMetadata,
  }
}
