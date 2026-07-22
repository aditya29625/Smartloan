import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User as UserIcon, Mail, Calendar, BarChart2, CheckCircle, Edit2, Save, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import { profileApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    profileApi.get().then((r) => {
      setProfile(r.data)
      setName(r.data.full_name)
    }).catch(() => toast.error('Failed to load profile'))
  }, [])

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      await profileApi.update({ full_name: name.trim() })
      setProfile((p) => ({ ...p, full_name: name.trim() }))
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const stats = profile?.stats || {}

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="lg:ml-64 pt-20 lg:pt-0 p-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
          <UserIcon className="w-6 h-6 text-primary-400" /> My Profile
        </h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center
                            text-white font-bold text-2xl flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {/* Name with edit */}
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                {editing ? (
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className="input-glass text-lg font-semibold py-1 px-3 w-full max-w-xs" />
                ) : (
                  <h2 className="text-xl font-bold text-white">{profile?.full_name}</h2>
                )}
                {editing ? (
                  <div className="flex gap-1">
                    <button onClick={handleSave} disabled={saving}
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditing(false); setName(profile?.full_name) }}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {profile?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {profile?.member_since
                    ? new Date(profile.member_since).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>

              {profile?.is_admin && (
                <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full
                                 bg-primary-500/20 text-primary-400 border border-primary-500/30 font-semibold">
                  Admin
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary-400" /> Your Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Predictions', value: stats.total_predictions ?? '—', color: 'text-primary-400' },
              { label: 'Approved',          value: stats.approved_predictions ?? '—', color: 'text-emerald-400' },
              { label: 'Approval Rate',     value: stats.approval_rate != null ? `${stats.approval_rate}%` : '—', color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-light rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
