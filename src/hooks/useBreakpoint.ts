import { useSyncExternalStore } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

const MOBILE_MAX = 767
const TABLET_MAX = 1024

function getBreakpoint(): Breakpoint {
  const w = window.innerWidth
  if (w <= MOBILE_MAX) return 'mobile'
  if (w <= TABLET_MAX) return 'tablet'
  return 'desktop'
}

let current = getBreakpoint()

const listeners = new Set<() => void>()

window.addEventListener('resize', () => {
  const next = getBreakpoint()
  if (next !== current) {
    current = next
    for (const listener of listeners) listener()
  }
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return current
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getSnapshot)
}
