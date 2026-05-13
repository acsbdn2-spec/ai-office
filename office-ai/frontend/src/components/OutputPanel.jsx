import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ClipboardCopy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function OutputPanel({ tasks }) {
  const [copied, setCopied] = useState(false)
  const latest = tasks?.filter((t) => t.final_output)?.slice(-1)[0]

  const copy = () => {
    if (!latest?.final_output) return
    navigator.clipboard.writeText(latest.final_output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Final Output</h2>
        {latest && (
          <button
            onClick={copy}
            className="ml-auto flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            {copied ? (
              <><CheckCircle className="w-3 h-3 text-emerald-400" /> Copied</>
            ) : (
              <><ClipboardCopy className="w-3 h-3" /> Copy</>
            )}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!latest ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 text-xs text-center">
            <span className="text-3xl mb-2">📋</span>
            <p>Final compiled output will appear here</p>
            <p className="mt-1">after all agents complete their work.</p>
          </div>
        ) : (
          <div className="prose-dark text-xs leading-relaxed">
            <div className="mb-3 px-2 py-1 bg-emerald-900/30 border border-emerald-800/40 rounded text-emerald-400 text-[10px]">
              ✅ Task complete — compiled by Chief of Staff
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {latest.final_output}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {tasks && tasks.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-800">
          <p className="text-[10px] text-slate-600">{tasks.length} task{tasks.length !== 1 ? 's' : ''} processed this session</p>
        </div>
      )}
    </div>
  )
}
