import { useState, useEffect } from 'react'
import { RefreshCcw, MessageSquare, FileText, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useDemoData } from '../../contexts/DemoDataContext'
import { formatINR } from '../../lib/products'
import { format, differenceInDays } from 'date-fns'
import { useNavigate } from 'react-router-dom'

function StatusBadge({ days }) {
  if (days === null) return <span className="badge-blue">No date</span>
  if (days < 0)   return <span className="badge-red">Expired {Math.abs(days)}d ago</span>
  if (days === 0) return <span className="badge-red">Expires today</span>
  if (days <= 30) return <span className="badge-amber">In {days}d</span>
  return <span className="badge-green">In {days}d</span>
}

export default function RenewalsDashboard() {
  const navigate = useNavigate()
  const { db, isDemo } = useDemoData()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      if (isDemo) {
        setClients(db.getClients({ notNullExpiry: true }))
      } else {
        const { data } = await supabase.from('clients').select('*').not('expiry_date', 'is', null).order('expiry_date', { ascending: true })
        setClients(data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [isDemo])

  const now = new Date()
  const enriched = clients.map(c => ({
    ...c,
    daysLeft: c.expiry_date ? differenceInDays(new Date(c.expiry_date), now) : null,
  })).sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999))

  const expired = enriched.filter(c => c.daysLeft !== null && c.daysLeft < 0)
  const urgent  = enriched.filter(c => c.daysLeft !== null && c.daysLeft >= 0 && c.daysLeft <= 30)
  const active  = enriched.filter(c => c.daysLeft !== null && c.daysLeft > 30)

  const filtered = enriched.filter(c => {
    const matchFilter =
      filter === 'all'     ||
      (filter === 'expired' && c.daysLeft < 0) ||
      (filter === 'urgent'  && c.daysLeft >= 0 && c.daysLeft <= 30) ||
      (filter === 'active'  && c.daysLeft > 30)
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
    return matchFilter && matchSearch
  })

  const buildRenewalQuote = (client) => {
    navigate('/quote', {
      state: {
        initialClient: client,
        initialItems: [{
          id: `renewal-${client.id}`,
          product_name: client.products_used || 'Software Renewal',
          brand: '', category: 'Renewal', variant: 'Annual Renewal',
          eu_price: client.amount_ex_gst || 0, cost_price: 0,
          renewal_price: client.amount_ex_gst || 0, quantity: 1,
          discount_pct: 0, private_note: '',
        }],
      }
    })
  }

  const sendReminder = (client) => {
    const msg = `Hi ${client.name}! 🙏\n\nYour software license${client.products_used ? ` (${client.products_used})` : ''} is ${client.daysLeft < 0 ? `expired ${Math.abs(client.daysLeft)} days ago` : `expiring in ${client.daysLeft} day${client.daysLeft !== 1 ? 's' : ''}`} on ${format(new Date(client.expiry_date), 'dd MMM yyyy')}.\n\nPlease renew to avoid interruption.\n\n📞 +91 81700 18080\n📧 acsbdn@gmail.com\n\n— Advanced Computer System, Burdwan`
    window.open(`https://wa.me/${client.whatsapp || client.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const metrics = [
    { label: 'Expired',   count: expired.length, color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20',    key: 'expired' },
    { label: '≤30 Days',  count: urgent.length,  color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', key: 'urgent' },
    { label: 'Active',    count: active.length,  color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', key: 'active' },
    { label: 'Total',     count: enriched.length,color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20',   key: 'all' },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCcw size={16} className="text-accent" />
            <h1 className="text-lg font-bold text-text-primary">Renewals</h1>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {metrics.map(m => (
              <button key={m.key} onClick={() => setFilter(m.key)} className={`card px-3 py-2.5 text-center border transition-colors hover:opacity-80 ${filter === m.key ? m.bg : ''}`}>
                <p className={`text-xl font-bold font-mono ${m.color}`}>{m.count}</p>
                <p className="text-text-muted text-[10px] font-medium">{m.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input pl-9" placeholder="Search client or phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading && <div className="text-center py-12 text-text-muted text-sm">Loading renewals…</div>}
        {!loading && filtered.length === 0 && <div className="text-center py-12 text-text-muted text-sm">No clients match this filter.</div>}

        {filtered.map(client => (
          <div key={client.id} className={`card p-4 border-l-2 ${client.daysLeft !== null && client.daysLeft < 0 ? 'border-l-red-500' : client.daysLeft !== null && client.daysLeft <= 30 ? 'border-l-amber-500' : 'border-l-green-500'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-text-primary font-semibold text-sm">{client.name}</span>
                  <StatusBadge days={client.daysLeft} />
                </div>
                <p className="text-text-muted text-xs mt-1">{client.phone}</p>
                {client.products_used && <p className="text-text-secondary text-xs mt-1">{client.products_used}</p>}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-text-muted text-xs">Expiry: <span className="text-text-secondary">{client.expiry_date ? format(new Date(client.expiry_date), 'dd MMM yyyy') : '—'}</span></span>
                  {client.amount_ex_gst && <span className="text-text-muted text-xs">Last: <span className="text-text-secondary font-mono">{formatINR(client.amount_ex_gst)}</span></span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => buildRenewalQuote(client)} className="btn-primary text-xs py-1.5 flex items-center gap-1.5"><FileText size={11} />Renew</button>
                <button onClick={() => sendReminder(client)} className="btn-secondary text-xs py-1.5 flex items-center gap-1.5"><MessageSquare size={11} />Remind</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
