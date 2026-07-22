import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Send, Download, RotateCcw } from 'lucide-react'
import Navbar from '../components/Navbar'
import RiskGauge from '../components/RiskGauge'
import ProbabilityCircle from '../components/ProbabilityCircle'
import FeatureImportanceChart from '../components/FeatureImportanceChart'
import RecommendationCard from '../components/RecommendationCard'
import { predictionApi } from '../api/axios'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

const INITIAL_FORM = {
  age: '', income: '', employment_type: 'Salaried', credit_score: '',
  loan_amount: '', existing_emi: '', loan_term: '36',
  years_of_experience: '', marital_status: 'Single',
  education: 'Bachelor', dependents: '0',
}

const FIELD_CONFIG = [
  { key: 'age',                 label: 'Age',                  type: 'number', placeholder: '25–65', min: 18, max: 80 },
  { key: 'income',              label: 'Annual Income (₹)',     type: 'number', placeholder: 'e.g. 600000' },
  { key: 'credit_score',        label: 'Credit Score',         type: 'number', placeholder: '300–850', min: 300, max: 850 },
  { key: 'loan_amount',         label: 'Loan Amount (₹)',      type: 'number', placeholder: 'e.g. 500000' },
  { key: 'existing_emi',        label: 'Existing EMI/mo (₹)',  type: 'number', placeholder: 'e.g. 8000' },
  { key: 'years_of_experience', label: 'Years of Experience',  type: 'number', placeholder: '0–40', min: 0, max: 40 },
]

const SELECT_CONFIG = [
  { key: 'employment_type', label: 'Employment Type',
    options: ['Salaried','Self-Employed','Business','Freelancer','Unemployed'] },
  { key: 'marital_status',  label: 'Marital Status',
    options: ['Single','Married','Divorced','Widowed'] },
  { key: 'education',       label: 'Education Level',
    options: ['High School','Bachelor','Master','PhD'] },
  { key: 'loan_term',       label: 'Loan Term (months)',
    options: ['12','24','36','48','60','84','120'] },
  { key: 'dependents',      label: 'Dependents',
    options: ['0','1','2','3','4','5'] },
]

export default function Prediction() {
  const [form, setForm]       = useState(INITIAL_FORM)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    for (const f of FIELD_CONFIG) {
      if (!form[f.key]) { toast.error(`${f.label} is required`); return }
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        age:                  parseInt(form.age),
        income:               parseInt(form.income),
        credit_score:         parseInt(form.credit_score),
        loan_amount:          parseInt(form.loan_amount),
        existing_emi:         parseInt(form.existing_emi),
        loan_term:            parseInt(form.loan_term),
        years_of_experience:  parseInt(form.years_of_experience),
        dependents:           parseInt(form.dependents),
      }
      const { data } = await predictionApi.predict(payload)
      setResult(data)
      toast.success('Prediction complete!')
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setForm(INITIAL_FORM); setResult(null) }

  const downloadPDF = () => {
    if (!result) return
    const doc = new jsPDF()
    const r = result.result
    doc.setFontSize(20)
    doc.setTextColor(40)
    doc.text('SmartLoan AI — Prediction Report', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32)
    doc.setDrawColor(200)
    doc.line(14, 36, 196, 36)

    doc.setFontSize(13)
    doc.setTextColor(40)
    doc.text('Result Summary', 14, 46)
    doc.setFontSize(11)
    doc.setTextColor(80)
    const lines = [
      `Decision:            ${r.status}`,
      `Default Probability: ${r.probability}%`,
      `Risk Score:          ${r.risk_score} / 100`,
      `Risk Level:          ${r.risk_label}`,
      `Confidence:          ${r.confidence}%`,
    ]
    lines.forEach((l, i) => doc.text(l, 14, 56 + i * 8))

    doc.setFontSize(13)
    doc.setTextColor(40)
    doc.text('Risk Factors', 14, 110)
    doc.setFontSize(11)
    doc.setTextColor(80)
    r.reasons?.forEach((reason, i) => doc.text(`• ${reason}`, 18, 120 + i * 8))

    doc.setFontSize(13)
    doc.setTextColor(40)
    doc.text('Suggestions', 14, 155)
    doc.setFontSize(11)
    doc.setTextColor(80)
    r.suggestions?.forEach((s, i) => doc.text(`• ${s}`, 18, 165 + i * 8))

    doc.save(`smartloan-prediction-${Date.now()}.pdf`)
    toast.success('PDF report downloaded!')
  }

  const r = result?.result

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="lg:ml-64 pt-20 lg:pt-0 p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary-400" /> AI Loan Prediction
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter applicant details to get an instant risk assessment
          </p>
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Numeric fields */}
              {FIELD_CONFIG.map(({ key, label, placeholder, min, max }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{label}</label>
                  <input
                    id={`field-${key}`}
                    type="number"
                    name={key}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    value={form[key]}
                    onChange={handleChange}
                    className="input-glass"
                  />
                </div>
              ))}

              {/* Select fields */}
              {SELECT_CONFIG.map(({ key, label, options }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{label}</label>
                  <select
                    id={`field-${key}`}
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    className="input-glass"
                  >
                    {options.map((o) => (
                      <option key={o} value={o} className="bg-slate-800">{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button id="predict-submit" type="submit" disabled={loading}
                className="btn-gradient flex items-center gap-2 disabled:opacity-60">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> Predict Now</>}
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10
                           text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </form>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {r && (
            <motion.div
              id="result-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Top result row */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-white text-lg">Prediction Result</h2>
                  <button onClick={downloadPDF}
                    className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300
                               px-3 py-2 rounded-lg hover:bg-primary-500/10 transition-all">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 items-center">
                  <div className="flex justify-center">
                    <RiskGauge riskScore={r.risk_score} riskLabel={r.risk_label} />
                  </div>
                  <div className="flex justify-center">
                    <ProbabilityCircle probability={r.probability} status={r.status} />
                  </div>
                </div>

                {/* Confidence + derived metrics */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { label: 'Confidence',      value: `${r.confidence?.toFixed(1)}%` },
                    { label: 'Debt-to-Income',  value: `${r.derived_features?.debt_to_income?.toFixed(1)}%` },
                    { label: 'Loan-to-Income',  value: `${r.derived_features?.loan_to_income?.toFixed(2)}x` },
                  ].map(({ label, value }) => (
                    <div key={label} className="glass-light rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-white">{value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation + Feature importance */}
              <div className="grid md:grid-cols-2 gap-6">
                <RecommendationCard
                  status={r.status}
                  reasons={r.reasons}
                  suggestions={r.suggestions}
                />

                {r.feature_importance && Object.keys(r.feature_importance).length > 0 && (
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">Feature Importance</h3>
                    <FeatureImportanceChart data={r.feature_importance} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
