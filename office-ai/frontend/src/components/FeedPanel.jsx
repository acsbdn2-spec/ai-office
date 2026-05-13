import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import { Activity } from 'lucide-react'

export default function FeedPanel({ messages, connected }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-slate-400" />
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Agent Feed</h2>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-[10px] text-slate-500">{connected ? 'Connected' : 'Reconnecting…'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 text-sm">
            <span className="text-4xl mb-3">🏢</span>
            <p>Submit a task to see your team in action.</p>
            <p className="text-xs mt-1 text-slate-700">Agents will talk to each other here in real-time.</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
