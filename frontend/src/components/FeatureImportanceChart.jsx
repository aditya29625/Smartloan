import { motion } from 'framer-motion'

export default function FeatureImportanceChart({ data = {} }) {
  if (!data || Object.keys(data).length === 0) return null

  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const max = entries[0]?.[1] || 1

  const LABEL_MAP = {
    credit_score:              'Credit Score',
    income:                    'Annual Income',
    loan_amount:               'Loan Amount',
    existing_emi:              'Existing EMI Burden',
    age:                       'Applicant Age',
    years_of_experience:       'Work Experience',
    dependents:                'Dependents Count',
    debt_to_income:            'Debt-to-Income Ratio',
    loan_to_income:            'Loan-to-Income Ratio',
    emi_to_income:             'EMI-to-Income Ratio',
    employment_type_encoded:   'Employment Type',
    marital_status_encoded:    'Marital Status',
    education_encoded:         'Education Level',
    loan_term:                 'Loan Term Duration',
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, value], i) => {
        const pct = (value / max) * 100
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">{LABEL_MAP[key] || key}</span>
              <span className="gradient-text-cyan font-bold">{value.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, rgb(59, 130, 246), rgb(168, 85, 247), rgb(236, 72, 153))` }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
