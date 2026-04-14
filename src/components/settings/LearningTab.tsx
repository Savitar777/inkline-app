import { memo, useState } from 'react'
import { useTutorial } from '../../context/TutorialContext'
import { TUTORIAL_MODULES } from '../../data/tutorials/modules'
import type { TutorialDifficulty } from '../../data/tutorials/types'

function LearningTab() {
  const { completedModuleIds, tipsEnabled, difficulty, setTipsEnabled, setDifficulty, resetProgress } = useTutorial()
  const [confirmReset, setConfirmReset] = useState(false)

  const totalModules = TUTORIAL_MODULES.length
  const completedCount = completedModuleIds.size

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Progress</span>
        <div className="rounded-lg border border-ink-border bg-ink-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-sans text-ink-text">{completedCount} of {totalModules} modules completed</span>
            <span className="text-xs font-mono text-ink-gold">{totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink-dark overflow-hidden">
            <div
              className="h-full rounded-full bg-ink-gold transition-all"
              style={{ width: `${totalModules > 0 ? (completedCount / totalModules) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contextual Tips */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Contextual Tips</span>
        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-ink-border bg-ink-panel cursor-pointer">
          <input
            type="checkbox"
            checked={tipsEnabled}
            onChange={e => setTipsEnabled(e.target.checked)}
            className="rounded border-ink-border accent-ink-gold"
          />
          <div>
            <p className="text-xs font-sans text-ink-text">Show contextual tips</p>
            <p className="text-[10px] text-ink-muted font-sans mt-0.5">Inline hints when you first visit views or reach milestones</p>
          </div>
        </label>
      </div>

      {/* Content Depth */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Content Depth</span>
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'advanced'] as TutorialDifficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-sans border transition-colors capitalize ${
                difficulty === d
                  ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                  : 'text-ink-muted border-ink-border hover:text-ink-text'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-ink-muted font-sans mt-1.5 px-1">
          {difficulty === 'beginner' && 'Show all modules. Beginner modules are highlighted.'}
          {difficulty === 'intermediate' && 'Show all modules. Skip beginner-only introductions.'}
          {difficulty === 'advanced' && 'Show all modules. Focus on advanced techniques.'}
        </p>
      </div>

      {/* Reset */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Reset</span>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-3 py-2 rounded-lg text-xs font-sans border border-ink-border text-ink-muted hover:text-ink-text hover:border-ink-gold/20 transition-colors"
          >
            Reset tutorial progress
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-text font-sans">Clear all progress?</span>
            <button
              onClick={() => { resetProgress(); setConfirmReset(false) }}
              className="px-3 py-1.5 rounded text-xs font-sans bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 rounded text-xs font-sans text-ink-muted hover:text-ink-text transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(LearningTab)
