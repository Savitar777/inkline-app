import type { FileCategory, ValidationResult } from '../types/files'
import { FileValidationError, FILE_SIZE_LIMITS, ALLOWED_MIMES, CATEGORY_ROLE_PERMISSIONS } from '../types/files'
import type { UserRole } from '../lib/database.types'

/* ─── Magic Bytes Signatures ─── */

const MAGIC_BYTES: [number[], string][] = [
  [[0x89, 0x50, 0x4E, 0x47], 'image/png'],
  [[0xFF, 0xD8, 0xFF], 'image/jpeg'],
  [[0x47, 0x49, 0x46, 0x38], 'image/gif'],
  [[0x25, 0x50, 0x44, 0x46], 'application/pdf'],
  [[0x50, 0x4B, 0x03, 0x04], 'application/zip'],  // DOCX is ZIP-based
]

/* ─── Filename Sanitization ─── */

export function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[/\\:*?"<>|]/g, '_')
      .replace(/\.\./g, '_')
      .replace(/^\./, '_')
      .replace(/\s+/g, '_')
      .slice(0, 200) || 'unnamed_file'
  )
}

/* ─── Magic Bytes Detection ─── */

export async function detectMimeFromMagicBytes(file: File): Promise<string> {
  const buffer = await file.slice(0, 16).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Check fixed signatures
  for (const [signature, mime] of MAGIC_BYTES) {
    if (signature.every((b, i) => bytes[i] === b)) {
      // Differentiate WEBP from other RIFF formats
      if (mime === 'application/zip') return mime
      return mime
    }
  }

  // WEBP: RIFF....WEBP
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp'
  }

  // SVG / JSON: text-based, start with < or {
  if (bytes[0] === 0x3C) return 'image/svg+xml'   // '<'
  if (bytes[0] === 0x7B) return 'application/json' // '{'

  return ''
}

/* ─── SVG Sanitization ─── */

const SVG_UNSAFE_PATTERNS = [
  /<script/i,
  /on\w+\s*=/i,
  /javascript:/i,
  /<use[^>]+href/i,
]

export async function validateSvg(file: File): Promise<ValidationResult> {
  const text = await file.text()

  for (const pattern of SVG_UNSAFE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        ok: false,
        error: new FileValidationError('svg_unsafe', 'SVG contains unsafe content (scripts, event handlers, or external references).'),
      }
    }
  }

  return { ok: true }
}

/* ─── Duplicate Detection ─── */

const HASH_STORE_PREFIX = 'inkline-file-hashes-'
const MAX_HASHES = 500

export async function checkDuplicate(file: File, projectId: string): Promise<boolean> {
  const slice = file.slice(0, 65536)
  const buffer = await slice.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const storeKey = `${HASH_STORE_PREFIX}${projectId}`

  try {
    const stored: string[] = JSON.parse(localStorage.getItem(storeKey) ?? '[]')

    if (stored.includes(hash)) return true

    // Circular eviction
    const updated = stored.length >= MAX_HASHES ? [...stored.slice(1), hash] : [...stored, hash]
    localStorage.setItem(storeKey, JSON.stringify(updated))
  } catch {
    // localStorage unavailable or corrupt — skip duplicate check
  }

  return false
}

/* ─── Permission Check ─── */

export function checkPermission(category: FileCategory, userRole: UserRole): boolean {
  return (CATEGORY_ROLE_PERMISSIONS[category] as readonly string[]).includes(userRole)
}

/* ─── Extension-to-MIME Mapping ─── */

const EXT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  txt: 'text/plain',
  md: 'text/markdown',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  json: 'application/json',
}

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

/* ─── Main Validation ─── */

export async function validate(
  file: File,
  category: FileCategory,
  userRole: UserRole,
  projectId: string,
): Promise<ValidationResult> {
  // 1. Permission check
  if (!checkPermission(category, userRole)) {
    return {
      ok: false,
      error: new FileValidationError(
        'permission_denied',
        `Your role (${userRole}) cannot upload to ${category}.`,
      ),
    }
  }

  // 2. File size check
  const maxSize = FILE_SIZE_LIMITS[category]
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024))
    return {
      ok: false,
      error: new FileValidationError(
        'file_too_large',
        `File exceeds the ${maxMB} MB limit for ${category}.`,
      ),
    }
  }

  // 3. MIME type whitelist
  const allowedMimes = ALLOWED_MIMES[category]
  const ext = getExtension(file.name)
  const declaredMime = file.type || EXT_TO_MIME[ext] || ''

  if (allowedMimes.length > 0 && !allowedMimes.includes(declaredMime)) {
    // Try extension-based fallback
    const extMime = EXT_TO_MIME[ext] ?? ''
    if (!allowedMimes.includes(extMime)) {
      return {
        ok: false,
        error: new FileValidationError(
          'mime_type_rejected',
          `File type "${declaredMime || ext}" is not allowed for ${category}.`,
        ),
      }
    }
  }

  // 4. Magic bytes check (for binary files)
  const detectedMime = await detectMimeFromMagicBytes(file)
  if (detectedMime) {
    // For DOCX files, magic bytes detect as application/zip which is expected
    const isDocxZip = ext === 'docx' && detectedMime === 'application/zip'
    const mimesMatch =
      detectedMime === declaredMime ||
      detectedMime === EXT_TO_MIME[ext] ||
      isDocxZip

    if (!mimesMatch) {
      return {
        ok: false,
        error: new FileValidationError(
          'extension_mismatch',
          `File content doesn't match its extension. Detected: ${detectedMime}, expected: ${declaredMime || ext}.`,
        ),
      }
    }
  }

  // 5. SVG safety check
  if (declaredMime === 'image/svg+xml' || ext === 'svg') {
    const svgResult = await validateSvg(file)
    if (!svgResult.ok) return svgResult
  }

  // 6. Duplicate detection
  const isDuplicate = await checkDuplicate(file, projectId)
  if (isDuplicate) {
    return {
      ok: false,
      error: new FileValidationError(
        'duplicate_detected',
        'This file appears to have already been uploaded.',
      ),
    }
  }

  return {
    ok: true,
    sanitizedName: sanitizeFilename(file.name),
    detectedMime: detectedMime || declaredMime,
  }
}
