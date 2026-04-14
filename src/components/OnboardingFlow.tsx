/* eslint-disable react-refresh/only-export-components */
import { memo, useState } from 'react'
import { PenLine, BookOpen, MessageSquare, Layers, ArrowRight, Check } from '../icons'

const ONBOARDING_KEY = 'inkline:onboarding-complete'

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === '1'
}

function completeOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, '1')
}

interface Step {
  icon: React.ReactNode
  title: string
  body: string
}

const steps: Step[] = [
  {
    icon: <PenLine size={28} className="text-ink-gold" />,
    title: 'Welcome to Inkline',
    body: 'Your collaborative workspace for creating comics, manga, and webtoons. Write scripts, coordinate with artists, and compile finished pages — all in one place.',
  },
  {
    icon: <BookOpen size={28} className="text-ink-gold" />,
    title: 'Script Editor',
    body: 'Start by creating episodes, pages, and panels. Write dialogue, narration, and sound effects for each panel. Add shot descriptions so your artist knows exactly what to draw.',
  },
  {
    icon: <MessageSquare size={28} className="text-ink-gold" />,
    title: 'Collaboration',
    body: 'Submit pages to your artist for review. Track progress with threads, exchange feedback, and upload artwork — all in a dedicated collaboration space.',
  },
  {
    icon: <Layers size={28} className="text-ink-gold" />,
    title: 'Compile & Export',
    body: 'Review submitted artwork, approve or request changes, and export your finished project in multiple formats: Webtoon strips, print-ready pages, PDF, or web bundles.',
  },
]

interface Props {
  onComplete: () => void
}

function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      completeOnboarding()
      onComplete()
    } else {
      setStep(s => s + 1)
    }
  }

  const handleSkip = () => {
    completeOnboarding()
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink-black/90 px-4">
      <div className="w-full max-w-md rounded-2xl border border-ink-border bg-ink-dark shadow-2xl ink-stage-enter">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-ink-gold' : i < step ? 'w-1.5 bg-ink-gold/50' : 'w-1.5 bg-ink-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-ink-gold/20 bg-ink-gold/10">
            {current.icon}
          </div>
          <h2 className="font-serif text-xl text-ink-light mb-3">{current.title}</h2>
          <p className="text-sm text-ink-text font-sans leading-relaxed">{current.body}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-ink-border px-6 py-4">
          <button
            onClick={handleSkip}
            className="text-xs text-ink-muted hover:text-ink-text transition-colors font-sans"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-lg bg-ink-gold px-4 py-2 text-sm font-sans font-semibold text-ink-black hover:bg-ink-gold-dim transition-colors"
          >
            {isLast ? (
              <>
                Get Started <Check size={14} />
              </>
            ) : (
              <>
                Next <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(OnboardingFlow)
