import { useState, useEffect } from 'react'
import { Phone, CheckCircle, XCircle, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useDemoData } from '../../contexts/DemoDataContext'
import { useAuth } from '../../contexts/AuthContext'
import { format, differenceInMinutes } from 'date-fns'
import Modal from '../../components/UI/Modal'

const OUTCOMES = ['Interested', 'Callback scheduled', 'Not interested', 'Closed', 'No answer', 'Wrong number']
const OUTCOME_COLORS = { 'Interested': 'badge-green', 'Closed': 'badge-blue', 'Callback scheduled': 'badge-amber', 'Not interested': 'badge-red', 'No answer': 'text-text-muted text-xs', 'Wrong number': 'text-text-muted text-xs' }

export default function Telecalling() {
  const { user, isAdmin, profile } = useAuth()
  const { db, isDemo } = useDemoData()
  const [queue, setQueue]         = useState([])
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [session, setSession]     = useState(null)
  const [logModal, setLogModal]   = useState(null)
  const [logForm, setLogForm]     = useState({ outcome: '', notes: '', callback_date: '' })
  const [saving, setSaving]       = useState(false)
  const [staffStats, setStaffStats] = useState([])
  const [tab, setTab]             = useState('queue')

  useEffect(() => { fetchData(); checkSession() }, [isDemo])

  const fetchData = async () => {
    setLoading(true)
    if (isDemo) {
      if (isAdmin) { setLogs(db.getCallLogs()); setStaffStats(db.getSessions()) }
      setQueue(db.getClients({ sort: 'expiry_date' }))
    } else {
      if (isAdmin) {
        const { data: allLogs } = await supabase.from('call_logs').select('*, clients(name,phone), profiles(full_name)').order('called_at', { ascending: false }).limit(100)
        setLogs(allLogs || [])
        const { data: stats } = await supabase.from('telecaller_sessions').select('*, profiles(full_name)').gte('login_at', new Date(Date.now() - 7*86400000).toISOString()).order('login_at', { ascending: false })
        setStaffStats(stats || [])
      }
      const { data: myClients } = await supabase.from('clients').select('*').order('expiry_date')
      setQueue(myClients || [])
    }
    setLoading(false)
  }

  const checkSession = () => {
    if (isDemo) { setSession(db.getActiveSession(user?.id)); return }
    supabase.from('telecaller_sessions').select('*').eq('user_id', user?.id).is('logout_at', null).single()
      .then(({ data }) => setSession(data))
  }

  const startSession = () => {
    if (isDemo) { const s = db.startSession(user?.id); setSession(s); return }
    supabase.from('telecaller_sessions').insert({ user_id: user?.id, login_at: new Date().toISOString(), total_calls: 0 }).select().single()
      .then(({ data }) => setSession(data))
  }

  const endSession = () => {
    if (!session) return
    if (isDemo) { db.endSession(session.id); setSession(null); return }
    supabase.from('telecaller_sessions').update({ logout_at: new Date().toISOString() }).eq('id', session.id)
      .then(() => setSession(null))
  }

  const submitLog = async () => {
    if (!logModal) return
    setSaving(true)
    if (isDemo) {
      db.addCallLog({ client_id: logModal.id, telecaller_id: user?.id, outcome: logForm.outcome, notes: logForm.notes, callback_date: logForm.callback_date || null })
      if (session) { db.incrementCalls(session.id); setSession(s => s ? { ...s, total_calls: (s.total_calls||0)+1 } : s) }
      fetchData()
    } else {
      await supabase.from('call_logs').insert({ client_id: logModal.id, telecaller_id: user?.id, called_at: new Date().toISOString(), outcome: logForm.outcome, notes: logForm.notes, callback_date: logForm.callback_date || null })
      if (session) await supabase.from('telecaller_sessions').update({ total_calls: (session.total_calls||0)+1 }).eq('id', session.id)
      fetchData()
    }
    setSaving(false)
    setLogModal(null)
  }

  const exportCSV = () => {
    const rows = logs.map(l => [
      l.called_at ? format(new Date(l.called_at), 'yyyy-MM-dd HH:mm') : '',
      l.profiles?.full_name || '', l.clients?.name || '', l.clients?.phone || '',
      l.outcome || '', l.notes || '', l.callback_date || '',
    ])
    const csv = ['Date,Telecaller,Client,Phone,Outcome,Notes,Callback\n', ...rows.map(r => r.map(v => `"${v}"`).join(',') + '\n')].join('')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `acs-call-log-${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-accent" />
              <h1 className="text-lg font-bold text-text-primary">Telecalling</h1>
            </div>
            <button onClick={session ? endSession : startSession} className={session ? 'btn-secondary text-red-400 border-red-500/30 text-xs' : 'btn-primary text-xs'}>
              {session ? <><XCircle size={12} className="inline mr-1" />End Session</> : <><CheckCircle size={12} className="inline mr-1" />Start Session</>}
            </button>
          </div>

          {session && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Session active since {format(new Date(session.login_at), 'HH:mm')} · {session.total_calls || 0} calls logged
            </div>
          )}

          {isAdmin && (
            <div className="flex gap-2">
              {['queue', 'logs', 'stats'].map(t => (
                <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${tab === t ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary'}`}>{t}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">

        {/* Queue */}
        {(tab === 'queue' || !isAdmin) && (
          <>
            <p className="text-text-muted text-xs px-1">{queue.length} clients in queue</p>
            {queue.map(client => (
              <div key={client.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-semibold text-sm">{client.name}</p>
                    <p className="text-text-muted text-xs">{client.phone} · {client.business_type}</p>
                    {client.products_used && <p className="text-text-secondary text-xs mt-1">{client.products_used}</p>}
                    {client.expiry_date && <p className="text-text-muted text-xs mt-1">Renewal: {format(new Date(client.expiry_date), 'dd MMM yyyy')}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <a href={`tel:${client.phone}`} className="btn-primary text-xs py-1.5 flex items-center gap-1"><Phone size={11} />Call</a>
                    <button onClick={() => { setLogModal(client); setLogForm({ outcome: '', notes: '', callback_date: '' }) }} className="btn-secondary text-xs py-1.5">Log</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Logs */}
        {tab === 'logs' && isAdmin && (
          <>
            <div className="flex justify-end">
              <button onClick={exportCSV} className="btn-secondary text-xs flex items-center gap-1.5"><Download size={12} />Export CSV</button>
            </div>
            {logs.map(log => (
              <div key={log.id} className="card p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-text-primary text-sm font-medium">{log.clients?.name}</span>
                      <span className={OUTCOME_COLORS[log.outcome] || 'badge-blue'}>{log.outcome}</span>
                    </div>
                    <p className="text-text-muted text-xs mt-0.5">by {log.profiles?.full_name} · {log.called_at ? format(new Date(log.called_at), 'dd MMM HH:mm') : '—'}</p>
                    {log.notes && <p className="text-text-secondary text-xs mt-1">{log.notes}</p>}
                    {log.callback_date && <p className="text-amber-400 text-xs mt-1">Callback: {format(new Date(log.callback_date), 'dd MMM yyyy')}</p>}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Stats */}
        {tab === 'stats' && isAdmin && (
          <div className="space-y-3">
            {staffStats.map(s => (
              <div key={s.id} className="card p-4">
                <p className="text-text-primary font-semibold text-sm">{s.profiles?.full_name}</p>
                <div className="flex gap-4 mt-2 flex-wrap">
                  <span className="text-text-muted text-xs">Login: <span className="text-text-secondary">{s.login_at ? format(new Date(s.login_at), 'dd MMM HH:mm') : '—'}</span></span>
                  {s.logout_at && <span className="text-text-muted text-xs">Logout: <span className="text-text-secondary">{format(new Date(s.logout_at), 'HH:mm')}</span></span>}
                  {s.login_at && s.logout_at && <span className="text-text-muted text-xs">Duration: <span className="text-text-secondary font-mono">{differenceInMinutes(new Date(s.logout_at), new Date(s.login_at))}m</span></span>}
                  <span className="text-text-muted text-xs">Calls: <span className="text-accent font-mono font-bold">{s.total_calls || 0}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!logModal} onClose={() => setLogModal(null)} title={`Log Call — ${logModal?.name}`} size="sm">
        <div className="space-y-3">
          <div>
            <label className="text-text-muted text-xs mb-2 block">Outcome *</label>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOMES.map(o => (
                <button key={o} onClick={() => setLogForm(f => ({ ...f, outcome: o }))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${logForm.outcome === o ? 'bg-accent border-accent text-white' : 'bg-surface border-border text-text-secondary hover:border-accent/50'}`}>{o}</button>
              ))}
            </div>
          </div>
          <div><label className="text-text-muted text-xs mb-1 block">Notes</label><textarea className="input resize-none" rows={2} value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} placeholder="What did they say?" /></div>
          {logForm.outcome === 'Callback scheduled' && (
            <div><label className="text-text-muted text-xs mb-1 block">Callback Date</label><input type="date" className="input" value={logForm.callback_date} onChange={e => setLogForm(f => ({ ...f, callback_date: e.target.value }))} /></div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={() => setLogModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submitLog} disabled={!logForm.outcome || saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving…' : 'Save Log'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
