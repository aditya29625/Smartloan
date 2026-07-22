import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar
} from 'recharts'
import {
  LayoutDashboard, TrendingUp, CheckCircle2, XCircle, AlertTriangle,
  Activity, Clock, RefreshCw, Sparkles
} from 'lucide-react'
import Navbar from '../components/Navbar'
import StatsCard from '../components/StatsCard'
import { dashboardApi } from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const RISK_RGB_COLORS = { 'Low Risk': 'rgb(16, 185, 129)', 'Medium Risk': 'rgb(245, 158, 11)', 'High Risk': 'rgb(244, 63, 94)' }
const STATUS_BADGE = {
  Approved: 'badge-approved', Rejected: 'badge-rejected', Review: 'badge-review',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass p-3 text-xs border border-white/10 shadow-glow-purple">
      <p className="text-white font-bold mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await dashboardApi.get()
      setData(res.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const stats = data?.stats || {}

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="lg:ml-64 pt-20 lg:pt-6 p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <LayoutDashboard className="w-7 h-7 text-brand-purple" />
              Risk Analytics Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, <span className="text-white font-semibold">{user?.full_name}</span>
            </p>
          </div>
          <button onClick={fetchData}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-4 py-2.5
                       rounded-xl glass hover:bg-white/10 transition-all border border-white/10">
            <RefreshCw className={`w-4 h-4 text-brand-cyan ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard title="Total Predictions" value={stats.total_predictions ?? '—'}
            icon={Activity} color="primary" delay={0} />
          <StatsCard title="Approved Loans" value={stats.approved ?? '—'}
            subtitle={`${stats.approval_rate ?? 0}% approval rate`}
            icon={CheckCircle2} color="emerald" delay={0.1} />
          <StatsCard title="Rejected Loans" value={stats.rejected ?? '—'}
            icon={XCircle} color="red" delay={0.2} />
          <StatsCard title="Avg Risk Score" value={stats.avg_risk_score ?? '—'}
            subtitle={`${stats.avg_probability ?? 0}% avg default prob`}
            icon={TrendingUp} color="purple" delay={0.3} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Risk Pie Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="glass p-6 border-white/10">
            <h2 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-purple" /> Risk Distribution
            </h2>
            {data?.risk_distribution?.length ? (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={data.risk_distribution} dataKey="value" nameKey="label"
                    cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4}>
                    {data.risk_distribution.map((entry) => (
                      <Cell key={entry.label} fill={RISK_RGB_COLORS[entry.label] || 'rgb(99, 102, 241)'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
                No predictions recorded yet
              </div>
            )}
            <div className="flex justify-center gap-4 mt-3">
              {Object.entries(RISK_RGB_COLORS).map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <span className="w-3 h-3 rounded-full shadow-glow-purple" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Predictions Line Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
            className="glass p-6 lg:col-span-2 border-white/10">
            <h2 className="font-bold text-white text-base mb-4">Monthly Prediction Trends</h2>
            {data?.monthly_data?.length ? (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={data.monthly_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="total"    stroke="rgb(99, 102, 241)" strokeWidth={3} dot={{ r: 4 }} name="Total" />
                  <Line type="monotone" dataKey="approved" stroke="rgb(16, 185, 129)" strokeWidth={3} dot={{ r: 4 }} name="Approved" />
                  <Line type="monotone" dataKey="rejected" stroke="rgb(244, 63, 94)"  strokeWidth={3} dot={{ r: 4 }} name="Rejected" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
                No monthly trends data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Status Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="glass p-6 border-white/10">
            <h2 className="font-bold text-white text-base mb-4">Approval vs Rejection Breakdown</h2>
            {data?.monthly_data?.length ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={data.monthly_data} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="approved" fill="rgb(16, 185, 129)" name="Approved" radius={[6,6,0,0]} />
                  <Bar dataKey="review"   fill="rgb(245, 158, 11)" name="Review"   radius={[6,6,0,0]} />
                  <Bar dataKey="rejected" fill="rgb(244, 63, 94)"  name="Rejected" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No data available</div>
            )}
          </motion.div>

          {/* Recent Predictions */}
          <motion.div initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="glass p-6 border-white/10">
            <h2 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-purple" /> Recent Applicant Assessments
            </h2>
            <div className="space-y-3">
              {data?.recent_predictions?.length ? data.recent_predictions.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl glass-light border-white/5">
                  <div>
                    <p className="text-sm text-white font-bold">
                      ₹{p.loan_amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 font-mono font-semibold">{p.probability?.toFixed(1)}%</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_BADGE[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No predictions yet — <a href="/predict" className="text-brand-purple font-semibold">Make one now!</a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
