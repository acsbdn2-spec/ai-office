import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import ACSLogo from '../../components/UI/ACSLogo'

const DEMO_ACCOUNTS = [
  { label: 'Admin',      email: 'admin@demo.com',      role: 'Full access + profit view' },
  { label: 'Sales',      email: 'sales@demo.com',       role: 'Quotes, clients, renewals' },
  { label: 'Telecaller', email: 'telecaller@demo.com',  role: 'Call queue + logging' },
  { label: 'Support',    email: 'support@demo.com',     role: 'Tickets only' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) setError(err.message)
    else navigate('/call')
  }

  const quickLogin = async (demoEmail) => {
    setLoading(true)
    setError('')
    const { error: err } = await signIn(demoEmail, 'demo1234')
    setLoading(false)
    if (err) setError(err.message)
    else navigate('/call')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <ACSLogo size={72} />
          <div className="text-center">
            <h1 className="text-xl font-bold text-text-primary">Advanced Computer System</h1>
            <p className="text-text-muted text-sm mt-0.5">Burdwan, West Bengal · Est. 1995</p>
          </div>
          <p className="text-accent font-semibold text-sm tracking-wide uppercase">Business Suite</p>
        </div>

        {/* Demo quick-access */}
        <div className="card p-4 border-accent/20 bg-accent/5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} className="text-accent" />
            <p className="text-accent text-xs font-bold uppercase tracking-wide">Demo — no setup needed</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(a => (
              <button
                key={a.email}
                onClick={() => quickLogin(a.email)}
                disabled={loading}
                className="bg-surface border border-border rounded-lg px-3 py-2.5 text-left hover:border-accent/50 transition-colors disabled:opacity-50"
              >
                <p className="text-text-primary text-xs font-bold">{a.label}</p>
                <p className="text-text-muted text-[10px] mt-0.5 leading-tight">{a.role}</p>
              </button>
            ))}
          </div>
          <p className="text-text-muted text-[10px] text-center mt-2.5">Password for all demo accounts: <span className="font-mono text-text-secondary">demo1234</span></p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted text-xs">or sign in with your account</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={submit} className="card p-5 space-y-4">
          <div>
            <label className="text-text-secondary text-xs font-medium mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="staff@acsbdn.com"
                className="input pl-9"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="text-text-secondary text-xs font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-9 pr-10"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !email || !password} className="btn-primary w-full h-11 disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-text-muted text-xs">
          acsbdn@gmail.com · +91 81700 18080
        </p>
      </div>
    </div>
  )
}
