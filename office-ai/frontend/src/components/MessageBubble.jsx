import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const TYPE_STYLES = {
  system:   { bg: 'bg-slate-800/40', border: 'border-slate-700/50', badge: 'bg-slate-700 text-slate-300' },
  task:     { bg: 'bg-blue-950/40',  border: 'border-blue-800/40',  badge: 'bg-blue-900 text-blue-300' },
  result:   { bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', badge: 'bg-emerald-900 text-emerald-300' },
  feedback: { bg: 'bg-amber-950/40', border: 'border-amber-800/40', badge: 'bg-amber-900 text-amber-300' },
  chat:     { bg: 'bg-slate-800/30', border: 'border-slate-700/30', badge: 'bg-slate-700 text-slate-400' },
}

const AGENT_AVATARS = {
  'Chief of Staff': '👑',
  'Manager': '📊',
  'PA': '📅',
  'Advisor': '🎯',
  'Strategist': '🚀',
  'Business Specialist': '💼',
  'Master Coder': '💻',
  'Legal Head': '⚖️',
  'Contract Specialist': '📝',
  'Compliance Officer': '🛡️',
  'IP Specialist': '💡',
  'Employment Law Specialist': '👥',
  'Corporate Law Specialist': '🏛️',
  'Document Agent': '📄',
  'Design Agent': '🎨',
  'Telecalling Agent': '📞',
  'Data Agent': '📊',
}

export default function MessageBubble({ message }) {
  const style = TYPE_STYLES[message.msg_type] || TYPE_STYLES.chat
  const avatar = AGENT_AVATARS[message.sender] || '🤖'
  const isResult = message.msg_type === 'result'

  return (
    <div className={`slide-in rounded-xl border p-3 ${style.bg} ${style.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{avatar}</span>
        <span className="text-xs font-semibold text-slate-200">{message.sender}</span>
        {message.recipient !== 'broadcast' && (
          <>
            <span className="text-slate-600 text-xs">→</span>
            <span className="text-xs text-slate-400">{message.recipient}</span>
          </>
        )}
        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium ${style.badge}`}>
          {message.msg_type}
        </span>
        <span className="text-[10px] text-slate-600">{message.timestamp}</span>
      </div>

      <div className={`text-xs leading-relaxed prose-dark ${isResult ? 'max-h-96 overflow-y-auto' : 'max-h-48 overflow-y-auto'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
