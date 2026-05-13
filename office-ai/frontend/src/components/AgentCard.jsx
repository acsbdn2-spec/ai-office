export default function AgentCard({ agent, isActive }) {
  const statusColor = {
    idle: '#64748b',
    thinking: '#f59e0b',
    working: '#22c55e',
  }[agent.status] || '#64748b'

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-default transition-all ${
        isActive ? 'bg-slate-700/60' : 'hover:bg-slate-800/60'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: agent.color + '33', border: `1px solid ${agent.color}55` }}
        >
          {agent.avatar}
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
          style={{ background: statusColor }}
        />
        {agent.status !== 'idle' && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full pulse-dot"
            style={{ background: statusColor, opacity: 0.5 }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-200 truncate">{agent.name}</p>
        <p className="text-[10px] text-slate-500 truncate">{agent.role}</p>
      </div>

      {agent.total_tasks > 0 && (
        <div className="flex-shrink-0 text-right">
          <p className="text-[10px] text-slate-400">{agent.avg_score}/10</p>
        </div>
      )}
    </div>
  )
}
