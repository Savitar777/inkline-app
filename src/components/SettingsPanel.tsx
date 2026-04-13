import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X, User, Layers, Download, Upload, AlertCircle, Check, MessageSquare, PenLine } from '../icons'
import { useAuth } from '../context/AuthContext'
import { usePreferences, useResolvedPlatformMode } from '../context/PreferencesContext'
import { formatShortcut, getPlatformModeLabel } from '../domain/platform'
import { isSupabaseConfigured } from '../lib/supabase'
import ProfileAvatar from './ProfileAvatar'
import type { PlatformMode, ThemeMode, WorkspaceView } from '../types/preferences'

type PanelTab = 'profile' | 'workspace' | 'data'

interface ProjectActions {
  title: string
  onExport: () => void
  onImport: (json: string) => void
}

interface SettingsPanelProps {
  onClose: () => void
  projectActions?: ProjectActions
}

const tabMeta: { id: PanelTab; label: string; description: string; icon: ReactNode }[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Account identity and collaborator details',
    icon: <User size={16} />,
  },
  {
    id: 'workspace',
    label: 'Workspace',
    description: 'How Inkline opens and lays out your work',
    icon: <Layers size={16} />,
  },
  {
    id: 'data',
    label: 'Data',
    description: 'Backups, imports, and local preferences',
    icon: <Download size={16} />,
  },
]

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

export default function SettingsPanel({ onClose, projectActions }: SettingsPanelProps) {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { preferences, updatePreferences, resetPreferences } = usePreferences()
  const resolvedPlatformMode = useResolvedPlatformMode()
  const [activeTab, setActiveTab] = useState<PanelTab>('profile')
  const [nameDraft, setNameDraft] = useState(profile?.name ?? '')
  const [avatarDraft, setAvatarDraft] = useState(profile?.avatar_url ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onClose])

  if (!profile) return null

  const cleanAvatar = avatarDraft.trim()
  const isProfileDirty = nameDraft.trim() !== profile.name || (cleanAvatar || null) !== profile.avatar_url

  const handleProfileSave = async () => {
    if (!nameDraft.trim()) {
      setStatus({ tone: 'error', message: 'Display name cannot be empty.' })
      return
    }

    setSavingProfile(true)
    setStatus(null)

    const error = await updateProfile({
      name: nameDraft.trim(),
      avatar_url: cleanAvatar || null,
    })

    setSavingProfile(false)

    if (error) {
      setStatus({ tone: 'error', message: error })
      return
    }

    setStatus({ tone: 'success', message: 'Profile saved.' })
  }

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !projectActions) return

    const reader = new FileReader()
    reader.onload = loadEvent => {
      projectActions.onImport(loadEvent.target?.result as string)
      setStatus({ tone: 'success', message: `Imported backup into ${projectActions.title}.` })
      setActiveTab('data')
    }
    reader.onerror = () => {
      setStatus({ tone: 'error', message: 'That backup could not be read.' })
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close settings panel"
        className="absolute inset-0 bg-ink-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Profile and settings"
        className="absolute right-0 top-0 h-full w-full max-w-[48rem] border-l border-ink-border bg-ink-dark shadow-2xl xl:max-w-[50rem]"
      >
        <div className="grid h-full lg:grid-cols-[190px_minmax(0,1fr)]">
          <div className="border-b border-ink-border bg-ink-black/40 p-4 sm:p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between gap-3 lg:block">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-ink-gold font-sans mb-1">Settings</p>
                <h2 className="font-serif text-lg text-ink-light sm:text-xl">Your workspace</h2>
                <p className="mt-2 text-xs leading-relaxed text-ink-text font-sans">
                  Keep collaborator details current and tune how Inkline opens.
                </p>
              </div>
              <button
                aria-label="Close settings panel"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-border bg-ink-panel text-ink-text transition-colors hover:border-ink-gold/30 hover:text-ink-light"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-ink-gold/20 bg-ink-gold/5 p-3.5">
              <div className="flex items-center gap-3">
                <ProfileAvatar profile={profile} size="md" />
                <div className="min-w-0">
                  <p className="text-sm text-ink-light font-sans truncate">{profile.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-ink-muted font-sans mt-1">
                    {isSupabaseConfigured ? profile.role : 'offline demo'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-ink-text font-sans mt-3 truncate">{profile.email}</p>
            </div>

            <nav className="mt-4 space-y-2" aria-label="Settings sections">
              {tabMeta.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'border-ink-gold/40 bg-ink-gold/10 text-ink-light'
                      : 'border-ink-border bg-ink-panel text-ink-text hover:border-ink-gold/20 hover:text-ink-light'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-sans">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  <p className="text-[11px] font-sans mt-1.5 leading-relaxed">{tab.description}</p>
                </button>
              ))}
            </nav>
          </div>

          <div className="overflow-y-auto p-4 sm:p-5 lg:p-6">
            {activeTab === 'profile' && (
              <section className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-ink-gold font-sans mb-2">Profile</p>
                    <h3 className="font-serif text-2xl text-ink-light">Collaborator identity</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-text font-sans">
                      Update the public details teammates see in collaboration threads and project rosters.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-ink-border bg-ink-panel p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-start">
                      <ProfileAvatar
                        profile={{ name: nameDraft.trim() || profile.name, avatar_url: cleanAvatar || null }}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-ink-light font-sans">{nameDraft.trim() || profile.name}</p>
                        <p className="mt-1 truncate text-xs text-ink-text font-sans">{profile.email}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-muted font-sans">
                          {profile.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                  <label className="block">
                    <span className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">
                      Display name
                    </span>
                    <input
                      type="text"
                      value={nameDraft}
                      onChange={event => setNameDraft(event.target.value)}
                      className="w-full rounded-xl border border-ink-border bg-ink-panel px-3 py-2.5 text-sm text-ink-light font-sans outline-none transition-colors focus:border-ink-gold/60"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">
                      Email
                    </span>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full rounded-xl border border-ink-border bg-ink-black/30 px-3 py-2.5 text-sm text-ink-text font-sans"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">
                    Avatar URL
                  </span>
                  <input
                    type="url"
                    value={avatarDraft}
                    onChange={event => setAvatarDraft(event.target.value)}
                    className="w-full rounded-xl border border-ink-border bg-ink-panel px-3 py-2.5 text-sm text-ink-light font-sans outline-none transition-colors focus:border-ink-gold/60"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-ink-text font-sans mt-2">
                    Leave this blank to fall back to your initials.
                  </p>
                </label>

                <div className="rounded-xl border border-ink-border bg-ink-black/30 px-4 py-3">
                  <p className="text-sm text-ink-light font-sans">Role</p>
                  <p className="text-xs text-ink-text font-sans mt-1 leading-relaxed">
                    Your role is shown for clarity but stays read-only here. That matches the security hardening work
                    called out in the app plan so collaborators cannot self-promote inside the client.
                  </p>
                </div>

                {status && (
                  <div
                    className={`flex items-start gap-2 rounded-xl border px-4 py-3 ${
                      status.tone === 'success'
                        ? 'border-status-approved/30 bg-status-approved/10 text-status-approved'
                        : 'border-red-400/30 bg-red-400/10 text-red-400'
                    }`}
                  >
                    {status.tone === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    <p className="text-xs font-sans">{status.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleProfileSave}
                    disabled={!isProfileDirty || savingProfile}
                    className="rounded-xl bg-ink-gold px-4 py-2.5 text-sm font-semibold text-ink-black font-sans transition-colors hover:bg-ink-gold-dim disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving…' : 'Save profile'}
                  </button>
                  <button
                    onClick={() => {
                      setNameDraft(profile.name)
                      setAvatarDraft(profile.avatar_url ?? '')
                      setStatus(null)
                    }}
                    className="rounded-xl border border-ink-border px-4 py-2.5 text-sm text-ink-text font-sans hover:text-ink-light hover:border-ink-gold/20 transition-colors"
                  >
                    Reset changes
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'workspace' && (
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
            )}

            {activeTab === 'data' && (
              <section className="space-y-5">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-gold font-sans mb-2">Data</p>
                  <h3 className="font-serif text-2xl text-ink-light">Backups and session controls</h3>
                  <p className="text-sm text-ink-text font-sans mt-2 leading-relaxed max-w-2xl">
                    Export your current work, import a backup, or reset local workspace preferences without touching your projects.
                  </p>
                </div>

                <div className="rounded-2xl border border-ink-border bg-ink-panel p-5">
                  <p className="text-sm text-ink-light font-sans">Connection mode</p>
                  <p className="text-xs text-ink-text font-sans mt-2 leading-relaxed">
                    {isSupabaseConfigured
                      ? 'Supabase is connected, so profile changes sync to your account.'
                      : 'You are in offline demo mode, so profile and settings changes stay on this device.'}
                  </p>
                </div>

                {projectActions && (
                  <div className="rounded-2xl border border-ink-border bg-ink-panel p-5">
                    <p className="text-sm text-ink-light font-sans">Project backup</p>
                    <p className="text-xs text-ink-text font-sans mt-2 leading-relaxed">
                      Export or restore the project currently open in the editor.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={projectActions.onExport}
                        className="inline-flex items-center gap-2 rounded-xl bg-ink-gold px-4 py-2.5 text-sm font-semibold text-ink-black font-sans hover:bg-ink-gold-dim transition-colors"
                      >
                        <Download size={14} />
                        Export {projectActions.title}
                      </button>
                      <button
                        onClick={() => importRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl border border-ink-border px-4 py-2.5 text-sm text-ink-text font-sans hover:text-ink-light hover:border-ink-gold/20 transition-colors"
                      >
                        <Upload size={14} />
                        Import backup
                      </button>
                    </div>
                    <input
                      ref={importRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportProject}
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-ink-border bg-ink-panel p-5">
                  <p className="text-sm text-ink-light font-sans">Local preferences</p>
                  <p className="text-xs text-ink-text font-sans mt-2 leading-relaxed">
                    Reset layout preferences if you want Inkline to return to its default workspace behavior.
                  </p>
                  <button
                    onClick={() => {
                      resetPreferences()
                      setStatus({ tone: 'success', message: 'Workspace preferences reset.' })
                    }}
                    className="mt-4 rounded-xl border border-ink-border px-4 py-2.5 text-sm text-ink-text font-sans hover:text-ink-light hover:border-ink-gold/20 transition-colors"
                  >
                    Reset preferences
                  </button>
                </div>

                {user && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5">
                    <p className="text-sm text-ink-light font-sans">Session</p>
                    <p className="text-xs text-ink-text font-sans mt-2 leading-relaxed">
                      Sign out of your Inkline account on this device.
                    </p>
                    <button
                      onClick={signOut}
                      className="mt-4 rounded-xl border border-red-400/30 px-4 py-2.5 text-sm text-red-400 font-sans hover:bg-red-500/10 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}

                {status && (
                  <div
                    className={`flex items-start gap-2 rounded-xl border px-4 py-3 ${
                      status.tone === 'success'
                        ? 'border-status-approved/30 bg-status-approved/10 text-status-approved'
                        : 'border-red-400/30 bg-red-400/10 text-red-400'
                    }`}
                  >
                    {status.tone === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    <p className="text-xs font-sans">{status.message}</p>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
