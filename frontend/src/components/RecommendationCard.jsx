import { AlertTriangle, CheckCircle2, Info, Lightbulb } from 'lucide-react'

const STATUS_STYLES = {
  Approved: {
    card:   'border-brand-emerald/40 bg-brand-emerald/10 shadow-glow-emerald',
    icon:   <CheckCircle2 className="w-6 h-6 text-brand-emerald" />,
    title:  'text-brand-emerald',
    bullet: 'bg-brand-emerald',
  },
  Review: {
    card:   'border-brand-amber/40 bg-brand-amber/10',
    icon:   <Info className="w-6 h-6 text-brand-amber" />,
    title:  'text-brand-amber',
    bullet: 'bg-brand-amber',
  },
  Rejected: {
    card:   'border-brand-rose/40 bg-brand-rose/10',
    icon:   <AlertTriangle className="w-6 h-6 text-brand-rose" />,
    title:  'text-brand-rose',
    bullet: 'bg-brand-rose',
  },
}

export default function RecommendationCard({ status = 'Review', reasons = [], suggestions = [] }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.Review

  return (
    <div className={`glass p-6 rounded-2xl border ${styles.card} space-y-5`}>
      {/* Decision Status */}
      <div className="flex items-center gap-3">
        {styles.icon}
        <h3 className={`text-lg font-black tracking-wide ${styles.title}`}>Loan Decision: {status}</h3>
      </div>

      {/* Reasons */}
      {reasons.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3">
            Risk Factor Diagnosis
          </p>
          <ul className="space-y-2">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200 font-medium">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${styles.bullet}`} />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-brand-amber" /> Recommendations to Improve Score
          </p>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200 font-medium">
                <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-brand-cyan" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
