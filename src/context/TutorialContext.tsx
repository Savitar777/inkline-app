import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { ContextualTip } from '../data/tutorials/types'
import type { TutorialDifficulty } from '../data/tutorials/types'

const STORAGE_KEY = 'inkline:tutorial'

interface TutorialState {
  completedModuleIds: string[]
  dismissedTipIds: string[]
  visitedViews: string[]
  tipsEnabled: boolean
  difficulty: TutorialDifficulty
}

const DEFAULT_STATE: TutorialState = {
  completedModuleIds: [],
  dismissedTipIds: [],
  visitedViews: [],
  tipsEnabled: true,
  difficulty: 'beginner',
}

function loadState(): TutorialState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATE }
}

function saveState(state: TutorialState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

interface TutorialContextValue {
  completedModuleIds: Set<string>
  dismissedTipIds: Set<string>
  tipsEnabled: boolean
  difficulty: TutorialDifficulty
  markModuleComplete: (id: string) => void
  markModuleIncomplete: (id: string) => void
  dismissTip: (id: string) => void
  markViewVisited: (view: string) => void
  setTipsEnabled: (v: boolean) => void
  setDifficulty: (d: TutorialDifficulty) => void
  resetProgress: () => void
  isTipVisible: (tip: ContextualTip, currentView: string) => boolean
}

const TutorialContext = createContext<TutorialContextValue | null>(null)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TutorialState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const completedSet = new Set(state.completedModuleIds)
  const dismissedSet = new Set(state.dismissedTipIds)
  const visitedSet = new Set(state.visitedViews)

  const markModuleComplete = useCallback((id: string) => {
    setState(prev => prev.completedModuleIds.includes(id)
      ? prev
      : { ...prev, completedModuleIds: [...prev.completedModuleIds, id] }
    )
  }, [])

  const markModuleIncomplete = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      completedModuleIds: prev.completedModuleIds.filter(m => m !== id),
    }))
  }, [])

  const dismissTip = useCallback((id: string) => {
    setState(prev => prev.dismissedTipIds.includes(id)
      ? prev
      : { ...prev, dismissedTipIds: [...prev.dismissedTipIds, id] }
    )
  }, [])

  const markViewVisited = useCallback((view: string) => {
    setState(prev => prev.visitedViews.includes(view)
      ? prev
      : { ...prev, visitedViews: [...prev.visitedViews, view] }
    )
  }, [])

  const setTipsEnabled = useCallback((v: boolean) => {
    setState(prev => ({ ...prev, tipsEnabled: v }))
  }, [])

  const setDifficulty = useCallback((d: TutorialDifficulty) => {
    setState(prev => ({ ...prev, difficulty: d }))
  }, [])

  const resetProgress = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedModuleIds: [],
      dismissedTipIds: [],
      visitedViews: [],
    }))
  }, [])

  const isTipVisible = useCallback((tip: ContextualTip, currentView: string): boolean => {
    if (!state.tipsEnabled) return false
    if (dismissedSet.has(tip.id)) return false
    if (tip.view !== currentView) return false

    // first-use tips: only show on first visit to the view
    if (tip.trigger === 'first-use') {
      return !visitedSet.has(currentView)
    }

    return true
  }, [state.tipsEnabled, dismissedSet, visitedSet])

  return (
    <TutorialContext value={{
      completedModuleIds: completedSet,
      dismissedTipIds: dismissedSet,
      tipsEnabled: state.tipsEnabled,
      difficulty: state.difficulty,
      markModuleComplete,
      markModuleIncomplete,
      dismissTip,
      markViewVisited,
      setTipsEnabled,
      setDifficulty,
      resetProgress,
      isTipVisible,
    }}>
      {children}
    </TutorialContext>
  )
}

export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext)
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider')
  return ctx
}
