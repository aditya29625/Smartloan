export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-slate-600 border-t-primary-500`} />
  )
  if (!fullScreen) return spinner
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-700 border-t-primary-500" />
        <p className="text-slate-400 text-sm">Loading SmartLoan AI…</p>
      </div>
    </div>
  )
}
