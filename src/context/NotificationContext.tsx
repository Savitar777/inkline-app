/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, useRef, type ReactNode } from 'react'

export type NotificationType = 'submission' | 'approval' | 'changes_requested' | 'message' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string
  read: boolean
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

const STORAGE_KEY = 'inkline:notifications'

function loadStored(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(items: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)))
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(loadStored)
  const counter = useRef(0)

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const item: Notification = {
      ...n,
      id: `notif-${Date.now()}-${counter.current++}`,
      read: false,
      timestamp: new Date().toLocaleString(),
    }
    setNotifications(prev => {
      const next = [item, ...prev].slice(0, 100)
      persist(next)
      return next
    })
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n)
      persist(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }))
      persist(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}
