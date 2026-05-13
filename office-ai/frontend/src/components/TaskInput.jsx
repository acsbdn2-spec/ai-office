import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

const EXAMPLES = [
  'Draft an NDA between our company and a freelance developer',
  'Write a cold call script for selling HR software to mid-size companies',
  'Build a Python script that reads a CSV and generates a sales report',
  'Create a business plan for a legal tech startup',
  'Design a poster spec for our product launch event',
  'Set up a client CRM database schema for a consulting firm',
  'Draft an employment offer letter for a senior engineer',
  'Write an email outreach sequence for B2B SaaS prospects',
]

export default function TaskInput({ onSubmit, disabled }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!value.trim() || loading) return
    setLoading(true)
    await onSubmit(value.trim())
    setValue('')
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Describe what you need… (Ctrl+Enter to send)"
          disabled={loading || disabled}
          rows={4}
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading || disabled}
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider">Quick examples</p>
        <div className="flex flex-wrap gap-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setValue(ex)}
              className="text-[10px] px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-all"
            >
              {ex.slice(0, 36)}…
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
