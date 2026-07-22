import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { History as HistoryIcon, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { predictionApi } from '../api/axios'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  Approved: 'badge-approved', Rejected: 'badge-rejected', Review: 'badge-review',
}
const RISK_BADGE = {
  Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high',
}

export default function History() {
  const [data, setData]           = useState({ items: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [statusFilter, setFilter] = useState('')
  const [exporting, setExporting] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (statusFilter) params.status_filter = statusFilter
      const res = await predictionApi.getHistory(params)
      setData(res.data)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await predictionApi.exportCsv()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'predictions.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exported!')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="lg:ml-64 pt-20 lg:pt-0 p-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <HistoryIcon className="w-6 h-6 text-primary-400" /> Prediction History
            </h1>
            <p className="text-slate-400 text-sm mt-1">{data.total} total predictions</p>
          </div>

          <div className="flex gap-2">
            {/* Status filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select value={statusFilter} onChange={(e) => { setFilter(e.target.value); setPage(1) }}
                className="input-glass pl-9 pr-4 py-2.5 text-sm w-36">
                <option value="">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Review">Review</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Export */}
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10
                         text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium
                         disabled:opacity-60">
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['#', 'Date', 'Loan Amount', 'Income', 'Credit Score', 'Status', 'Risk', 'Probability'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-16 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-600 border-t-primary-500 rounded-full animate-spin" />
                      Loading…
                    </div>
                  </td></tr>
                ) : data.items.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-slate-500">
                    No predictions found. <a href="/predict" className="text-primary-400">Make one now!</a>
                  </td></tr>
                ) : data.items.map((item, i) => (
                  <motion.tr key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">#{item.id}</td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-white font-medium">
                      ₹{item.loan_amount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      ₹{item.income?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-300">{item.credit_score}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_BADGE[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${RISK_BADGE[item.risk_label]}`}>
                        {item.risk_label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-16">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${item.probability}%`,
                              background: item.probability > 60 ? '#ef4444' : item.probability > 35 ? '#f59e0b' : '#10b981',
                            }} />
                        </div>
                        <span className="text-slate-300 text-xs whitespace-nowrap">
                          {item.probability?.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <p className="text-xs text-slate-500">
                Page {data.page} of {data.pages} ({data.total} records)
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white
                             hover:bg-white/5 disabled:opacity-40 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                  className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white
                             hover:bg-white/5 disabled:opacity-40 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
