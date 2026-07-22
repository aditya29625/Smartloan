import { motion } from 'framer-motion'

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'primary', delay = 0 }) {
  const styles = {
    primary: {
      bg: 'from-brand-blue/15 to-brand-purple/5',
      border: 'border-brand-blue/30',
      iconBg: 'bg-brand-blue/20 text-brand-blue shadow-glow-blue',
      valueText: 'gradient-text-cyan',
    },
    emerald: {
      bg: 'from-brand-emerald/15 to-brand-cyan/5',
      border: 'border-brand-emerald/30',
      iconBg: 'bg-brand-emerald/20 text-brand-emerald shadow-glow-emerald',
      valueText: 'text-emerald-400',
    },
    red: {
      bg: 'from-brand-rose/15 to-brand-pink/5',
      border: 'border-brand-rose/30',
      iconBg: 'bg-brand-rose/20 text-brand-rose',
      valueText: 'text-rose-400',
    },
    purple: {
      bg: 'from-brand-purple/15 to-brand-pink/5',
      border: 'border-brand-purple/30',
      iconBg: 'bg-brand-purple/20 text-brand-purple shadow-glow-purple',
      valueText: 'gradient-text-rgb',
    },
  }

  const s = styles[color] || styles.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={`glass p-6 rounded-2xl border bg-gradient-to-br ${s.bg} ${s.border} glass-hover`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{title}</p>
          <p className={`text-3xl font-extrabold mt-2 ${s.valueText}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
