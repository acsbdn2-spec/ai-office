import { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import { Search, Plus, X, ChevronDown, ToggleLeft, ToggleRight, MessageSquare, Copy, Download, Send, Save, Eye, EyeOff, Lock, Unlock, Info } from 'lucide-react'
import { PRODUCT_CATALOG, CLOUD_HOSTING_IDS, LICENSE_CATEGORIES, formatINR } from '../../lib/products'
import { useAuth } from '../../contexts/AuthContext'
import { usePin } from '../../contexts/PinContext'
import { supabase } from '../../lib/supabase'
import { generateQuotePDF } from './generatePDF'
import PinModal from '../../components/UI/PinModal'
import { format, addDays } from 'date-fns'

const fuse = new Fuse(PRODUCT_CATALOG, {
  keys: ['name', 'brand', 'category', 'variant'],
  threshold: 0.35,
  includeScore: true,
})

function ProductSearchInput({ onAdd }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (q.length < 1) { setResults([]); return }
    const r = fuse.search(q).slice(0, 10).map(x => x.item)
    setResults(r)
    setOpen(r.length > 0)
  }, [q])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          className="input pl-9"
          placeholder="Search products — TallyPrime, BUSY, VPS, Marg…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
        />
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl z-30 max-h-72 overflow-y-auto">
          {results.map(p => (
            <button
              key={p.id}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface text-left transition-colors border-b border-border last:border-0"
              onClick={() => { onAdd(p); setQ(''); setOpen(false) }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium">{p.name}</p>
                <p className="text-text-muted text-xs mt-0.5">{p.brand} · {p.category} · {p.variant}</p>
              </div>
              <span className="text-accent font-mono text-sm font-semibold shrink-0">{formatINR(p.eu_price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function QuoteLineItem({ item, onChange, onRemove, showProfit }) {
  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm font-semibold truncate">{item.product_name}</p>
          <p className="text-text-muted text-xs">{item.brand} · {item.category}</p>
        </div>
        <button onClick={onRemove} className="text-text-muted hover:text-red-400 p-1 rounded transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-text-muted text-[10px] mb-1 block">Variant</label>
          <input
            className="input text-xs py-1.5"
            value={item.variant}
            onChange={e => onChange({ ...item, variant: e.target.value })}
          />
        </div>
        <div>
          <label className="text-text-muted text-[10px] mb-1 block">Qty / Users</label>
          <input
            type="number"
            min="1"
            className="input text-xs py-1.5 font-mono"
            value={item.quantity}
            onChange={e => onChange({ ...item, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <label className="text-text-muted text-[10px] mb-1 block">Discount %</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            className="input text-xs py-1.5 font-mono"
            value={item.discount_pct}
            onChange={e => onChange({ ...item, discount_pct: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <label className="text-text-muted text-[10px] mb-1 block flex items-center gap-1">
          <Lock size={9} /> Private note (not shown to client)
        </label>
        <input
          className="input text-xs py-1.5 text-text-muted"
          placeholder="Internal note…"
          value={item.private_note || ''}
          onChange={e => onChange({ ...item, private_note: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div>
          <p className="text-text-muted text-xs">Unit price: <span className="font-mono text-text-secondary">{formatINR(item.eu_price)}</span></p>
          {item.discount_pct > 0 && (
            <p className="text-xs text-amber-400 font-mono">{item.discount_pct}% off → {formatINR(item.eu_price * (1 - item.discount_pct / 100))}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-text-primary font-semibold font-mono">
            {formatINR(item.eu_price * item.quantity * (1 - item.discount_pct / 100))}
          </p>
          {showProfit && (
            <p className="text-xs text-green-400 font-mono">
              +{formatINR((item.eu_price - item.cost_price) * item.quantity * (1 - item.discount_pct / 100))} margin
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function QuoteBuilder({ initialItems = [], initialClient = null }) {
  const { user, isAdmin } = useAuth()
  const { profitUnlocked } = usePin()
  const [items, setItems] = useState(initialItems)
  const [clientName, setClientName] = useState(initialClient?.name || '')
  const [businessType, setBusinessType] = useState(initialClient?.business_type || '')
  const [users, setUsers] = useState(initialClient?.users || 1)
  const [gst, setGst] = useState(false)
  const [showRenewal, setShowRenewal] = useState(false)
  const [notes, setNotes] = useState('')
  const [validityDays, setValidityDays] = useState(15)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [clubPrompt, setClubPrompt] = useState(false)
  const [clubChoice, setClubChoice] = useState(null)

  const hasLicense = items.some(i => LICENSE_CATEGORIES.includes(i.category))
  const hasCloud = items.some(i => CLOUD_HOSTING_IDS.includes(i.id))

  useEffect(() => {
    if (hasLicense && hasCloud && clubChoice === null) {
      setClubPrompt(true)
    }
  }, [hasLicense, hasCloud])

  const addProduct = (product) => {
    if (items.find(i => i.id === product.id)) return
    setItems(prev => [...prev, {
      id: product.id,
      product_name: product.name,
      brand: product.brand,
      category: product.category,
      variant: product.variant || '',
      eu_price: product.eu_price,
      cost_price: product.cost_price,
      renewal_price: product.renewal_price,
      quantity: 1,
      discount_pct: 0,
      private_note: '',
    }])
  }

  const updateItem = (idx, item) => setItems(prev => prev.map((it, i) => i === idx ? item : it))
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const subtotal = items.reduce((s, it) => s + it.eu_price * it.quantity * (1 - it.discount_pct / 100), 0)
  const renewalTotal = items.reduce((s, it) => s + (it.renewal_price || 0) * it.quantity, 0)
  const gstAmount = gst ? subtotal * 0.18 : 0
  const total = subtotal + gstAmount
  const totalCost = items.reduce((s, it) => s + it.cost_price * it.quantity * (1 - it.discount_pct / 100), 0)
  const profit = subtotal - totalCost
  const profitPct = subtotal > 0 ? (profit / subtotal * 100).toFixed(1) : 0

  const quoteObj = {
    client_name: clientName,
    business_type: businessType,
    users,
    items,
    total_eu: total,
    total_cost: totalCost,
    total_profit: profit,
    gst_included: gst,
    notes,
    validity_date: addDays(new Date(), validityDays).toISOString().split('T')[0],
  }

  const copyText = () => {
    const lines = items.map(it =>
      `• ${it.product_name} (${it.variant}) × ${it.quantity}${it.discount_pct ? ` [${it.discount_pct}% off]` : ''} — ${formatINR(it.eu_price * it.quantity * (1 - it.discount_pct / 100))}`
    ).join('\n')
    const text = `*Quote from Advanced Computer System, Burdwan*\nClient: ${clientName}\n\n${lines}\n\n${gst ? `Subtotal: ${formatINR(subtotal)}\nGST (18%): ${formatINR(gstAmount)}\n` : ''}*Total: ${formatINR(total)}*\n\nValid till: ${format(addDays(new Date(), validityDays), 'dd MMM yyyy')}\nContact: +91 81700 18080 | acsbdn@gmail.com`
    navigator.clipboard.writeText(text)
  }

  const whatsapp = () => {
    const lines = items.map(it =>
      `• ${it.product_name} (${it.variant}) × ${it.quantity} — ${formatINR(it.eu_price * it.quantity * (1 - it.discount_pct / 100))}`
    ).join('\n')
    const msg = `Hi! Here's your quote from *Advanced Computer System, Burdwan*:\n\n${lines}\n\n*Total: ${formatINR(total)}*${gst ? ' (incl. 18% GST)' : ''}\n\nValid till ${format(addDays(new Date(), validityDays), 'dd MMM yyyy')}. Call us: +91 81700 18080`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const saveQuote = async () => {
    setSaving(true)
    await supabase.from('quotes').insert({
      client_name: clientName,
      items,
      total_eu: total,
      total_cost: totalCost,
      total_profit: profit,
      gst_included: gst,
      notes,
      validity_date: quoteObj.validity_date,
      status: 'draft',
      created_by: user?.id,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-text-primary">Quote Builder</h1>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button onClick={() => setPinOpen(true)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${profitUnlocked ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-surface border-border text-text-muted hover:text-text-primary'}`}>
                  {profitUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                  Profit
                </button>
              )}
            </div>
          </div>

          {/* Running total */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-text-muted text-xs">Total{gst ? ' (incl. GST)' : ' (ex-GST)'}</p>
              <p className="text-2xl font-bold font-mono text-accent">{formatINR(total)}</p>
            </div>
            {profitUnlocked && isAdmin && (
              <div className="text-right bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                <p className="text-green-400 text-xs">Profit</p>
                <p className="text-green-400 font-mono font-bold">{formatINR(profit)} <span className="text-xs opacity-70">({profitPct}%)</span></p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Client info */}
        <div className="card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary">Client Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-text-muted text-xs mb-1 block">Client Name</label>
              <input className="input" placeholder="Sharma Traders" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Business Type</label>
              <input className="input" placeholder="Retail, Distribution…" value={businessType} onChange={e => setBusinessType(e.target.value)} />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">No. of Users</label>
              <input type="number" min="1" className="input font-mono" value={users} onChange={e => setUsers(parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Valid for (days)</label>
              <input type="number" min="1" className="input font-mono" value={validityDays} onChange={e => setValidityDays(parseInt(e.target.value) || 15)} />
            </div>
          </div>
        </div>

        {/* Product search */}
        <div className="card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary">Add Products</h2>
          <ProductSearchInput onAdd={addProduct} />
        </div>

        {/* Club prompt */}
        {clubPrompt && clubChoice === null && (
          <div className="card p-4 border-accent/40 bg-accent/5">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-accent mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-text-primary text-sm font-semibold">License + Cloud Hosting detected</p>
                <p className="text-text-secondary text-xs mt-1">Show as one combined price or separate line items?</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setClubChoice('combined'); setClubPrompt(false) }} className="btn-primary text-xs py-1.5">Combined price</button>
                  <button onClick={() => { setClubChoice('separate'); setClubPrompt(false) }} className="btn-secondary text-xs py-1.5">Show separately</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Line items */}
        {items.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-text-secondary px-1">{items.length} item{items.length !== 1 ? 's' : ''}</h2>
            {items.map((item, idx) => (
              <QuoteLineItem
                key={item.id + idx}
                item={item}
                onChange={(updated) => updateItem(idx, updated)}
                onRemove={() => removeItem(idx)}
                showProfit={profitUnlocked && isAdmin}
              />
            ))}
          </div>
        )}

        {/* Toggles */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary text-sm font-medium">GST (+18%)</p>
              <p className="text-text-muted text-xs">Adds ₹{formatINR(subtotal * 0.18).replace('₹','')} to total</p>
            </div>
            <button onClick={() => setGst(!gst)} className={`transition-colors ${gst ? 'text-accent' : 'text-text-muted'}`}>
              {gst ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="text-text-primary text-sm font-medium">Show Annual Renewal Cost</p>
              <p className="text-text-muted text-xs">Renewal total: {formatINR(renewalTotal)}/year</p>
            </div>
            <button onClick={() => setShowRenewal(!showRenewal)} className={`transition-colors ${showRenewal ? 'text-accent' : 'text-text-muted'}`}>
              {showRenewal ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        </div>

        {/* Profit panel (admin + unlocked) */}
        {profitUnlocked && isAdmin && items.length > 0 && (
          <div className="card p-4 border-green-500/20 bg-green-500/5 space-y-2">
            <h3 className="text-green-400 text-xs font-semibold uppercase tracking-wide">Margin Analysis</h3>
            {items.map((it, idx) => {
              const lineRev = it.eu_price * it.quantity * (1 - it.discount_pct / 100)
              const lineCost = it.cost_price * it.quantity * (1 - it.discount_pct / 100)
              const lineProfit = lineRev - lineCost
              const linePct = lineRev > 0 ? (lineProfit / lineRev * 100).toFixed(1) : 0
              return (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-green-500/10 last:border-0">
                  <span className="text-text-secondary truncate flex-1">{it.product_name}</span>
                  <span className="font-mono text-green-400 ml-2">+{formatINR(lineProfit)} ({linePct}%)</span>
                </div>
              )
            })}
            <div className="flex items-center justify-between pt-1">
              <span className="text-green-400 font-semibold text-sm">Total Profit</span>
              <span className="font-mono font-bold text-green-400">{formatINR(profit)} ({profitPct}%)</span>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="card p-4">
          <label className="text-text-secondary text-xs font-medium mb-2 block">Notes / Terms (shown to client)</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Payment terms, delivery conditions, special notes…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pb-6">
          <button onClick={copyText} disabled={!items.length} className="btn-secondary flex items-center justify-center gap-2 h-11 disabled:opacity-40">
            <Copy size={15} />Copy Text
          </button>
          <button onClick={() => generateQuotePDF(quoteObj)} disabled={!items.length} className="btn-secondary flex items-center justify-center gap-2 h-11 disabled:opacity-40">
            <Download size={15} />PDF
          </button>
          <button onClick={whatsapp} disabled={!items.length} className="btn-secondary flex items-center justify-center gap-2 h-11 disabled:opacity-40 col-span-1">
            <MessageSquare size={15} />WhatsApp
          </button>
          <button onClick={saveQuote} disabled={!items.length || saving} className="btn-primary flex items-center justify-center gap-2 h-11 disabled:opacity-40">
            <Save size={15} />{saving ? 'Saving…' : saved ? 'Saved!' : 'Save Quote'}
          </button>
        </div>
      </div>

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} />
    </div>
  )
}
