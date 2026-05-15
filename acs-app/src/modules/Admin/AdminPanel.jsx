import { useState, useEffect } from 'react'
import { Settings, Package, Users, BarChart2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Lock, Unlock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useDemoData } from '../../contexts/DemoDataContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatINR } from '../../lib/products'
import { usePin } from '../../contexts/PinContext'
import PinModal from '../../components/UI/PinModal'
import Modal from '../../components/UI/Modal'
import { format } from 'date-fns'

const TABS  = [{ id: 'products', label: 'Products', icon: Package }, { id: 'staff', label: 'Staff', icon: Users }, { id: 'reports', label: 'Reports', icon: BarChart2 }]
const ROLES = ['admin', 'sales', 'telecaller', 'support']
const EMPTY_PRODUCT = { name: '', category: '', brand: '', eu_price: '', cost_price: '', renewal_price: '', renewal_cost: '', variant: '', specs: '', is_active: true }
const EMPTY_STAFF   = { email: '', full_name: '', role: 'sales', is_active: true }

export default function AdminPanel() {
  const { isAdmin } = useAuth()
  const { profitUnlocked } = usePin()
  const { db, isDemo } = useDemoData()
  const [tab, setTab]         = useState('products')
  const [pinOpen, setPinOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [staff, setStaff]     = useState([])
  const [quotes, setQuotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [prodModal, setProdModal] = useState(false)
  const [staffModal, setStaffModal] = useState(false)
  const [editingProd, setEditingProd] = useState(null)
  const [editingStaff, setEditingStaff] = useState(null)
  const [prodForm, setProdForm]   = useState(EMPTY_PRODUCT)
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF)
  const [saving, setSaving]   = useState(false)
  const [bulkEdit, setBulkEdit] = useState(false)
  const [bulkPrices, setBulkPrices] = useState({})
  const [search, setSearch]   = useState('')

  useEffect(() => { fetchAll() }, [tab, isDemo])

  const fetchAll = async () => {
    setLoading(true)
    if (isDemo) {
      if (tab === 'products') setProducts(db.getProducts())
      else if (tab === 'staff') setStaff(db.getStaff())
      else if (tab === 'reports') setQuotes(db.getQuotes())
    } else {
      if (tab === 'products') { const { data } = await supabase.from('products').select('*').order('name'); setProducts(data || []) }
      else if (tab === 'staff') { const { data } = await supabase.from('profiles').select('*').order('full_name'); setStaff(data || []) }
      else if (tab === 'reports') { const { data } = await supabase.from('quotes').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(50); setQuotes(data || []) }
    }
    setLoading(false)
  }

  // Products
  const saveProduct = async () => {
    setSaving(true)
    const payload = { ...prodForm, eu_price: +prodForm.eu_price, cost_price: +prodForm.cost_price, renewal_price: +prodForm.renewal_price, renewal_cost: +(prodForm.renewal_cost||0) }
    if (isDemo) { editingProd ? db.updateProduct(editingProd.id, payload) : db.addProduct(payload); fetchAll() }
    else { editingProd ? await supabase.from('products').update(payload).eq('id', editingProd.id) : await supabase.from('products').insert(payload); fetchAll() }
    setSaving(false); setProdModal(false)
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    if (isDemo) db.deleteProduct(id)
    else await supabase.from('products').delete().eq('id', id)
    fetchAll()
  }

  const toggleProduct = (id, val) => {
    if (isDemo) db.updateProduct(id, { is_active: val })
    else supabase.from('products').update({ is_active: val }).eq('id', id)
    setProducts(p => p.map(x => x.id === id ? { ...x, is_active: val } : x))
  }

  const saveBulkPrices = async () => {
    setSaving(true)
    for (const [id, eu_price] of Object.entries(bulkPrices)) {
      if (isDemo) db.updateProduct(id, { eu_price: +eu_price })
      else await supabase.from('products').update({ eu_price: +eu_price }).eq('id', id)
    }
    setSaving(false); setBulkEdit(false); setBulkPrices({}); fetchAll()
  }

  // Staff
  const saveStaff = async () => {
    setSaving(true)
    if (isDemo) { editingStaff ? db.updateStaff(editingStaff.id, staffForm) : db.addStaff(staffForm); fetchAll() }
    else { editingStaff ? await supabase.from('profiles').update({ full_name: staffForm.full_name, role: staffForm.role, is_active: staffForm.is_active }).eq('id', editingStaff.id) : await supabase.from('profiles').insert(staffForm); fetchAll() }
    setSaving(false); setStaffModal(false)
  }

  const toggleStaff = (id, val) => {
    if (isDemo) db.updateStaff(id, { is_active: val })
    else supabase.from('profiles').update({ is_active: val }).eq('id', id)
    setStaff(p => p.map(s => s.id === id ? { ...s, is_active: val } : s))
  }

  const filteredProducts = products.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))

  const totalRevenue = quotes.reduce((s, q) => s + (q.total_eu || 0), 0)
  const totalProfit  = quotes.reduce((s, q) => s + (q.total_profit || 0), 0)

  if (!isAdmin) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center"><Lock size={32} className="text-text-muted mx-auto mb-3" /><p className="text-text-secondary">Admin access only</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Settings size={16} className="text-accent" /><h1 className="text-lg font-bold text-text-primary">Admin Panel</h1></div>
            <button onClick={() => setPinOpen(true)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${profitUnlocked ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-surface border-border text-text-muted hover:text-text-primary'}`}>
              {profitUnlocked ? <Unlock size={12} /> : <Lock size={12} />} Profit View
            </button>
          </div>
          <div className="flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors ${tab === id ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'}`}>
                <Icon size={12} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">

        {/* Products */}
        {tab === 'products' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <input className="input flex-1 text-xs" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
              <button onClick={() => setBulkEdit(!bulkEdit)} className={`btn-secondary text-xs ${bulkEdit ? 'text-accent' : ''}`}>Bulk Edit</button>
              {bulkEdit && <button onClick={saveBulkPrices} disabled={saving} className="btn-primary text-xs">{saving ? 'Saving…' : 'Save All'}</button>}
              <button onClick={() => { setEditingProd(null); setProdForm(EMPTY_PRODUCT); setProdModal(true) }} className="btn-primary text-xs flex items-center gap-1"><Plus size={12} />Add</button>
            </div>
            <p className="text-text-muted text-xs">{filteredProducts.length} products</p>
            {filteredProducts.map(p => (
              <div key={p.id} className={`card p-3 ${!p.is_active ? 'opacity-40' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-text-primary font-medium text-sm">{p.name}</span>
                      <span className="badge-blue text-[10px]">{p.category}</span>
                      <span className="text-text-muted text-[10px]">{p.brand}</span>
                      {p.variant && <span className="text-text-muted text-[10px]">{p.variant}</span>}
                    </div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {bulkEdit ? (
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted text-xs">EU:</span>
                          <input type="number" className="input text-xs py-0.5 w-28 font-mono" value={bulkPrices[p.id] ?? p.eu_price} onChange={e => setBulkPrices(prev => ({ ...prev, [p.id]: e.target.value }))} />
                        </div>
                      ) : (
                        <>
                          <span className="text-text-muted text-xs">EU: <span className="text-text-secondary font-mono">{formatINR(p.eu_price)}</span></span>
                          {profitUnlocked && (
                            <>
                              <span className="text-text-muted text-xs">Cost: <span className="text-red-400 font-mono">{formatINR(p.cost_price)}</span></span>
                              <span className="text-text-muted text-xs">Margin: <span className="text-green-400 font-mono">{formatINR(p.eu_price - p.cost_price)} ({p.eu_price > 0 ? ((p.eu_price - p.cost_price)/p.eu_price*100).toFixed(0) : 0}%)</span></span>
                            </>
                          )}
                          {p.renewal_price > 0 && <span className="text-text-muted text-xs">ARC: <span className="text-text-secondary font-mono">{formatINR(p.renewal_price)}</span></span>}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleProduct(p.id, !p.is_active)} className={`text-xs ${p.is_active ? 'text-green-400' : 'text-text-muted'}`}>{p.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}</button>
                    <button onClick={() => { setEditingProd(p); setProdForm({ ...p }); setProdModal(true) }} className="btn-ghost p-1.5"><Edit2 size={13} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="btn-ghost p-1.5 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Staff */}
        {tab === 'staff' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => { setEditingStaff(null); setStaffForm(EMPTY_STAFF); setStaffModal(true) }} className="btn-primary text-xs flex items-center gap-1"><Plus size={12} />Add Staff</button>
            </div>
            {staff.map(s => (
              <div key={s.id} className={`card p-4 flex items-center gap-3 ${!s.is_active ? 'opacity-50' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm shrink-0">{s.full_name?.[0]?.toUpperCase() ?? '?'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium text-sm">{s.full_name}</p>
                  <p className="text-text-muted text-xs">{s.email}</p>
                  <span className={`text-xs font-semibold capitalize ${s.role === 'admin' ? 'text-accent' : 'text-text-secondary'}`}>{s.role}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleStaff(s.id, !s.is_active)} className={s.is_active ? 'text-green-400' : 'text-text-muted'}>{s.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}</button>
                  <button onClick={() => { setEditingStaff(s); setStaffForm({ ...s }); setStaffModal(true) }} className="btn-ghost p-1.5"><Edit2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports */}
        {tab === 'reports' && (
          <div className="space-y-5">
            {profitUnlocked && (
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 text-center">
                  <p className="text-text-muted text-xs mb-1">Total Quote Value</p>
                  <p className="text-accent font-mono font-bold text-xl">{formatINR(totalRevenue)}</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-text-muted text-xs mb-1">Total Profit</p>
                  <p className="text-green-400 font-mono font-bold text-xl">{formatINR(totalProfit)}</p>
                </div>
              </div>
            )}
            <div className="card p-4">
              <h3 className="text-text-secondary text-sm font-semibold mb-3">Recent Quotes</h3>
              <div className="space-y-0">
                {quotes.map(q => (
                  <div key={q.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div>
                      <p className="text-text-primary text-sm font-medium">{q.client_name || 'Draft'}</p>
                      <p className="text-text-muted text-xs">{q.profiles?.full_name} · {format(new Date(q.created_at), 'dd MMM yyyy')} · <span className={`capitalize ${q.status === 'accepted' ? 'text-green-400' : q.status === 'sent' ? 'text-blue-400' : 'text-text-muted'}`}>{q.status}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-accent font-mono text-sm font-semibold">{formatINR(q.total_eu)}</p>
                      {profitUnlocked && <p className="text-green-400 text-xs font-mono">+{formatINR(q.total_profit)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} />

      {/* Product modal */}
      <Modal open={prodModal} onClose={() => setProdModal(false)} title={editingProd ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="grid grid-cols-2 gap-3">
          {[{ key: 'name', label: 'Name', required: true, colSpan: 2 }, { key: 'brand', label: 'Brand', required: true }, { key: 'category', label: 'Category', required: true }, { key: 'variant', label: 'Variant' }, { key: 'eu_price', label: 'EU Price (₹)', type: 'number', required: true }, { key: 'cost_price', label: 'Cost (₹)', type: 'number', required: true }, { key: 'renewal_price', label: 'Renewal Price (₹)', type: 'number' }, { key: 'renewal_cost', label: 'Renewal Cost (₹)', type: 'number' }, { key: 'specs', label: 'Specs', colSpan: 2 }].map(({ key, label, required, type, colSpan }) => (
            <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="text-text-muted text-xs mb-1 block">{label}{required && ' *'}</label>
              <input type={type || 'text'} className="input" value={prodForm[key] || ''} onChange={e => setProdForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setProdModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={saveProduct} disabled={saving || !prodForm.name} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving…' : editingProd ? 'Update' : 'Add'}</button>
        </div>
      </Modal>

      {/* Staff modal */}
      <Modal open={staffModal} onClose={() => setStaffModal(false)} title={editingStaff ? 'Edit Staff' : 'Add Staff'} size="sm">
        <div className="space-y-3">
          <div><label className="text-text-muted text-xs mb-1 block">Full Name *</label><input className="input" value={staffForm.full_name || ''} onChange={e => setStaffForm(f => ({ ...f, full_name: e.target.value }))} /></div>
          {!editingStaff && <div><label className="text-text-muted text-xs mb-1 block">Email *</label><input type="email" className="input" value={staffForm.email || ''} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} /></div>}
          <div><label className="text-text-muted text-xs mb-1 block">Role</label><select className="input" value={staffForm.role || 'sales'} onChange={e => setStaffForm(f => ({ ...f, role: e.target.value }))}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
          <div className="flex items-center gap-2"><label className="text-text-muted text-xs">Active</label><button onClick={() => setStaffForm(f => ({ ...f, is_active: !f.is_active }))} className={staffForm.is_active ? 'text-green-400' : 'text-text-muted'}>{staffForm.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}</button></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setStaffModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={saveStaff} disabled={saving || !staffForm.full_name} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}
