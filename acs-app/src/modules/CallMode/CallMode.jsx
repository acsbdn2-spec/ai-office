import { useState, useEffect } from 'react'
import { Search, Phone, ChevronRight, Zap, Users, Building2, RefreshCcw } from 'lucide-react'
import { PRODUCT_CATALOG, RECOMMENDATIONS, BUSINESS_TYPES, formatINR, getProductById } from '../../lib/products'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'

function ClientCard({ client, onSelect }) {
  const days = client.expiry_date ? differenceInDays(new Date(client.expiry_date), new Date()) : null
  const statusColor = days === null ? 'text-text-muted' : days < 0 ? 'text-red-400' : days <= 30 ? 'text-amber-400' : 'text-green-400'

  return (
    <button
      onClick={() => onSelect(client)}
      className="card p-4 w-full text-left hover:border-accent/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-semibold text-sm">{client.name}</p>
          <p className="text-text-muted text-xs mt-0.5">{client.phone} · {client.business_type}</p>
        </div>
        <ChevronRight size={16} className="text-text-muted shrink-0" />
      </div>
      {client.products_used && (
        <p className="text-text-secondary text-xs mt-2">{client.products_used}</p>
      )}
      {client.expiry_date && (
        <div className="flex items-center gap-2 mt-2">
          <RefreshCcw size={11} className={statusColor} />
          <span className={`text-xs font-medium ${statusColor}`}>
            {days === null ? '' : days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? 'Expires today' : `Renews in ${days}d`}
            {' · '}{format(new Date(client.expiry_date), 'dd MMM yyyy')}
          </span>
        </div>
      )}
    </button>
  )
}

function RecommendationChip({ productId, users = 1, onAdd }) {
  const product = getProductById(productId)
  if (!product) return null
  const price = product.eu_price * (product.unit ? users : 1)
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-semibold">{product.name}</p>
        <p className="text-text-muted text-xs">{product.brand} · {product.variant}</p>
        {product.unit && <p className="text-text-muted text-[10px]">{users} users × {formatINR(product.eu_price)}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-accent font-mono font-bold text-sm">{formatINR(price)}</p>
        <button
          onClick={() => onAdd(product)}
          className="mt-1 text-[10px] font-semibold text-accent border border-accent/30 px-2 py-0.5 rounded-md hover:bg-accent/10 transition-colors"
        >
          Add to quote
        </button>
      </div>
    </div>
  )
}

export default function CallMode() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('search') // search | existing | new
  const [selectedClient, setSelectedClient] = useState(null)
  const [businessType, setBusinessType] = useState('')
  const [users, setUsers] = useState(1)
  const [quoteItems, setQuoteItems] = useState([])

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true)
      const { data } = await supabase.from('clients').select('*').order('name')
      setClients(data || [])
      setLoading(false)
    }
    fetchClients()
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered([]); return }
    const q = search.toLowerCase()
    setFiltered(clients.filter(c =>
      c.name?.toLowerCase().includes(q) || c.phone?.includes(q)
    ).slice(0, 8))
  }, [search, clients])

  const recommendations = businessType ? (RECOMMENDATIONS[businessType] || []) : []

  const goToQuote = (items) => {
    navigate('/quote', { state: { initialItems: items, initialClient: selectedClient || { business_type: businessType, users } } })
  }

  const addToQuote = (product) => {
    setQuoteItems(prev => {
      if (prev.find(i => i.id === product.id)) return prev
      return [...prev, {
        id: product.id,
        product_name: product.name,
        brand: product.brand,
        category: product.category,
        variant: product.variant || '',
        eu_price: product.eu_price,
        cost_price: product.cost_price,
        renewal_price: product.renewal_price,
        quantity: users,
        discount_pct: 0,
        private_note: '',
      }]
    })
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-accent" />
            <h1 className="text-lg font-bold text-text-primary">Call Mode</h1>
          </div>
          <p className="text-text-muted text-xs">Search client or set up a new prospect</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Search */}
        {mode === 'search' && (
          <>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                className="input pl-10 h-11"
                placeholder="Search by name or phone…"
                value={search}
                autoFocus
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {search && filtered.length === 0 && !loading && (
              <div className="card p-5 text-center">
                <p className="text-text-muted text-sm">No client found for "{search}"</p>
                <button
                  onClick={() => setMode('new')}
                  className="btn-primary mt-3 text-sm"
                >
                  Set up as new prospect
                </button>
              </div>
            )}

            {filtered.map(c => (
              <ClientCard key={c.id} client={c} onSelect={c => { setSelectedClient(c); setMode('existing') }} />
            ))}

            {!search && (
              <button onClick={() => setMode('new')} className="card p-4 w-full text-left hover:border-accent/40 transition-colors border-dashed">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Phone size={15} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-semibold">New prospect</p>
                    <p className="text-text-muted text-xs">Select business type to get recommendations</p>
                  </div>
                </div>
              </button>
            )}
          </>
        )}

        {/* Existing client mode */}
        {mode === 'existing' && selectedClient && (
          <>
            <div className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-text-primary font-bold text-base">{selectedClient.name}</h2>
                  <p className="text-text-muted text-sm mt-0.5">{selectedClient.phone}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedClient.business_type && <span className="badge-blue">{selectedClient.business_type}</span>}
                    {selectedClient.products_used && <span className="badge-green text-xs">{selectedClient.products_used}</span>}
                  </div>
                </div>
                <a href={`tel:${selectedClient.phone}`} className="btn-primary flex items-center gap-2">
                  <Phone size={14} />Call
                </a>
              </div>
              {selectedClient.expiry_date && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-text-muted text-xs">Renewal: <span className="text-text-secondary font-medium">{format(new Date(selectedClient.expiry_date), 'dd MMM yyyy')}</span></p>
                  {selectedClient.amount_ex_gst && <p className="text-text-muted text-xs mt-1">Last paid: <span className="text-text-secondary font-mono font-medium">{formatINR(selectedClient.amount_ex_gst)}</span></p>}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setMode('search')} className="btn-secondary flex-1">Back</button>
              <button
                onClick={() => goToQuote([{
                  id: 'renewal',
                  product_name: selectedClient.products_used || 'Software Renewal',
                  brand: '',
                  category: 'Renewal',
                  variant: 'Annual Renewal',
                  eu_price: selectedClient.amount_ex_gst || 0,
                  cost_price: 0,
                  renewal_price: selectedClient.amount_ex_gst || 0,
                  quantity: 1,
                  discount_pct: 0,
                  private_note: '',
                }])}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <RefreshCcw size={14} />Build Renewal Quote
              </button>
            </div>
          </>
        )}

        {/* New prospect mode */}
        {mode === 'new' && (
          <>
            <div className="card p-4 space-y-4">
              <h2 className="text-text-primary font-semibold text-sm">New Prospect Setup</h2>

              <div>
                <label className="text-text-muted text-xs mb-2 block">Business Type</label>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_TYPES.map(bt => (
                    <button
                      key={bt}
                      onClick={() => setBusinessType(bt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${businessType === bt ? 'bg-accent border-accent text-white' : 'bg-surface border-border text-text-secondary hover:border-accent/50'}`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1.5 block flex items-center gap-1.5">
                  <Users size={11} /> Number of users
                </label>
                <input
                  type="number"
                  min="1"
                  className="input font-mono w-32"
                  value={users}
                  onChange={e => setUsers(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {businessType && recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Zap size={13} className="text-accent" />
                  <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Recommended for {businessType}</p>
                </div>
                {recommendations.map(pid => (
                  <RecommendationChip key={pid} productId={pid} users={users} onAdd={addToQuote} />
                ))}
              </div>
            )}

            {quoteItems.length > 0 && (
              <div className="card p-4 bg-accent/5 border-accent/30">
                <p className="text-accent text-sm font-semibold">{quoteItems.length} product{quoteItems.length !== 1 ? 's' : ''} selected</p>
                <p className="text-text-secondary text-xs mt-1">
                  Total: <span className="font-mono font-bold">{formatINR(quoteItems.reduce((s, i) => s + i.eu_price * i.quantity, 0))}</span>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setMode('search')} className="btn-secondary flex-1">Back</button>
              <button
                onClick={() => goToQuote(quoteItems)}
                className="btn-primary flex-1"
                disabled={quoteItems.length === 0}
              >
                Open in Quote Builder →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
