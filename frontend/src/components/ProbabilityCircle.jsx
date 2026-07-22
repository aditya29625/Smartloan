import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  Approved: { ring: 'rgb(16, 185, 129)', glow: 'rgba(16, 185, 129, 0.5)', text: 'text-emerald-400', label: 'Approved' },
  Review:   { ring: 'rgb(245, 158, 11)', glow: 'rgba(245, 158, 11, 0.5)', text: 'text-amber-400',   label: 'Under Review' },
  Rejected: { ring: 'rgb(244, 63, 94)',  glow: 'rgba(244, 63, 94, 0.5)',  text: 'text-rose-400',    label: 'Rejected' },
}

export default function ProbabilityCircle({ probability = 0, status = 'Review' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Review
  const clamp  = Math.max(0, Math.min(100, probability))

  const radius        = 56
  const circumference = 2 * Math.PI * radius
  const dashOffset    = circumference * (1 - clamp / 100)

  return (
    <div className="flex flex-col items-center">
      <div className="relative p-3 rounded-full bg-slate-900/60 border border-white/10 shadow-glow-card">
        <svg width="144" height="144" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r={radius}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />

          <motion.circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke={config.ring}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            transform="rotate(-90 72 72)"
            style={{ filter: `drop-shadow(0 0 10px ${config.glow})` }}
          />

          <text x="72" y="64" textAnchor="middle"
            fill="#ffffff" fontSize="28" fontWeight="800" fontFamily="Inter">
            {clamp.toFixed(0)}%
          </text>
          <text x="72" y="84" textAnchor="middle"
            fill="rgba(148, 163, 184, 0.8)" fontSize="11" fontWeight="600" fontFamily="Inter">
            Default Prob.
          </text>
        </svg>
      </div>
      <span className={`mt-3 text-base font-extrabold tracking-wide ${config.text}`}>
        {config.label}
      </span>
    </div>
  )
}
