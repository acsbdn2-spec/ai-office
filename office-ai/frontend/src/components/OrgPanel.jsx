import AgentCard from './AgentCard'

const DEPARTMENTS = [
  { label: 'Executive', color: '#f59e0b', agents: ['Chief of Staff', 'Manager'] },
  { label: 'Advisory', color: '#10b981', agents: ['Advisor', 'Strategist', 'PA'] },
  { label: 'Business', color: '#0ea5e9', agents: ['Business Specialist'] },
  { label: 'Technology', color: '#22c55e', agents: ['Master Coder'] },
  { label: 'Legal', color: '#dc2626', agents: ['Legal Head', 'Contract Specialist', 'Compliance Officer', 'IP Specialist', 'Employment Law Specialist', 'Corporate Law Specialist'] },
  { label: 'Operations & Creative', color: '#8b5cf6', agents: ['Document Agent', 'Design Agent', 'Telecalling Agent', 'Data Agent'] },
]

export default function OrgPanel({ agents }) {
  const agentMap = Object.fromEntries((agents || []).map((a) => [a.name, a]))

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Roster</h2>
        <p className="text-[10px] text-slate-600 mt-0.5">{agents?.length || 0} agents active</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.label}>
            <div className="flex items-center gap-2 px-2 mb-1">
              <div className="h-px flex-1 opacity-30" style={{ background: dept.color }} />
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: dept.color }}>
                {dept.label}
              </span>
              <div className="h-px flex-1 opacity-30" style={{ background: dept.color }} />
            </div>
            <div className="space-y-0.5">
              {dept.agents.map((name) => {
                const agent = agentMap[name]
                if (!agent) return null
                return <AgentCard key={name} agent={agent} isActive={agent.status !== 'idle'} />
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
