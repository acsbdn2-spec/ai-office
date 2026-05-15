import { NavLink } from 'react-router-dom'
import { Phone, FileText, RefreshCcw, Users, Headphones, Ticket, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const tabs = [
  { to: '/call',     label: 'Call',     icon: Phone,       module: 'callmode' },
  { to: '/quote',    label: 'Quote',    icon: FileText,    module: 'quotebuilder' },
  { to: '/renewals', label: 'Renew',   icon: RefreshCcw,  module: 'renewals' },
  { to: '/clients',  label: 'Clients', icon: Users,       module: 'clients' },
  { to: '/calls',    label: 'Calls',   icon: Headphones,  module: 'telecalling' },
  { to: '/tickets',  label: 'Tickets', icon: Ticket,      module: 'tickets' },
  { to: '/admin',    label: 'Admin',   icon: Settings,    module: 'admin' },
]

export default function BottomNav({ urgentRenewals = 0, openTickets = 0 }) {
  const { canAccess } = useAuth()
  const visible = tabs.filter(t => canAccess(t.module))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border safe-bottom">
      <div className="flex">
        {visible.slice(0, 5).map(({ to, label, icon: Icon, module }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors relative ${isActive ? 'text-accent' : 'text-text-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-accent/15' : ''}`}>
                  <Icon size={17} />
                </div>
                {label}
                {module === 'renewals' && urgentRenewals > 0 && (
                  <span className="absolute top-1 right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{urgentRenewals > 9 ? '9+' : urgentRenewals}</span>
                )}
                {module === 'tickets' && openTickets > 0 && (
                  <span className="absolute top-1 right-2 bg-accent text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{openTickets > 9 ? '9+' : openTickets}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
