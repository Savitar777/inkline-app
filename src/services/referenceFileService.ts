import type { UploadedFile } from '../types/files'
import { validate } from './fileValidationService'
import { getStorageAdapter } from './fileStorageService'
import { createFileRecord, listProjectFiles, deleteFileRecord } from './fileMetadataService'
import type { UserRole } from '../lib/database.types'

function handleError(context: string, error: unknown): void {
  if (import.meta.env.DEV) console.error(`[referenceFileService] ${context}:`, error)
}

export async function uploadReferenceFile(
  projectId: string,
  episodeId: string | null,
  file: File,
  userId: string,
  userRole: UserRole = 'writer',
): Promise<UploadedFile | null> {
  const validation = await validate(file, 'reference-files', userRole, projectId)
  if (!validation.ok) {
    handleError('uploadReferenceFile', validation.error)
    return null
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const scope = episodeId ?? 'general'
  const path = `${projectId}/refs/${scope}/${Date.now()}.${ext}`

  const storage = getStorageAdapter()
  const result = await storage.upload('reference-files', path, file)
  if (!result) {
    handleError('uploadReferenceFile', new Error('Storage upload failed.'))
    return null
  }

  const record = await createFileRecord({
    projectId,
    category: 'reference-files',
    originalName: validation.sanitizedName ?? file.name,
    storagePath: path,
    publicUrl: result.url,
    mimeType: file.type || `application/octet-stream`,
    sizeBytes: file.size,
    uploadedBy: userId,
    uploadedAt: new Date().toISOString(),
    status: 'complete',
    metadata: { episodeId: episodeId ?? undefined },
  })

  return record
}

export async function listReferenceFiles(
  projectId: string,
  episodeId?: string,
): Promise<UploadedFile[]> {
  const files = await listProjectFiles(projectId, 'reference-files')
  if (!episodeId) return files
  return files.filter(f => f.metadata.episodeId === episodeId)
}

export async function deleteReferenceFile(fileId: string, projectId?: string): Promise<void> {
  await deleteFileRecord(fileId, projectId)
}
