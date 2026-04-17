import { memo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import Login from '../views/auth/Login'
import Signup from '../views/auth/Signup'
import LoadingSurface from './LoadingSurface'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [view, setView] = useState<'login' | 'signup'>('login')

  // Offline / demo mode — no Supabase configured, run locally with localStorage
  if (!isSupabaseConfigured) return <>{children}</>

  if (loading) {
    return <LoadingSurface variant="page" label="Loading account" lines={3} />
  }

  if (!user) {
    return view === 'login'
      ? <Login onGoToSignup={() => setView('signup')} />
      : <Signup onGoToLogin={() => setView('login')} />
  }

  return <>{children}</>
}

export default memo(AuthGuard)
