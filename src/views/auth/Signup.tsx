import { memo, useState } from 'react'
import { PenLine, Check } from '../../icons'
import { useAuth } from '../../context/AuthContext'
import GoogleAuthButton from '../../components/GoogleAuthButton'
import AsyncActionLabel from '../../components/AsyncActionLabel'
import type { UserRole } from '../../lib/database.types'

interface Props {
  onGoToLogin: () => void
}

const roles: { id: UserRole; label: string; desc: string }[] = [
  { id: 'writer', label: 'Writer', desc: 'Script, story, dialogue' },
  { id: 'artist', label: 'Artist', desc: 'Pencils, inking, panels' },
  { id: 'colorist', label: 'Colorist', desc: 'Colors and palettes' },
  { id: 'letterer', label: 'Letterer', desc: 'Bubbles and typography' },
]

function Signup({ onGoToLogin }: Props) {
  const { signUp, signInWithGoogle } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('writer')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError(null)
    setLoading(true)
    const err = await signUp(email, password, name, role)
    setLoading(false)
    if (err) setError(err)
    else setDone(true)
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setGoogleLoading(true)
    const err = await signInWithGoogle()
    if (err) {
      setError(err)
      setGoogleLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-ink-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-ink-gold/20 border border-ink-gold/40 flex items-center justify-center mx-auto mb-5">
            <Check size={22} className="text-ink-gold" />
          </div>
          <h2 className="font-serif text-xl text-ink-light mb-2">Check your inbox</h2>
          <p className="text-sm text-ink-text font-sans leading-relaxed mb-6">
            We sent a confirmation link to <span className="text-ink-light">{email}</span>. Click it to activate your account.
          </p>
          <button onClick={onGoToLogin} className="text-xs text-ink-gold font-sans hover:text-ink-gold-dim transition-colors">
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-ink-gold flex items-center justify-center">
            <PenLine size={18} className="text-ink-black" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-2xl text-ink-light tracking-wide">Inkline</span>
        </div>

        <div className="bg-ink-dark border border-ink-border rounded-xl p-8">
          <h1 className="font-serif text-xl text-ink-light mb-1">Create your account</h1>
          <p className="text-xs text-ink-text font-sans mb-6">Join Inkline and start building your comic.</p>

          {/* Google OAuth */}
          <GoogleAuthButton
            onClick={handleGoogleSignUp}
            loading={googleLoading}
            disabled={googleLoading || loading}
            mode="signup"
          />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-ink-border" />
            <span className="text-[10px] uppercase tracking-widest text-ink-muted font-sans">or</span>
            <div className="flex-1 h-px bg-ink-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-ink-panel border border-ink-border rounded-lg px-3 py-2.5 text-sm font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/60 transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-ink-panel border border-ink-border rounded-lg px-3 py-2.5 text-sm font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/60 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-ink-panel border border-ink-border rounded-lg px-3 py-2.5 text-sm font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/60 transition-colors"
                placeholder="Min. 6 characters"
              />
            </div>

            {/* Role picker */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                      role === r.id
                        ? 'border-ink-gold/60 bg-ink-gold/10 text-ink-light'
                        : 'border-ink-border bg-ink-panel text-ink-text hover:border-ink-gold/30'
                    }`}
                  >
                    <div className="text-xs font-sans font-medium">{r.label}</div>
                    <div className="text-[10px] font-sans text-ink-muted mt-0.5">{r.desc}</div>
                    {role === r.id && (
                      <div className="w-3 h-3 rounded-full bg-ink-gold flex items-center justify-center mt-1.5">
                        <Check size={8} className="text-ink-black" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-sans bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-ink-gold text-ink-black font-sans font-semibold text-sm rounded-lg py-2.5 hover:bg-ink-gold-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <AsyncActionLabel loading={loading} idleLabel="Create Account" loadingLabel="Creating account…" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-text font-sans mt-5">
          Already have an account?{' '}
          <button onClick={onGoToLogin} className="text-ink-gold hover:text-ink-gold-dim transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default memo(Signup)
