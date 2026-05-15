import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, MessageSquare, ChevronDown, X, Save, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatINR } from '../../lib/products'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import Modal from '../../components/UI/Modal'
import { BUSINESS_TYPES } from '../../lib/products'

const EMPTY = { name: '', phone: '', whatsapp: '', business_type: '', products_used: '', start_date: '', expiry_date: '', amount_ex_gst: '', amount_incl_gst: '', notes: '' }

export default function ClientTracker() {
  const { user, isAdmin } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('expiry_date')
  const [showGST, setShowGST] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order(sort, { ascending: true })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [sort])

  const filtered = clients.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setModalOpen(true) }

  const save = async () => {
    setSaving(true)
    const payload = { ...form, created_by: user?.id }
    if (editing) {
      await supabase.from('clients').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('clients').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    fetch()
  }

  const del = async (id) => {
    if (!confirm('Delete this client?')) return
    await supabase.from('clients').delete().eq('id', id)
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const wa = (client) => {
    const msg = `Hi ${client.name}! This is Advanced Computer System, Burdwan. How can we help you today?`
    window.open(`https://wa.me/${client.whatsapp || client.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-accent" />
              <h1 className="text-lg font-bold text-text-primary">Client Tracker</h1>
            </div>
            <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
              <Plus size={14} />Add Client
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input className="input pl-9" placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto text-xs" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="expiry_date">Sort: Expiry</option>
              <option value="name">Sort: Name</option>
              <option value="amount_ex_gst">Sort: Amount</option>
            </select>
            <button onClick={() => setShowGST(!showGST)} className={`btn-secondary text-xs whitespace-nowrap ${showGST ? 'text-accent' : ''}`}>
              {showGST ? 'w/ GST' : 'ex-GST'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
        {loading && <div className="text-center py-12 text-text-muted text-sm">Loading clients…</div>}
        {!loading && filtered.length === 0 && <div className="text-center py-12 text-text-muted text-sm">No clients found.</div>}

        {filtered.map(c => (
          <div key={c.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-text-primary font-semibold text-sm">{c.name}</span>
                  {c.business_type && <span className="badge-blue">{c.business_type}</span>}
                </div>
                <p className="text-text-muted text-xs mt-1">{c.phone}</p>
                {c.products_used && <p className="text-text-secondary text-xs mt-1">{c.products_used}</p>}
                <div className="flex gap-4 mt-2 flex-wrap">
                  {c.expiry_date && <span className="text-text-muted text-xs">Renewal: <span className="text-text-secondary">{format(new Date(c.expiry_date), 'dd MMM yyyy')}</span></span>}
                  <span className="text-text-muted text-xs">
                    {showGST ? 'w/ GST:' : 'ex-GST:'}{' '}
                    <span className="text-text-secondary font-mono">{formatINR(showGST ? c.amount_incl_gst : c.amount_ex_gst)}</span>
                  </span>
                </div>
                {(isAdmin || c.created_by === user?.id) && c.notes && (
                  <p className="text-text-muted text-xs mt-2 italic border-l-2 border-border pl-2">{c.notes}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => wa(c)} className="btn-secondary p-1.5" title="WhatsApp"><MessageSquare size={13} /></button>
                <button onClick={() => openEdit(c)} className="btn-secondary p-1.5" title="Edit"><Edit2 size={13} /></button>
                {isAdmin && <button onClick={() => del(c.id)} className="btn-secondary p-1.5 hover:text-red-400 hover:border-red-500/30" title="Delete"><Trash2 size={13} /></button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Client' : 'Add Client'} size="lg">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'name', label: 'Name', required: true, colSpan: 2 },
            { key: 'phone', label: 'Phone', required: true },
            { key: 'whatsapp', label: 'WhatsApp (if different)' },
            { key: 'products_used', label: 'Products / Software', colSpan: 2 },
            { key: 'start_date', label: 'Start Date', type: 'date' },
            { key: 'expiry_date', label: 'Renewal / Expiry Date', type: 'date' },
            { key: 'amount_ex_gst', label: 'Amount Paid (ex-GST)', type: 'number' },
            { key: 'amount_incl_gst', label: 'Amount Paid (w/ GST)', type: 'number' },
          ].map(({ key, label, required, type, colSpan }) => (
            <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="text-text-muted text-xs mb-1 block">{label}{required && ' *'}</label>
              <input
                type={type || 'text'}
                className="input"
                value={form[key] || ''}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required={required}
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="text-text-muted text-xs mb-1 block">Business Type</label>
            <select className="input" value={form.business_type || ''} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}>
              <option value="">Select…</option>
              {BUSINESS_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-text-muted text-xs mb-1 block flex items-center gap-1">Private Notes (visible to admin + creator only)</label>
            <textarea className="input resize-none" rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save} disabled={saving || !form.name} className="btn-primary flex-1 disabled:opacity-50">
            {saving ? 'Saving…' : <><Save size={14} className="inline mr-1.5" />{editing ? 'Update' : 'Save'}</>}
          </button>
        </div>
      </Modal>
    </div>
  )
}
