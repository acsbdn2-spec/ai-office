import { NavLink } from 'react-router-dom'
import { Phone, FileText, RefreshCcw, Users, Headphones, Ticket, Settings, LogOut, AlertTriangle } from 'lucide-react'
import ACSLogo from '../UI/ACSLogo'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/call',     label: 'Call Mode',        icon: Phone,       module: 'callmode' },
  { to: '/quote',    label: 'Quote Builder',     icon: FileText,    module: 'quotebuilder' },
  { to: '/renewals', label: 'Renewals',          icon: RefreshCcw,  module: 'renewals' },
  { to: '/clients',  label: 'Client Tracker',    icon: Users,       module: 'clients' },
  { to: '/calls',    label: 'Telecalling',        icon: Headphones,  module: 'telecalling' },
  { to: '/tickets',  label: 'Tickets',            icon: Ticket,      module: 'tickets' },
  { to: '/admin',    label: 'Admin',              icon: Settings,    module: 'admin' },
]

export default function Sidebar({ urgentRenewals = 0, openTickets = 0 }) {
  const { profile, signOut, canAccess } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-56 bg-surface border-r border-border h-screen sticky top-0 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <ACSLogo size={36} />
        <div>
          <p className="text-text-primary font-bold text-sm leading-tight">Advanced Computer</p>
          <p className="text-accent text-xs font-semibold">System, Burdwan</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, module }) => {
          if (!canAccess(module)) return null
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} relative`}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {module === 'renewals' && urgentRenewals > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{urgentRenewals}</span>
              )}
              {module === 'tickets' && openTickets > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{openTickets}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-xs font-medium truncate">{profile?.full_name ?? 'User'}</p>
            <p className="text-text-muted text-[10px] capitalize">{profile?.role}</p>
          </div>
        </div>
        <button onClick={signOut} className="nav-item w-full text-text-muted hover:text-red-400 hover:bg-red-500/10">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
