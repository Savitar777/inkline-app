import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import Login from '../views/auth/Login'
import Signup from '../views/auth/Signup'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [view, setView] = useState<'login' | 'signup'>('login')

  // Offline / demo mode — no Supabase configured, run locally with localStorage
  if (!isSupabaseConfigured) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-ink-gold/20 border border-ink-gold/30 animate-pulse" />
          <span className="text-xs text-ink-muted font-sans">Loading…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return view === 'login'
      ? <Login onGoToSignup={() => setView('signup')} />
      : <Signup onGoToLogin={() => setView('login')} />
  }

  return <>{children}</>
}
