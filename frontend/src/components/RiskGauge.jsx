import { motion } from 'framer-motion'

const RISK_CONFIG = {
  Low:    { stroke: 'rgb(16, 185, 129)', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400', label: 'Low Risk' },
  Medium: { stroke: 'rgb(245, 158, 11)', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400',   label: 'Medium Risk' },
  High:   { stroke: 'rgb(244, 63, 94)',  glow: 'rgba(244, 63, 94, 0.4)',  text: 'text-rose-400',    label: 'High Risk' },
}

export default function RiskGauge({ riskScore = 0, riskLabel = 'Low' }) {
  const config = RISK_CONFIG[riskLabel] || RISK_CONFIG.Low

  const cx = 100, cy = 100, r = 75
  const startAngle = -200, endAngle = 20
  const totalAngle = endAngle - startAngle

  const toRad = (deg) => (deg * Math.PI) / 180
  const arcX = (deg) => cx + r * Math.cos(toRad(deg))
  const arcY = (deg) => cy + r * Math.sin(toRad(deg))

  const trackStart = { x: arcX(startAngle), y: arcY(startAngle) }
  const trackEnd   = { x: arcX(endAngle),   y: arcY(endAngle) }

  const clampedScore = Math.max(0, Math.min(100, riskScore))
  const fillAngle    = startAngle + (clampedScore / 100) * totalAngle
  const fillEnd      = { x: arcX(fillAngle), y: arcY(fillAngle) }
  const largeArc     = (fillAngle - startAngle) > 180 ? 1 : 0

  const trackPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`
  const fillPath  = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative p-2 rounded-3xl bg-slate-900/60 border border-white/10 shadow-glow-card">
        <svg viewBox="0 0 200 150" className="w-52 h-40">
          {/* Ticks */}
          {[0, 25, 50, 75, 100].map((val) => {
            const angle = startAngle + (val / 100) * totalAngle
            const x1 = cx + 63 * Math.cos(toRad(angle))
            const y1 = cy + 63 * Math.sin(toRad(angle))
            const x2 = cx + 71 * Math.cos(toRad(angle))
            const y2 = cy + 71 * Math.sin(toRad(angle))
            return (
              <line key={val} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" />
            )
          })}

          {/* Background Arc */}
          <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.08)"
            strokeWidth="13" strokeLinecap="round" />

          {/* Glowing Animated Arc */}
          <motion.path
            d={fillPath}
            fill="none"
            stroke={config.stroke}
            strokeWidth="13"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 10px ${config.glow})` }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          />

          {/* Score text */}
          <text x={cx} y={cy + 8} textAnchor="middle"
            fill="#ffffff" fontSize="30" fontWeight="800" fontFamily="Inter">
            {clampedScore}
          </text>
          <text x={cx} y={cy + 26} textAnchor="middle"
            fill="rgba(148, 163, 184, 0.8)" fontSize="11" fontWeight="600" fontFamily="Inter">
            Risk Score / 100
          </text>
        </svg>
      </div>
      <span className={`mt-3 text-base font-extrabold tracking-wide ${config.text}`}>
        {config.label}
      </span>
    </div>
  )
}
