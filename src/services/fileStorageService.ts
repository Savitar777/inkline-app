import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { StorageAdapter } from '../types/files'
import { PRIVATE_BUCKETS } from '../types/files'

/* ─── Supabase Storage Adapter ─── */

function createSupabaseStorageAdapter(): StorageAdapter {
  return {
    async upload(bucket, path, file, options) {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: options?.upsert ?? false,
          contentType: options?.contentType,
        })

      if (error) {
        if (import.meta.env.DEV) console.error(`[fileStorage] upload ${bucket}/${path}:`, error)
        return null
      }

      let url: string
      if (PRIVATE_BUCKETS.has(bucket)) {
        const { data: signed, error: signErr } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600)
        if (signErr || !signed) {
          if (import.meta.env.DEV) console.error(`[fileStorage] signedUrl ${bucket}/${path}:`, signErr)
          return null
        }
        url = signed.signedUrl
      } else {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        url = data.publicUrl
      }

      return { url, path }
    },

    getUrl(bucket, path) {
      if (PRIVATE_BUCKETS.has(bucket)) {
        // For sync callers, return a placeholder — use getSignedUrl for real access
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        return data.publicUrl
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    },

    async remove(bucket, paths) {
      const { error } = await supabase.storage.from(bucket).remove(paths)
      if (error && import.meta.env.DEV) {
        console.error(`[fileStorage] remove ${bucket}:`, error)
      }
    },
  }
}

/* ─── Offline Storage Adapter ─── */

const OFFLINE_STORE_PREFIX = 'inkline-files-'
const OFFLINE_MAX_BYTES = 5 * 1024 * 1024  // 5 MB total per project

function getOfflineStore(bucket: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`${OFFLINE_STORE_PREFIX}${bucket}`) ?? '{}')
  } catch {
    return {}
  }
}

function setOfflineStore(bucket: string, store: Record<string, string>) {
  localStorage.setItem(`${OFFLINE_STORE_PREFIX}${bucket}`, JSON.stringify(store))
}

function createOfflineStorageAdapter(): StorageAdapter {
  return {
    async upload(bucket, path, file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const store = getOfflineStore(bucket)

          // Check total size
          const totalSize = Object.values(store).reduce((sum, v) => sum + v.length, 0) + dataUrl.length
          if (totalSize > OFFLINE_MAX_BYTES) {
            if (import.meta.env.DEV) {
              console.warn('[fileStorage] Offline storage quota approaching limit')
            }
          }

          store[path] = dataUrl
          setOfflineStore(bucket, store)
          resolve({ url: dataUrl, path: `offline/${path}` })
        }
        reader.onerror = () => resolve(null)

        if (file instanceof File) {
          reader.readAsDataURL(file)
        } else {
          reader.readAsDataURL(new File([file], 'blob'))
        }
      })
    },

    getUrl(bucket, path) {
      const store = getOfflineStore(bucket)
      return store[path] ?? ''
    },

    async remove(bucket, paths) {
      const store = getOfflineStore(bucket)
      for (const p of paths) delete store[p]
      setOfflineStore(bucket, store)
    },
  }
}

/* ─── Signed URL Helper (Supabase only) ─── */

export async function getSignedUrl(bucket: string, path: string, expiresIn = 60): Promise<string | null> {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) {
    if (import.meta.env.DEV) console.error(`[fileStorage] getSignedUrl:`, error)
    return null
  }
  return data.signedUrl
}

/* ─── Adapter Singleton ─── */

let _adapter: StorageAdapter | null = null

export function getStorageAdapter(): StorageAdapter {
  if (!_adapter) {
    _adapter = isSupabaseConfigured
      ? createSupabaseStorageAdapter()
      : createOfflineStorageAdapter()
  }
  return _adapter
}
