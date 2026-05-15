import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// ── Demo accounts (no Supabase needed) ────────────────────────────────────────
const DEMO_ACCOUNTS = {
  'admin@demo.com':       { id: 'demo-admin',       email: 'admin@demo.com',       full_name: 'Demo Admin',       role: 'admin',       is_active: true },
  'sales@demo.com':       { id: 'demo-sales',       email: 'sales@demo.com',       full_name: 'Demo Sales',       role: 'sales',       is_active: true },
  'telecaller@demo.com':  { id: 'demo-telecaller',  email: 'telecaller@demo.com',  full_name: 'Demo Telecaller',  role: 'telecaller',  is_active: true },
  'support@demo.com':     { id: 'demo-support',     email: 'support@demo.com',     full_name: 'Demo Support',     role: 'support',     is_active: true },
}
const DEMO_PASSWORD = 'demo1234'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    // Check demo first
    const demoProfile = Object.values(DEMO_ACCOUNTS).find(a => a.id === userId)
    if (demoProfile) { setProfile(demoProfile); return }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [])

  useEffect(() => {
    // Restore demo session from localStorage
    const demoId = localStorage.getItem('acs_demo_user')
    if (demoId) {
      const demoProfile = Object.values(DEMO_ACCOUNTS).find(a => a.id === demoId)
      if (demoProfile) {
        setUser({ id: demoId, email: demoProfile.email })
        setProfile(demoProfile)
        setLoading(false)
        return
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email, password) => {
    // Demo login — works offline, no Supabase needed
    const demoProfile = DEMO_ACCOUNTS[email.toLowerCase()]
    if (demoProfile && password === DEMO_PASSWORD) {
      localStorage.setItem('acs_demo_user', demoProfile.id)
      setUser({ id: demoProfile.id, email: demoProfile.email })
      setProfile(demoProfile)
      return { data: { user: demoProfile }, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    localStorage.removeItem('acs_demo_user')
    setUser(null)
    setProfile(null)
    await supabase.auth.signOut()
  }

  const isAdmin = profile?.role === 'admin'
  const isSales = profile?.role === 'sales'
  const isTelecaller = profile?.role === 'telecaller'
  const isSupport = profile?.role === 'support'

  const canAccess = (module) => {
    if (!profile) return false
    const role = profile.role
    const access = {
      callmode:      ['admin', 'sales'],
      quotebuilder:  ['admin', 'sales'],
      renewals:      ['admin', 'sales'],
      clients:       ['admin', 'sales'],
      telecalling:   ['admin', 'telecaller'],
      tickets:       ['admin', 'sales', 'telecaller', 'support'],
      admin:         ['admin'],
    }
    return access[module]?.includes(role) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isAdmin, isSales, isTelecaller, isSupport, canAccess, refreshProfile: () => user && fetchProfile(user.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
