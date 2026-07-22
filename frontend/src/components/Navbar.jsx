import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Brain, History, User, LogOut,
  Menu, X, ChevronRight, Sparkles, Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/predict',   label: 'Predict Risk',icon: Brain },
  { path: '/history',   label: 'History',    icon: History },
  { path: '/profile',   label: 'Profile',    icon: User },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-40 glass border-r border-white/10">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue via-brand-purple to-brand-pink flex items-center justify-center shadow-glow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-base leading-tight tracking-wide">SmartLoan</p>
            <p className="text-xs font-semibold gradient-text-cyan">AI Platform</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  active
                    ? 'bg-gradient-to-r from-brand-indigo/30 to-brand-purple/20 text-white border border-brand-indigo/40 shadow-glow-purple'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-brand-purple' : 'text-slate-400'}`} />
                <span>{label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto text-brand-purple" />}
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="glass-light p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-indigo/30 border border-brand-indigo/40 flex items-center justify-center font-bold text-sm text-brand-purple">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ───────────────────────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-white text-base">SmartLoan AI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl glass text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 glass border-b border-white/10 p-4 space-y-2"
            >
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <Icon className="w-5 h-5 text-brand-purple" />
                  <span>{label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
