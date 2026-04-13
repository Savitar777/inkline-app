import type { ReactNode } from 'react'
import { PenLine, MessageSquare, Layers } from '../../icons'
import { usePreferences, useResolvedPlatformMode } from '../../context/PreferencesContext'
import { formatShortcut, getPlatformModeLabel } from '../../domain/platform'
import type { PlatformMode, ThemeMode, WorkspaceView } from '../../types/preferences'

const viewOptions: { id: WorkspaceView; label: string; helper: string; icon: ReactNode }[] = [
  {
    id: 'editor',
    label: 'Script Editor',
    helper: 'Draft pages, panels, and dialogue first',
    icon: <PenLine size={14} />,
  },
  {
    id: 'collab',
    label: 'Collaboration',
    helper: 'Jump straight into feedback and handoff',
    icon: <MessageSquare size={14} />,
  },
  {
    id: 'compile',
    label: 'Compile & Export',
    helper: 'Open with layouts and export tools ready',
    icon: <Layers size={14} />,
  },
]

const platformOptions: { id: PlatformMode; label: string; helper: string }[] = [
  {
    id: 'auto',
    label: 'Auto Detect',
    helper: 'Read the current device and swap shortcut hints automatically.',
  },
  {
    id: 'mac',
    label: 'Mac Mode',
    helper: 'Use Command-based keyboard hints and matching primary shortcuts.',
  },
  {
    id: 'windows',
    label: 'Windows Mode',
    helper: 'Use Control-based keyboard hints and matching primary shortcuts.',
  },
]

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-ink-border bg-ink-panel px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-ink-light font-sans">{title}</p>
        <p className="text-xs text-ink-text font-sans mt-1 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-ink-gold' : 'bg-ink-muted/40'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink-black transition-all ${
            checked ? 'left-5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export default function WorkspaceTab() {
  const { preferences, updatePreferences } = usePreferences()
  const resolvedPlatformMode = useResolvedPlatformMode()

  return (
    <section className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-ink-gold font-sans mb-2">Workspace</p>
        <h3 className="font-serif text-2xl text-ink-light">How Inkline behaves</h3>
        <p className="text-sm text-ink-text font-sans mt-2 leading-relaxed max-w-2xl">
          These preferences are saved locally and change the way your workspace opens and how shortcut hints
          are presented on this machine.
        </p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-2">Default project view</p>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {viewOptions.map(option => (
            <button
              key={option.id}
              onClick={() => updatePreferences({ defaultView: option.id })}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                preferences.defaultView === option.id
                  ? 'border-ink-gold/40 bg-ink-gold/10'
                  : 'border-ink-border bg-ink-panel hover:border-ink-gold/20'
              }`}
            >
              <div className="flex items-center gap-2 text-sm text-ink-light font-sans">
                {option.icon}
                <span>{option.label}</span>
              </div>
              <p className="text-xs text-ink-text font-sans mt-2 leading-relaxed">{option.helper}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-ink-muted font-sans">Theme</p>
        <p className="mt-2 text-sm text-ink-text font-sans leading-relaxed max-w-2xl">
          Choose between dark and light modes, or follow your system setting.
        </p>
        <div className="mt-3 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
          {([
            { id: 'dark' as ThemeMode, label: 'Dark' },
            { id: 'light' as ThemeMode, label: 'Light' },
            { id: 'system' as ThemeMode, label: 'System' },
          ]).map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => updatePreferences({ theme: option.id })}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                preferences.theme === option.id
                  ? 'border-ink-gold/40 bg-ink-gold/10'
                  : 'border-ink-border bg-ink-panel hover:border-ink-gold/20'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-light font-sans">{option.label}</span>
                {preferences.theme === option.id && (
                  <span className="rounded-full bg-ink-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-gold">
                    Active
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wider text-ink-muted font-sans">Keyboard mode</p>
          <span className="rounded-full border border-ink-border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            Current device: {getPlatformModeLabel(resolvedPlatformMode)}
          </span>
        </div>
        <p className="mt-2 text-sm text-ink-text font-sans leading-relaxed max-w-2xl">
          Inkline can detect the current device automatically or stay pinned to Mac or Windows shortcut
          conventions. This updates the search hint, command palette labels, and the primary modifier key the
          app listens for.
        </p>
        <div className="mt-3 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {platformOptions.map(option => {
            const previewMode = option.id === 'auto' ? resolvedPlatformMode : option.id

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => updatePreferences({ platformMode: option.id })}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  preferences.platformMode === option.id
                    ? 'border-ink-gold/40 bg-ink-gold/10'
                    : 'border-ink-border bg-ink-panel hover:border-ink-gold/20'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink-light font-sans">{option.label}</span>
                  {preferences.platformMode === option.id && (
                    <span className="rounded-full bg-ink-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-gold">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-ink-text font-sans leading-relaxed">{option.helper}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted font-sans">
                  Search {formatShortcut(previewMode, ['primary', 'k'])}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <ToggleRow
        title="Remember the last open view"
        description="When enabled, Inkline reopens the most recent workspace instead of the default tab."
        checked={preferences.rememberLastView}
        onToggle={() => updatePreferences({ rememberLastView: !preferences.rememberLastView })}
      />

      <ToggleRow
        title="Compact project dashboard"
        description="Tighten dashboard card spacing so you can scan more projects at once."
        checked={preferences.compactDashboard}
        onToggle={() => updatePreferences({ compactDashboard: !preferences.compactDashboard })}
      />

      <div>
        <p className="text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-2">Keyboard shortcuts</p>
        <p className="text-sm text-ink-text font-sans leading-relaxed max-w-2xl mb-3">
          Global shortcuts available throughout the workspace.
        </p>
        <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {([
            { keys: ['primary', 'k'], label: 'Search / Command Palette' },
            { keys: ['primary', 'z'], label: 'Undo' },
            { keys: ['primary', 'shift', 'z'], label: 'Redo' },
            { keys: ['primary', 'e'], label: 'New Episode' },
            { keys: ['primary', 'shift', 'p'], label: 'New Page' },
            { keys: ['primary', 'shift', 'n'], label: 'New Panel' },
            { keys: ['primary', 'enter'], label: 'Submit to Artist' },
            { keys: ['primary', 'shift', 'a'], label: 'Approve Next Reviewable' },
            { keys: ['primary', 'shift', 'r'], label: 'Request Changes (Next)' },
          ] as { keys: string[]; label: string }[]).map(shortcut => (
            <div key={shortcut.label} className="flex items-center justify-between rounded-xl border border-ink-border bg-ink-panel px-3.5 py-2.5">
              <span className="text-xs text-ink-text font-sans">{shortcut.label}</span>
              <kbd className="rounded border border-ink-border bg-ink-black/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-muted font-mono">
                {formatShortcut(resolvedPlatformMode, shortcut.keys)}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
