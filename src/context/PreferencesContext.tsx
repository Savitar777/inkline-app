/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { resolvePlatformMode, type ResolvedPlatformMode } from '../domain/platform'
import type { PlatformMode, WorkspaceView } from '../types/preferences'

export interface Preferences {
  defaultView: WorkspaceView
  rememberLastView: boolean
  lastView: WorkspaceView
  compactDashboard: boolean
  platformMode: PlatformMode
}

interface PreferencesContextType {
  preferences: Preferences
  updatePreferences: (updates: Partial<Preferences>) => void
  resetPreferences: () => void
}

const STORAGE_KEY = 'inkline-user-preferences'

function isWorkspaceView(value: unknown): value is WorkspaceView {
  return value === 'editor' || value === 'collab' || value === 'compile'
}

function isPlatformMode(value: unknown): value is PlatformMode {
  return value === 'auto' || value === 'mac' || value === 'windows'
}

const defaultPreferences: Preferences = {
  defaultView: 'editor',
  rememberLastView: true,
  lastView: 'editor',
  compactDashboard: false,
  platformMode: 'auto',
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

function loadPreferences(): Preferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultPreferences

    const parsed = JSON.parse(saved) as Partial<Preferences>
    const merged = {
      ...defaultPreferences,
      ...parsed,
    }

    return {
      ...merged,
      defaultView: isWorkspaceView(merged.defaultView) ? merged.defaultView : defaultPreferences.defaultView,
      lastView: isWorkspaceView(merged.lastView) ? merged.lastView : defaultPreferences.lastView,
      platformMode: isPlatformMode(merged.platformMode) ? merged.platformMode : defaultPreferences.platformMode,
    }
  } catch {
    return defaultPreferences
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const updatePreferences = (updates: Partial<Preferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}

export function useResolvedPlatformMode(): ResolvedPlatformMode {
  const { preferences } = usePreferences()
  return resolvePlatformMode(preferences.platformMode)
}
