import type { Thread } from '../types'

const STORAGE_KEY = 'inkline-unread'

interface UnreadState {
  /** Maps threadId → count of messages seen (at time of last visit) */
  [threadId: string]: number
}

function load(): UnreadState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UnreadState) : {}
  } catch {
    return {}
  }
}

function save(state: UnreadState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/** Mark a thread as fully read (all current messages seen). */
export function markThreadRead(threadId: string, messageCount: number): void {
  const state = load()
  state[threadId] = messageCount
  save(state)
}

/** Compute unread count for a single thread. */
export function getUnreadCount(thread: Thread): number {
  const state = load()
  const seen = state[thread.id] ?? 0
  return Math.max(0, thread.messages.length - seen)
}

/** Compute unread counts for a list of threads. Returns a map of threadId → count. */
export function getUnreadCounts(threads: Thread[]): Record<string, number> {
  const state = load()
  const result: Record<string, number> = {}
  for (const thread of threads) {
    const seen = state[thread.id] ?? 0
    result[thread.id] = Math.max(0, thread.messages.length - seen)
  }
  return result
}
