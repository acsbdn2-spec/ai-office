import { createContext, useContext, useState } from 'react'
import {
  DEMO_CLIENTS, DEMO_QUOTES, DEMO_TICKETS, DEMO_TICKET_COMMENTS,
  DEMO_CALL_LOGS, DEMO_SESSIONS, DEMO_STAFF,
} from '../lib/demoData'
import { PRODUCT_CATALOG } from '../lib/products'
import { isDemo } from '../lib/supabase'

const DemoDataContext = createContext(null)

export function DemoDataProvider({ children }) {
  const [clients, setClients]   = useState(DEMO_CLIENTS)
  const [quotes, setQuotes]     = useState(DEMO_QUOTES)
  const [tickets, setTickets]   = useState(DEMO_TICKETS)
  const [comments, setComments] = useState(DEMO_TICKET_COMMENTS)
  const [callLogs, setCallLogs] = useState(DEMO_CALL_LOGS)
  const [sessions, setSessions] = useState(DEMO_SESSIONS)
  const [staff, setStaff]       = useState(DEMO_STAFF)
  const [products, setProducts] = useState(
    PRODUCT_CATALOG.map(p => ({ ...p, id: p.id }))
  )

  const genId = () => Math.random().toString(36).slice(2)

  const db = {
    // ── Clients ──────────────────────────────────────────────────────────────
    getClients:  (opts = {}) => {
      let rows = [...clients]
      if (opts.notNullExpiry) rows = rows.filter(c => c.expiry_date)
      if (opts.sort) rows.sort((a, b) => (a[opts.sort] || '').localeCompare(b[opts.sort] || ''))
      return rows
    },
    addClient:    (data)  => { const r = { ...data, id: genId(), created_at: new Date().toISOString() }; setClients(p => [...p, r]); return r },
    updateClient: (id, d) => { setClients(p => p.map(c => c.id === id ? { ...c, ...d } : c)) },
    deleteClient: (id)    => { setClients(p => p.filter(c => c.id !== id)) },

    // ── Quotes ───────────────────────────────────────────────────────────────
    getQuotes:  () => quotes.map(q => ({ ...q, profiles: q.profiles || { full_name: 'Demo User' } })),
    addQuote:   (data) => { const r = { ...data, id: genId(), created_at: new Date().toISOString(), profiles: { full_name: 'Demo User' } }; setQuotes(p => [...p, r]); return r },

    // ── Tickets ──────────────────────────────────────────────────────────────
    getTickets:  (opts = {}) => {
      let rows = tickets.map(t => ({
        ...t,
        assigned_profile: t.assigned_profile,
        creator_profile:  t.creator_profile,
      }))
      if (opts.statuses)     rows = rows.filter(t => opts.statuses.includes(t.status))
      if (opts.assignedTo)   rows = rows.filter(t => t.assigned_to === opts.assignedTo || t.created_by === opts.assignedTo)
      return rows
    },
    addTicket:    (data)      => { const r = { ...data, id: genId(), created_at: new Date().toISOString(), assigned_profile: null, creator_profile: { full_name: 'Demo User' } }; setTickets(p => [r, ...p]); return r },
    updateTicket: (id, patch) => { setTickets(p => p.map(t => t.id === id ? { ...t, ...patch } : t)) },

    // ── Ticket comments ──────────────────────────────────────────────────────
    getComments:  (ticketId) => comments[ticketId] || [],
    addComment:   (ticketId, userId, text, userName) => {
      const r = { id: genId(), ticket_id: ticketId, user_id: userId, comment: text, created_at: new Date().toISOString(), profiles: { full_name: userName || 'You' } }
      setComments(prev => ({ ...prev, [ticketId]: [...(prev[ticketId] || []), r] }))
    },

    // ── Call logs ────────────────────────────────────────────────────────────
    getCallLogs:  () => [...callLogs].sort((a, b) => b.called_at.localeCompare(a.called_at)),
    addCallLog:   (data) => {
      const client = clients.find(c => c.id === data.client_id)
      const r = { ...data, id: genId(), called_at: new Date().toISOString(), clients: { name: client?.name || '', phone: client?.phone || '' }, profiles: { full_name: 'Demo Telecaller' } }
      setCallLogs(p => [r, ...p])
    },

    // ── Sessions ─────────────────────────────────────────────────────────────
    getActiveSession: (userId) => sessions.find(s => s.user_id === userId && !s.logout_at) || null,
    getSessions:      ()       => sessions,
    startSession:     (userId) => { const r = { id: genId(), user_id: userId, login_at: new Date().toISOString(), logout_at: null, total_calls: 0, profiles: { full_name: 'Demo Telecaller' } }; setSessions(p => [r, ...p]); return r },
    endSession:       (id)     => { setSessions(p => p.map(s => s.id === id ? { ...s, logout_at: new Date().toISOString() } : s)) },
    incrementCalls:   (id)     => { setSessions(p => p.map(s => s.id === id ? { ...s, total_calls: (s.total_calls || 0) + 1 } : s)) },

    // ── Staff ─────────────────────────────────────────────────────────────────
    getStaff:    ()         => staff,
    addStaff:    (data)     => { const r = { ...data, id: genId(), created_at: new Date().toISOString() }; setStaff(p => [...p, r]) },
    updateStaff: (id, patch)=> { setStaff(p => p.map(s => s.id === id ? { ...s, ...patch } : s)) },

    // ── Products ──────────────────────────────────────────────────────────────
    getProducts:    ()          => products,
    addProduct:     (data)      => { const r = { ...data, id: genId(), created_at: new Date().toISOString() }; setProducts(p => [...p, r]) },
    updateProduct:  (id, patch) => { setProducts(p => p.map(x => x.id === id ? { ...x, ...patch } : x)) },
    deleteProduct:  (id)        => { setProducts(p => p.filter(x => x.id !== id)) },
  }

  return (
    <DemoDataContext.Provider value={{ db, isDemo }}>
      {children}
    </DemoDataContext.Provider>
  )
}

export function useDemoData() {
  return useContext(DemoDataContext)
}
