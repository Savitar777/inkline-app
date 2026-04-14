import { useEffect, useState, type ReactNode } from 'react'
import { X, User, Layers, Download, BookOpen } from '../icons'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import ProfileAvatar from './ProfileAvatar'
import ProfileTab from './settings/ProfileTab'
import WorkspaceTab from './settings/WorkspaceTab'
import DataTab from './settings/DataTab'
import LearningTab from './settings/LearningTab'

type PanelTab = 'profile' | 'workspace' | 'data' | 'learning'

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
  {
    id: 'learning',
    label: 'Learning',
    description: 'Tutorial progress, tips, and content depth',
    icon: <BookOpen size={16} />,
  },
]

export default function SettingsPanel({ onClose, projectActions }: SettingsPanelProps) {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<PanelTab>('profile')
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onClose])

  if (!profile) return null

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
        className="absolute right-0 top-0 h-full w-full max-w-[48rem] border-l border-ink-border bg-ink-dark shadow-2xl xl:max-w-[50rem] animate-slide-up"
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
                  <p className="text-[11px] uppercase tracking-wider text-ink-muted font-sans mt-1 flex items-center gap-1.5">
                    {isSupabaseConfigured ? profile.role : 'offline demo'}
                    {profile.role === 'admin' && (
                      <span className="text-[9px] text-ink-gold bg-ink-gold/10 border border-ink-gold/20 rounded px-1 py-px">Admin</span>
                    )}
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
            {activeTab === 'profile' && <ProfileTab status={status} setStatus={setStatus} />}
            {activeTab === 'workspace' && <WorkspaceTab />}
            {activeTab === 'data' && (
              <DataTab projectActions={projectActions} status={status} setStatus={setStatus} />
            )}
            {activeTab === 'learning' && <LearningTab />}
          </div>
        </div>
      </aside>
    </div>
  )
}
