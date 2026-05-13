import { useState, useEffect, useCallback } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import OrgPanel from './components/OrgPanel'
import FeedPanel from './components/FeedPanel'
import OutputPanel from './components/OutputPanel'
import TaskInput from './components/TaskInput'

const WS_URL = `ws://${window.location.hostname}:8000/ws`
const API = `http://${window.location.hostname}:8000`

export default function App() {
  const { messages, connected } = useWebSocket(WS_URL)
  const [agents, setAgents] = useState([])
  const [tasks, setTasks] = useState([])

  // Poll agents for live status
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const r = await fetch(`${API}/api/agents`)
        const data = await r.json()
        setAgents(data.agents || [])
      } catch (_) {}
    }
    fetchAgents()
    const id = setInterval(fetchAgents, 1500)
    return () => clearInterval(id)
  }, [])

  // Poll tasks for final output
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const r = await fetch(`${API}/api/tasks`)
        const data = await r.json()
        setTasks(data.tasks || [])
      } catch (_) {}
    }
    fetchTasks()
    const id = setInterval(fetchTasks, 2000)
    return () => clearInterval(id)
  }, [])

  const handleSubmit = useCallback(async (text) => {
    try {
      await fetch(`${API}/api/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
    } catch (e) {
      alert('Could not reach backend. Make sure the server is running on port 8000.')
    }
  }, [])

  const activeCount = agents.filter((a) => a.status !== 'idle').length

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1e]">
      {/* Header */}
      <header className="flex-shrink-0 h-12 border-b border-slate-800 flex items-center px-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <span className="font-semibold text-slate-200 text-sm tracking-tight">Office AI</span>
          <span className="text-slate-700 text-xs">|</span>
          <span className="text-slate-500 text-xs">Autonomous Agent Workspace</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {activeCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />
              {activeCount} agent{activeCount !== 1 ? 's' : ''} working
            </div>
          )}
          <div className={`flex items-center gap-1 text-[11px] ${connected ? 'text-emerald-500' : 'text-red-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Agent roster */}
        <aside className="w-52 flex-shrink-0 border-r border-slate-800 bg-slate-900/30 overflow-hidden">
          <OrgPanel agents={agents} />
        </aside>

        {/* Center — Live feed */}
        <main className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
          <div className="flex-1 overflow-hidden">
            <FeedPanel messages={messages} connected={connected} />
          </div>

          {/* Task input at bottom of center */}
          <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900/40 p-3">
            <TaskInput onSubmit={handleSubmit} disabled={!connected} />
          </div>
        </main>

        {/* Right — Output */}
        <aside className="w-80 flex-shrink-0 bg-slate-900/30 overflow-hidden">
          <OutputPanel tasks={tasks} />
        </aside>
      </div>
    </div>
  )
}
