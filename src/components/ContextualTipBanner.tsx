import { useEffect, useMemo } from 'react'
import { X, ArrowRight } from '../icons'
import { CONTEXTUAL_TIPS } from '../data/tutorials/tips'
import { useTutorial } from '../context/TutorialContext'

interface ContextualTipBannerProps {
  view: string
  onNavigateToModule?: (moduleId: string) => void
}

export default function ContextualTipBanner({ view, onNavigateToModule }: ContextualTipBannerProps) {
  const { isTipVisible, dismissTip, markViewVisited } = useTutorial()

  // Mark view as visited after a short delay (so first-use tips show once)
  useEffect(() => {
    const timer = window.setTimeout(() => markViewVisited(view), 2000)
    return () => window.clearTimeout(timer)
  }, [view, markViewVisited])

  const visibleTip = useMemo(
    () => CONTEXTUAL_TIPS.find(tip => isTipVisible(tip, view)) ?? null,
    [view, isTipVisible],
  )

  if (!visibleTip) return null

  return (
    <div className="mx-6 mb-3 ink-stage-enter">
      <div className="flex items-start gap-3 rounded-lg border border-ink-gold/20 bg-ink-gold/5 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-sans font-medium text-ink-gold">{visibleTip.title}</p>
          <p className="text-[11px] font-sans text-ink-text mt-0.5">{visibleTip.body}</p>
          {visibleTip.learnMoreModuleId && onNavigateToModule && (
            <button
              type="button"
              onClick={() => onNavigateToModule(visibleTip.learnMoreModuleId!)}
              className="flex items-center gap-1 mt-1.5 text-[10px] font-sans text-ink-gold hover:text-ink-gold-dim transition-colors"
            >
              Learn more <ArrowRight size={10} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => dismissTip(visibleTip.id)}
          className="p-0.5 rounded text-ink-muted hover:text-ink-text transition-colors shrink-0"
          aria-label="Dismiss tip"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
