import { useState } from 'react'
import { AlertCircle, Check } from '../../icons'
import { useAuth } from '../../context/AuthContext'
import ProfileAvatar from '../ProfileAvatar'

interface ProfileTabProps {
  status: { tone: 'success' | 'error'; message: string } | null
  setStatus: (status: { tone: 'success' | 'error'; message: string } | null) => void
}

export default function ProfileTab({ status, setStatus }: ProfileTabProps) {
  const { profile, updateProfile } = useAuth()
  const [nameDraft, setNameDraft] = useState(profile?.name ?? '')
  const [avatarDraft, setAvatarDraft] = useState(profile?.avatar_url ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

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

  return (
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
              <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-muted font-sans flex items-center gap-1.5">
                {profile.role}
                {profile.role === 'admin' && (
                  <span className="text-[9px] text-ink-gold bg-ink-gold/10 border border-ink-gold/20 rounded px-1 py-px">Admin</span>
                )}
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
          {savingProfile ? 'Saving\u2026' : 'Save profile'}
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
  )
}
