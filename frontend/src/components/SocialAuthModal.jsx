import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function SocialAuthModal({ isOpen, onClose, provider = 'Google' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState(null)

  if (!isOpen) return null

  const DEMO_ACCOUNTS = [
    { name: 'Aditya Singh', email: 'aditya.rajput@gmail.com', avatar: 'A', bg: 'bg-brand-blue' },
    { name: 'Demo User',    email: 'demo.user@gmail.com',    avatar: 'D', bg: 'bg-brand-purple' },
  ]

  const handleSelectAccount = async (account) => {
    setSelectedEmail(account.email)
    setLoading(true)
    try {
      try {
        await register(account.name, account.email, 'googleAuth123!')
      } catch {
        await login(account.email, 'googleAuth123!')
      }
      toast.success(`Signed in as ${account.email} with ${provider}! 🎉`)
      onClose()
      navigate('/dashboard')
    } catch {
      await login('test@smartloan.ai', 'test1234')
      toast.success(`Signed in with ${provider}!`)
      onClose()
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm glass border-white/10 p-6 rounded-3xl shadow-glow-purple relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 shadow-glow-blue">
              {provider === 'Google' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-1.5-1.3-3.2-1.3-5z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">Sign in with {provider}</h3>
            <p className="text-xs text-slate-400 mt-1">Choose an account to continue to SmartLoan AI</p>
          </div>

          {/* Account Selection */}
          <div className="space-y-3 mb-6">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                disabled={loading}
                onClick={() => handleSelectAccount(acc)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-light border-white/10 hover:border-brand-purple/40 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${acc.bg} text-white font-bold flex items-center justify-center text-sm shadow-glow-purple`}>
                    {acc.avatar}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-brand-purple transition-colors">{acc.name}</p>
                    <p className="text-xs text-slate-400">{acc.email}</p>
                  </div>
                </div>

                {loading && selectedEmail === acc.email ? (
                  <div className="w-5 h-5 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-slate-600 group-hover:text-brand-emerald transition-colors" />
                )}
              </button>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-500 font-medium">
            To continue, Google will share your name and email address with SmartLoan AI.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
