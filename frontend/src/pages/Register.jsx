import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import SocialAuthModal from '../components/SocialAuthModal'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]         = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  // Social Auth Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [provider, setProvider]   = useState('Google')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) { toast.error('All fields required'); return }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      await register(form.full_name, form.email, form.password)
      toast.success('Account created! 🎉 Welcome to SmartLoan AI')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenSocialModal = (p) => {
    setProvider(p)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen hero-rgb-mesh flex items-center justify-center px-6 py-12">
      {/* Social OAuth Modal */}
      <SocialAuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        provider={provider}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-blue via-brand-purple to-brand-pink flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-normal leading-tight mb-2">
            Create your account
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Get instant AI loan predictions & credit risk analysis
          </p>
        </div>

        {/* Card */}
        <div className="glass p-8 border-white/10 shadow-glow-card">
          {/* Social Sign-up Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleOpenSocialModal('Google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl glass-light hover:bg-white/10 border border-white/10 transition-all text-sm font-semibold text-white shadow-glow-blue"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-1.5-1.3-3.2-1.3-5z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
              </svg>
              <span>Sign up with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenSocialModal('GitHub')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl glass-light hover:bg-white/10 border border-white/10 transition-all text-sm font-semibold text-white"
            >
              <svg className="w-5 h-5 fill-current flex-shrink-0 text-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Sign up with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">or email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  name="full_name"
                  placeholder="Jane Smith"
                  value={form.full_name}
                  onChange={handleChange}
                  className="input-glass pl-11 py-3 text-sm leading-normal"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="input-glass pl-11 py-3 text-sm leading-normal"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="input-glass pl-11 pr-12 py-3 text-sm leading-normal"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-confirm"
                  type={showPass ? 'text' : 'password'}
                  name="confirm"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                  className="input-glass pl-11 py-3 text-sm leading-normal"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="btn-neon-rgb w-full flex items-center justify-center gap-2 py-3.5 mt-4 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-bold tracking-wide">Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6 font-medium">
            Already registered?{' '}
            <Link to="/login" className="gradient-text-cyan font-bold hover:underline">
              Sign in to account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
