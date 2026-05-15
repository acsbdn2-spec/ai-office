import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Clock, CheckCircle, AlertTriangle, Search, Send, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format, isPast } from 'date-fns'
import Modal from '../../components/UI/Modal'

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const CATEGORIES = ['Technical', 'Billing', 'New requirement', 'General']
const STATUSES = ['open', 'in_progress', 'pending_client', 'resolved', 'closed']
const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', pending_client: 'Pending Client', resolved: 'Resolved', closed: 'Closed' }
const STATUS_COLORS = { open: 'badge-red', in_progress: 'badge-amber', pending_client: 'badge-blue', resolved: 'badge-green', closed: 'text-text-muted text-xs' }
const PRIORITY_COLORS = { Low: 'text-text-muted', Medium: 'text-blue-400', High: 'text-amber-400', Urgent: 'text-red-400' }

const EMPTY_TICKET = { title: '', description: '', priority: 'Medium', category: 'Technical', client_id: null }

export default function TicketSystem() {
  const { user, isAdmin, profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [form, setForm] = useState(EMPTY_TICKET)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [staff, setStaff] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchTickets(); fetchStaff() }, [statusFilter])

  const fetchTickets = async () => {
    setLoading(true)
    let q = supabase.from('tickets').select('*, assigned_profile:profiles!tickets_assigned_to_fkey(full_name), creator_profile:profiles!tickets_created_by_fkey(full_name)')
    if (statusFilter === 'active') q = q.in('status', ['open', 'in_progress', 'pending_client'])
    else if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    if (!isAdmin) q = q.or(`assigned_to.eq.${user?.id},created_by.eq.${user?.id}`)
    q = q.order('created_at', { ascending: false })
    const { data } = await q
    setTickets(data || [])
    setLoading(false)
  }

  const fetchStaff = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, role').eq('is_active', true)
    setStaff(data || [])
  }

  const fetchComments = async (ticketId) => {
    const { data } = await supabase
      .from('ticket_comments')
      .select('*, profiles(full_name)')
      .eq('ticket_id', ticketId)
      .order('created_at')
    setComments(data || [])
  }

  const openTicket = (ticket) => {
    setSelectedTicket(ticket)
    fetchComments(ticket.id)
  }

  const createTicket = async () => {
    setSaving(true)
    await supabase.from('tickets').insert({ ...form, created_by: user?.id, status: 'open' })
    setSaving(false)
    setCreateOpen(false)
    setForm(EMPTY_TICKET)
    fetchTickets()
  }

  const updateStatus = async (ticketId, status) => {
    await supabase.from('tickets').update({ status, ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) }).eq('id', ticketId)
    setSelectedTicket(t => t?.id === ticketId ? { ...t, status } : t)
    fetchTickets()
  }

  const assignTicket = async (ticketId, userId) => {
    await supabase.from('tickets').update({ assigned_to: userId }).eq('id', ticketId)
    fetchTickets()
  }

  const addComment = async () => {
    if (!comment.trim() || !selectedTicket) return
    await supabase.from('ticket_comments').insert({ ticket_id: selectedTicket.id, user_id: user?.id, comment })
    setComment('')
    fetchComments(selectedTicket.id)
  }

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  const filtered = tickets.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-accent" />
              <h1 className="text-lg font-bold text-text-primary">Tickets</h1>
            </div>
            <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus size={13} />New Ticket
            </button>
          </div>
          {/* Stats */}
          <div className="flex gap-3 mb-3">
            {[['Open', stats.open, 'text-red-400'], ['In Progress', stats.in_progress, 'text-amber-400'], ['Resolved', stats.resolved, 'text-green-400']].map(([l, c, cl]) => (
              <div key={l} className="card px-3 py-2 text-center flex-1">
                <p className={`text-lg font-bold font-mono ${cl}`}>{c}</p>
                <p className="text-text-muted text-[10px]">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input className="input pl-9" placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto text-xs" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="active">Active</option>
              <option value="all">All</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
        {loading && <div className="text-center py-12 text-text-muted text-sm">Loading…</div>}
        {filtered.map(ticket => (
          <button key={ticket.id} onClick={() => openTicket(ticket)} className="card p-4 w-full text-left hover:border-accent/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={PRIORITY_COLORS[ticket.priority]}><AlertTriangle size={11} /></span>
                  <span className="text-text-primary text-sm font-medium truncate flex-1">{ticket.title}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={STATUS_COLORS[ticket.status]}>{STATUS_LABELS[ticket.status]}</span>
                  <span className="text-text-muted text-xs">{ticket.category}</span>
                  {ticket.assigned_profile && <span className="text-text-muted text-xs">→ {ticket.assigned_profile.full_name}</span>}
                </div>
              </div>
              <span className="text-text-muted text-[10px] shrink-0">{format(new Date(ticket.created_at), 'dd MMM')}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Create ticket modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Ticket" size="md">
        <div className="space-y-3">
          <div>
            <label className="text-text-muted text-xs mb-1 block">Title *</label>
            <input className="input" placeholder="Brief issue description" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details about the issue…" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-text-muted text-xs mb-1 block">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={createTicket} disabled={!form.title || saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Creating…' : 'Create Ticket'}</button>
          </div>
        </div>
      </Modal>

      {/* Ticket detail modal */}
      <Modal open={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket?.title} size="lg">
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className={STATUS_COLORS[selectedTicket.status]}>{STATUS_LABELS[selectedTicket.status]}</span>
              <span className={`text-xs ${PRIORITY_COLORS[selectedTicket.priority]}`}>{selectedTicket.priority} priority</span>
              <span className="badge-blue">{selectedTicket.category}</span>
            </div>
            {selectedTicket.description && <p className="text-text-secondary text-sm">{selectedTicket.description}</p>}

            {/* Status update */}
            <div className="flex gap-2 flex-wrap">
              <p className="text-text-muted text-xs self-center">Move to:</p>
              {STATUSES.filter(s => s !== selectedTicket.status).map(s => (
                <button key={s} onClick={() => updateStatus(selectedTicket.id, s)} className="btn-secondary text-xs py-1 px-2.5">{STATUS_LABELS[s]}</button>
              ))}
            </div>

            {/* Assign (admin only) */}
            {isAdmin && (
              <div>
                <label className="text-text-muted text-xs mb-1 block">Assign to</label>
                <select className="input text-sm" value={selectedTicket.assigned_to || ''} onChange={e => assignTicket(selectedTicket.id, e.target.value)}>
                  <option value="">Unassigned</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>)}
                </select>
              </div>
            )}

            {/* Thread */}
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-text-muted text-xs font-medium">Thread</p>
              {comments.map(c => (
                <div key={c.id} className={`flex gap-2 ${c.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${c.user_id === user?.id ? 'bg-accent/15 text-accent' : 'bg-surface text-text-secondary'}`}>
                    <p className="font-medium text-[10px] mb-0.5 opacity-70">{c.profiles?.full_name || 'Staff'}</p>
                    <p>{c.comment}</p>
                    <p className="text-[10px] opacity-50 mt-0.5">{format(new Date(c.created_at), 'dd MMM HH:mm')}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input className="input flex-1 text-sm" placeholder="Add comment…" value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} />
                <button onClick={addComment} disabled={!comment.trim()} className="btn-primary px-3 disabled:opacity-40"><Send size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
