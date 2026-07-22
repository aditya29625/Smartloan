import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Shield, TrendingUp, Sparkles, ArrowRight, CheckCircle2, BarChart3, Zap, Lock } from 'lucide-react'

const FEATURES = [
  { icon: Brain,      title: 'Ensemble ML Engine',        desc: 'Logistic Regression, Random Forest, & Gradient Boosting models trained on 10,000+ financial records.', color: 'from-brand-blue to-brand-purple' },
  { icon: Shield,     title: 'Bank-Grade Security',        desc: 'JWT authentication, bcrypt password hashing, encrypted storage, and audit logs.', color: 'from-brand-purple to-brand-pink' },
  { icon: TrendingUp, title: 'Real-Time Risk Gauge',      desc: 'Instant visual metrics, default probability rings, and risk factor diagnostics.', color: 'from-brand-cyan to-brand-blue' },
  { icon: BarChart3,  title: 'Explainable AI Reports',    desc: 'Feature importance breakdown, rule-based recommendations, and PDF report downloads.', color: 'from-brand-emerald to-brand-cyan' },
]

const STATS = [
  { label: 'Predictions Processed', value: '50,000+' },
  { label: 'Model ROC-AUC',         value: '84.0%'   },
  { label: 'Risk Features Analyzed',value: '14+'     },
  { label: 'Avg Inference Speed',  value: '< 50ms'   },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue via-brand-purple to-brand-pink flex items-center justify-center shadow-glow-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-wide">SmartLoan <span className="gradient-text-cyan">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="btn-neon-rgb text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 hero-rgb-mesh flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-brand-indigo/20 text-brand-purple border border-brand-indigo/30 shadow-glow-purple mb-8">
              <Zap className="w-4 h-4 text-brand-cyan" /> Intelligent Credit Risk Analytics
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-8">
              AI Loan Default Risk Assessment{' '}
              <span className="gradient-text-rgb block mt-2">with Machine Learning</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Empower financial decisions using scikit-learn ML models. Instant default probability,
              risk gauges, factor analysis, and downloadable PDF report summaries.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/register" className="btn-neon-rgb flex items-center justify-center gap-2 text-base px-8 py-4">
                <span>Start Free Prediction</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-2xl glass font-semibold text-white hover:bg-white/10 transition-all border border-white/15 text-base">
                Sign In to Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map(({ label, value }) => (
              <div key={label} className="glass p-6 text-center border-white/10 hover:border-brand-purple/40 transition-all">
                <p className="text-3xl md:text-4xl font-extrabold gradient-text-rgb mb-1">{value}</p>
                <p className="text-xs font-medium text-slate-400">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Enterprise Risk Intelligence <span className="gradient-text-cyan">Built for Accuracy</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base">
              Automated end-to-end pipeline from data ingestion to explainable inference
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass p-8 hover:border-brand-indigo/50 transition-all group relative overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center mb-6 shadow-glow-purple group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10 text-center text-sm text-slate-500">
        © 2025 SmartLoan AI Platform — Engineered with Python, FastAPI & React
      </footer>
    </div>
  )
}
