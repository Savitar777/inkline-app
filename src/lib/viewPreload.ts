import type { WorkspaceView } from '../types/preferences'

type IdleHandle = number
type IdleCallback = (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void

const IDLE_PRELOAD_TARGETS: Record<WorkspaceView, WorkspaceView[]> = {
  editor: ['collab'],
  collab: ['compile'],
  compile: [],
  'story-bible': [],
  'character-bible': [],
  production: [],
}

export function getIdlePreloadTargets(activeView: WorkspaceView): WorkspaceView[] {
  return IDLE_PRELOAD_TARGETS[activeView]
}

export function scheduleIdleTask(task: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: IdleCallback, options?: { timeout: number }) => number
    cancelIdleCallback?: (handle: number) => void
  }

  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(task as IdleCallback, { timeout: 1200 }) as IdleHandle
    return () => idleWindow.cancelIdleCallback?.(handle)
  }

  const handle = globalThis.setTimeout(task, 250)
  return () => globalThis.clearTimeout(handle)
}
