import type { PlatformMode } from '../types/preferences'

export type ResolvedPlatformMode = Exclude<PlatformMode, 'auto'>
export type ShortcutToken = 'primary' | 'shift' | 'alt' | 'enter' | string

function readPlatformSource() {
  if (typeof navigator === 'undefined') return ''

  const navigatorWithUserAgentData = navigator as Navigator & {
    userAgentData?: { platform?: string }
  }

  return [
    navigatorWithUserAgentData.userAgentData?.platform,
    navigator.platform,
    navigator.userAgent,
  ].filter(Boolean).join(' ').toLowerCase()
}

export function detectPlatformMode(): ResolvedPlatformMode {
  const platformSource = readPlatformSource()
  return /mac|iphone|ipad|ipod/.test(platformSource) ? 'mac' : 'windows'
}

export function resolvePlatformMode(mode: PlatformMode | ResolvedPlatformMode): ResolvedPlatformMode {
  return mode === 'auto' ? detectPlatformMode() : mode
}

export function getPlatformModeLabel(mode: PlatformMode | ResolvedPlatformMode) {
  return resolvePlatformMode(mode) === 'mac' ? 'Mac' : 'Windows'
}

function formatShortcutToken(mode: PlatformMode | ResolvedPlatformMode, token: ShortcutToken) {
  const resolvedMode = resolvePlatformMode(mode)
  const normalizedToken = token.toLowerCase()

  if (normalizedToken === 'primary') {
    return resolvedMode === 'mac' ? 'Cmd' : 'Ctrl'
  }

  if (normalizedToken === 'alt') {
    return resolvedMode === 'mac' ? 'Option' : 'Alt'
  }

  if (normalizedToken === 'shift') return 'Shift'
  if (normalizedToken === 'enter') return 'Enter'
  if (token.length === 1) return token.toUpperCase()

  return token
}

export function formatShortcut(mode: PlatformMode | ResolvedPlatformMode, tokens: ShortcutToken[]) {
  return tokens.map(token => formatShortcutToken(mode, token)).join('+')
}

function hasPrimaryModifier(event: KeyboardEvent, mode: PlatformMode | ResolvedPlatformMode) {
  const resolvedMode = resolvePlatformMode(mode)

  if (resolvedMode === 'mac') {
    return event.metaKey && !event.ctrlKey
  }

  return event.ctrlKey && !event.metaKey
}

export function matchesShortcut(
  event: KeyboardEvent,
  mode: PlatformMode | ResolvedPlatformMode,
  {
    key,
    shift = false,
    alt = false,
  }: {
    key: string
    shift?: boolean
    alt?: boolean
  },
) {
  if (!hasPrimaryModifier(event, mode)) return false
  if (event.shiftKey !== shift) return false
  if (event.altKey !== alt) return false
  return event.key.toLowerCase() === key.toLowerCase()
}
