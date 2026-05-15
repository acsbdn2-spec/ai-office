import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [])

  useEffect(() => {
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
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
