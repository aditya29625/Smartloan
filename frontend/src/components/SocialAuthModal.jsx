import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function SocialAuthModal({ isOpen, onClose, provider = 'Google' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const DEMO_ACCOUNTS = [
    { name: 'Aditya Singh', email: 'aditya.rajput@gmail.com', avatar: 'AS', bg: 'from-blue-500 to-purple-600' },
    { name: 'Demo User',    email: 'demo.user@gmail.com',    avatar: 'DU', bg: 'from-emerald-500 to-cyan-500' },
    { name: 'Test Account', email: 'test@smartloan.ai',      avatar: 'TA', bg: 'from-pink-500 to-rose-600' },
  ]

  // Generate a consistent password tied to the email — never changes per account
  const makePassword = (email) =>
    'SL_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) + '_2025!'

  const handleSelectAccount = async (account) => {
    setSelectedEmail(account.email)
    setLoading(true)
    setError(null)

    const password = makePassword(account.email)

    try {
      // 1️⃣ Try to register (first-time user)
      try {
        await register(account.name, account.email, password)
        toast.success(`Welcome, ${account.name.split(' ')[0]}! 🎉`)
        onClose()
        navigate('/dashboard')
        return
      } catch (regErr) {
        // If it's NOT a "already exists" error, rethrow
        const status = regErr?.response?.status
        if (status !== 400 && status !== 409 && status !== 422) {
          throw regErr
        }
      }

      // 2️⃣ Already registered → just login
      await login(account.email, password)
      toast.success(`Welcome back, ${account.name.split(' ')[0]}! 👋`)
      onClose()
      navigate('/dashboard')

    } catch (err) {
      console.error('Social auth error:', err)
      const msg = err?.response?.data?.detail || err?.message || 'Authentication failed. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
      setSelectedEmail(null)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-sm glass border-white/10 p-6 rounded-3xl shadow-glow-purple relative overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 shadow-glow-blue">
              {provider === 'Google' ? (
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-1.5-1.3-3.2-1.3-5z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">Sign in with {provider}</h3>
            <p className="text-xs text-slate-400 mt-1">Choose an account to continue to SmartLoan AI</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Selection */}
          <div className="space-y-3 mb-6">
            {DEMO_ACCOUNTS.map((acc) => {
              const isActive = loading && selectedEmail === acc.email
              return (
                <button
                  key={acc.email}
                  disabled={loading}
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-light border border-white/10 hover:border-purple-500/40 hover:bg-white/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${acc.bg} text-white font-bold flex items-center justify-center text-xs shadow-lg`}>
                      {acc.avatar}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{acc.name}</p>
                      <p className="text-xs text-slate-500">{acc.email}</p>
                    </div>
                  </div>
                  {isActive ? (
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-600">
            By continuing, you agree to SmartLoan AI's Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
