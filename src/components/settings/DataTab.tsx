import { memo, useRef } from 'react'
import { Download, Upload, AlertCircle, Check } from '../../icons'
import { useAuth } from '../../context/AuthContext'
import { usePreferences } from '../../context/PreferencesContext'
import { isSupabaseConfigured } from '../../lib/supabase'

interface ProjectActions {
  title: string
  onExport: () => void
  onImport: (json: string) => void
}

interface DataTabProps {
  projectActions?: ProjectActions
  status: { tone: 'success' | 'error'; message: string } | null
  setStatus: (status: { tone: 'success' | 'error'; message: string } | null) => void
}

function DataTab({ projectActions, status, setStatus }: DataTabProps) {
  const { user, signOut } = useAuth()
  const { resetPreferences } = usePreferences()
  const importRef = useRef<HTMLInputElement>(null)

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !projectActions) return

    const reader = new FileReader()
    reader.onload = loadEvent => {
      projectActions.onImport(loadEvent.target?.result as string)
      setStatus({ tone: 'success', message: `Imported backup into ${projectActions.title}.` })
    }
    reader.onerror = () => {
      setStatus({ tone: 'error', message: 'That backup could not be read.' })
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
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
  )
}

export default memo(DataTab)
