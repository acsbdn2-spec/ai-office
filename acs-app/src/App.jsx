import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PinProvider } from './contexts/PinContext'
import AppLayout from './components/Layout/AppLayout'
import LoginPage from './modules/Auth/LoginPage'
import Dashboard from './modules/Dashboard/Dashboard'
import CallMode from './modules/CallMode/CallMode'
import QuoteBuilder from './modules/QuoteBuilder/QuoteBuilder'
import RenewalsDashboard from './modules/Renewals/RenewalsDashboard'
import ClientTracker from './modules/ClientTracker/ClientTracker'
import Telecalling from './modules/Telecalling/Telecalling'
import TicketSystem from './modules/Tickets/TicketSystem'
import AdminPanel from './modules/Admin/AdminPanel'
import { useLocation } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function QuoteBuilderWrapper() {
  const location = useLocation()
  const state = location.state || {}
  return <QuoteBuilder key={JSON.stringify(state)} initialItems={state.initialItems || []} initialClient={state.initialClient || null} />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/call" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/call" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="call" element={<CallMode />} />
        <Route path="quote" element={<QuoteBuilderWrapper />} />
        <Route path="renewals" element={<RenewalsDashboard />} />
        <Route path="clients" element={<ClientTracker />} />
        <Route path="calls" element={<Telecalling />} />
        <Route path="tickets" element={<TicketSystem />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
      <Route path="*" element={<Navigate to="/call" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PinProvider>
          <AppRoutes />
        </PinProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
