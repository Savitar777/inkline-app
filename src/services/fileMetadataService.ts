import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { FileCategory, UploadedFile, FileMetadata } from '../types/files'
import type { Database } from '../lib/database.types'
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
type UploadedFileRow = Database['public']['Tables']['uploaded_files']['Row']

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
      error_message: record.errorMessage ?? null,
      metadata: record.metadata as Record<string, unknown>,
      tags: [...new Set([...(record.metadata.tags ?? []), ...(record.metadata.autoTags ?? [])])],
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

export async function updateFileTags(
  fileId: string,
  tags: string[],
  autoTags: string[],
  projectId?: string,
): Promise<void> {
  const allTags = [...new Set([...tags, ...autoTags])]

  if (!isSupabaseConfigured) {
    if (!projectId) return
    const records = getOfflineRecords(projectId)
    const idx = records.findIndex(r => r.id === fileId)
    if (idx >= 0) {
      records[idx].metadata = { ...records[idx].metadata, tags, autoTags }
      setOfflineRecords(projectId, records)
    }
    return
  }

  const record = await getFileRecord(fileId)
  if (!record) return

  const updatedMetadata = { ...record.metadata, tags, autoTags }
  const { error } = await supabase
    .from('uploaded_files')
    .update({
      metadata: updatedMetadata as Record<string, unknown>,
      tags: allTags,
    })
    .eq('id', fileId)

  if (error) handleError('updateFileTags', error)
}

export async function searchProjectFiles(
  projectId: string,
  query: string,
  filterTags: string[],
): Promise<UploadedFile[]> {
  if (!isSupabaseConfigured) {
    const records = getOfflineRecords(projectId)
    return records.filter(r => {
      const allTags = [...(r.metadata.tags ?? []), ...(r.metadata.autoTags ?? [])]
      const matchesQuery = !query || r.originalName.toLowerCase().includes(query.toLowerCase()) ||
        allTags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      const matchesTags = filterTags.length === 0 || filterTags.every(ft => allTags.includes(ft))
      return matchesQuery && matchesTags
    })
  }

  let dbQuery = supabase
    .from('uploaded_files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (filterTags.length > 0) {
    dbQuery = dbQuery.contains('tags', filterTags)
  }

  if (query) {
    dbQuery = dbQuery.ilike('original_name', `%${query}%`)
  }

  const { data, error } = await dbQuery
  if (error) { handleError('searchProjectFiles', error); return [] }
  return (data ?? []).map(mapRow)
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

function mapRow(row: UploadedFileRow): UploadedFile {
  const metadata = { ...(row.metadata as FileMetadata) }
  if (row.tags.length > 0 && !metadata.tags) {
    metadata.tags = row.tags
  }

  return {
    id: row.id,
    projectId: row.project_id,
    category: row.category as FileCategory,
    originalName: row.original_name,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.created_at,
    status: row.status,
    errorMessage: row.error_message ?? undefined,
    metadata,
  }
}
