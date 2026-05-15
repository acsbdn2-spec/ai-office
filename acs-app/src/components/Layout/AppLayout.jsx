import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function AppLayout() {
  const { user, profile } = useAuth()
  const [urgentRenewals, setUrgentRenewals] = useState(0)
  const [openTickets, setOpenTickets] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchBadges = async () => {
      const today = new Date().toISOString().split('T')[0]
      const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

      const { count: rc } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .lte('expiry_date', in30)

      const query = supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress', 'pending_client'])

      if (profile?.role !== 'admin') {
        query.eq('assigned_to', user.id)
      }

      const { count: tc } = await query

      setUrgentRenewals(rc ?? 0)
      setOpenTickets(tc ?? 0)
    }
    fetchBadges()
  }, [user, profile])

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar urgentRenewals={urgentRenewals} openTickets={openTickets} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomNav urgentRenewals={urgentRenewals} openTickets={openTickets} />
    </div>
  )
}
