import { memo, useState } from 'react'
import { PenLine } from '../../icons'
import { useAuth } from '../../context/AuthContext'
import GoogleAuthButton from '../../components/GoogleAuthButton'

interface Props {
  onGoToSignup: () => void
}

function Login({ onGoToSignup }: Props) {
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signIn(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    const err = await signInWithGoogle()
    if (err) {
      setError(err)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-ink-gold flex items-center justify-center">
            <PenLine size={18} className="text-ink-black" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-2xl text-ink-light tracking-wide">Inkline</span>
        </div>

        <div className="bg-ink-dark border border-ink-border rounded-xl p-8">
          <h1 className="font-serif text-xl text-ink-light mb-1">Welcome back</h1>
          <p className="text-xs text-ink-text font-sans mb-6">Sign in to continue to your projects.</p>

          {/* Google OAuth */}
          <GoogleAuthButton
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            disabled={googleLoading || loading}
            mode="signin"
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
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">
                Email
              </label>
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
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-sans mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-ink-panel border border-ink-border rounded-lg px-3 py-2.5 text-sm font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/60 transition-colors"
                placeholder="••••••••"
              />
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
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-text font-sans mt-5">
          No account?{' '}
          <button onClick={onGoToSignup} className="text-ink-gold hover:text-ink-gold-dim transition-colors">
            Create one
          </button>
        </p>
      </div>
    </div>
  )
}

export default memo(Login)
