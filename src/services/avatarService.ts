import { validate } from './fileValidationService'
import { getStorageAdapter } from './fileStorageService'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { UserRole } from '../lib/database.types'

function handleError(context: string, error: unknown): void {
  if (import.meta.env.DEV) console.error(`[avatarService] ${context}:`, error)
}

export async function uploadAvatar(
  file: File,
  userId: string,
  userRole: UserRole = 'writer',
): Promise<string | null> {
  const validation = await validate(file, 'avatars', userRole, userId)
  if (!validation.ok) {
    handleError('uploadAvatar', validation.error)
    return null
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const path = `${userId}/avatar.${ext}`

  const storage = getStorageAdapter()
  const result = await storage.upload('avatars', path, file, { upsert: true })
  if (!result) {
    handleError('uploadAvatar', new Error('Storage upload failed.'))
    return null
  }

  // Update the user row
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: result.url })
      .eq('id', userId)

    if (error) {
      handleError('uploadAvatar.updateUser', error)
    }
  }

  return result.url
}
