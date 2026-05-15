import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, FileText, RefreshCcw, Users, Headphones, Ticket, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePin } from '../../contexts/PinContext'
import PinModal from '../../components/UI/PinModal'
import { supabase } from '../../lib/supabase'
import { useDemoData } from '../../contexts/DemoDataContext'
import { format, differenceInDays } from 'date-fns'

function ClockWidget() {
  const [time, setTime] = useState(new Date())
  const [taps, setTaps] = useState(0)
  const [pinOpen, setPinOpen] = useState(false)
  const { profitUnlocked, lock } = usePin()
  const tapTimer = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDoubleTap = () => {
    setTaps(t => {
      const next = t + 1
      if (next >= 2) {
        clearTimeout(tapTimer.current)
        setPinOpen(true)
        return 0
      }
      tapTimer.current = setTimeout(() => setTaps(0), 400)
      return next
    })
  }

  return (
    <>
      <div
        onDoubleClick={handleDoubleTap}
        onClick={handleDoubleTap}
        className="card p-5 text-center cursor-pointer select-none hover:border-accent/30 transition-colors relative"
      >
        <p className="text-4xl font-mono font-bold text-text-primary tracking-tight">
          {format(time, 'HH:mm:ss')}
        </p>
        <p className="text-text-muted text-sm mt-1">{format(time, 'EEEE, dd MMMM yyyy')}</p>
        {profitUnlocked && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/15 border border-green-500/30 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-green-400 text-[10px] font-semibold">PROFIT UNLOCKED</span>
          </div>
        )}
      </div>
      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} />
    </>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, canAccess } = useAuth()
  const { db, isDemo } = useDemoData()
  const [stats, setStats] = useState({ urgent: 0, expiring: 0, openTickets: 0, totalClients: 0 })

  useEffect(() => {
    const fetch = async () => {
      if (isDemo) {
        const today = new Date()
        const in30 = new Date(Date.now() + 30 * 86400000)
        const clients = db.getClients({ notNullExpiry: true })
        const tickets = db.getTickets({ statuses: ['open', 'in_progress'] })
        const allClients = db.getClients({})
        const urgent  = clients.filter(c => c.expiry_date && differenceInDays(new Date(c.expiry_date), today) < 0).length
        const expiring = clients.filter(c => {
          const d = differenceInDays(new Date(c.expiry_date), today)
          return d >= 0 && d <= 30
        }).length
        setStats({ urgent, expiring, openTickets: tickets.length, totalClients: allClients.length })
        return
      }
      const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]

      const [{ count: urgentC }, { count: expiringC }, { count: ticketsC }, { count: totalC }] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }).lt('expiry_date', today),
        supabase.from('clients').select('id', { count: 'exact', head: true }).gte('expiry_date', today).lte('expiry_date', in30),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
      ])

      setStats({ urgent: urgentC || 0, expiring: expiringC || 0, openTickets: ticketsC || 0, totalClients: totalC || 0 })
    }
    fetch()
  }, [isDemo])

  const quickActions = [
    { label: 'Call Mode', icon: Zap, to: '/call', module: 'callmode', color: 'text-accent', desc: 'Start a sales call' },
    { label: 'New Quote', icon: FileText, to: '/quote', module: 'quotebuilder', color: 'text-blue-400', desc: 'Build a quote' },
    { label: 'Renewals', icon: RefreshCcw, to: '/renewals', module: 'renewals', color: 'text-amber-400', desc: `${stats.urgent + stats.expiring} need attention` },
    { label: 'Clients', icon: Users, to: '/clients', module: 'clients', color: 'text-green-400', desc: `${stats.totalClients} total` },
    { label: 'Calls', icon: Headphones, to: '/calls', module: 'telecalling', color: 'text-purple-400', desc: 'Telecalling queue' },
    { label: 'Tickets', icon: Ticket, to: '/tickets', module: 'tickets', color: 'text-pink-400', desc: `${stats.openTickets} open` },
  ].filter(a => canAccess(a.module))

  return (
    <div className="min-h-screen bg-bg px-4 py-5">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Advanced Computer System · Burdwan</p>
        </div>

        <ClockWidget />

        {/* Alert strip */}
        {(stats.urgent > 0 || stats.expiring > 0) && (
          <button onClick={() => navigate('/renewals')} className="card p-4 w-full text-left border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-colors">
            <div className="flex items-center gap-3">
              <RefreshCcw size={16} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-amber-400 font-semibold text-sm">
                  {stats.urgent > 0 && `${stats.urgent} expired`}
                  {stats.urgent > 0 && stats.expiring > 0 && ' · '}
                  {stats.expiring > 0 && `${stats.expiring} expiring ≤30 days`}
                </p>
                <p className="text-text-muted text-xs">Tap to view renewals</p>
              </div>
            </div>
          </button>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, icon: Icon, to, color, desc }) => (
            <button key={to} onClick={() => navigate(to)} className="card p-4 text-left hover:border-accent/30 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color.replace('text-', 'bg-').replace('400', '500/15')}`}>
                <Icon size={17} className={color} />
              </div>
              <p className="text-text-primary font-semibold text-sm">{label}</p>
              <p className="text-text-muted text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        <div className="text-center py-2">
          <p className="text-text-muted text-xs">acsbdn@gmail.com · +91 81700 18080 · advancedcomputersystem.in</p>
        </div>
      </div>
    </div>
  )
}
