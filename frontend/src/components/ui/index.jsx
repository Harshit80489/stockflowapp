import { X, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open, onClose])

  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} animate-fade-up`}
        style={{ background: 'rgba(12,18,32,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
        {/* Glow top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)' }} />

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.06)'}>
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5 light-modal">{children}</div>
      </div>
    </div>
  )
}

export function Badge({ children, color = 'slate' }) {
  const cls = {
    green: 'badge-green', red: 'badge-red', amber: 'badge-amber',
    violet: 'badge-violet', slate: 'badge-slate', blue: 'badge-blue',
    yellow: 'badge-amber',
  }
  return <span className={`badge ${cls[color] || 'badge-slate'}`}>{children}</span>
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-4 py-4">
          <div className="skeleton h-3.5 rounded-lg" style={{ width: `${45 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  ))
}

export function Empty({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {Icon && <Icon className="w-7 h-7" style={{ color: '#475569' }} />}
      </div>
      <h3 className="font-bold text-slate-300 mb-2 text-base">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-5 max-w-xs leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}

export function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null
  const { page, pages, total } = pagination
  return (
    <div className="flex items-center justify-between px-5 py-3.5"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="text-xs font-medium" style={{ color: '#475569' }}>
        Page <span className="text-slate-300">{page}</span> of <span className="text-slate-300">{pages}</span> · <span className="text-slate-300">{total}</span> items
      </p>
      <div className="flex gap-1.5">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
          ← Prev
        </button>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
          Next →
        </button>
      </div>
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, sub, iconClass = 'icon-brand', loading = false, delay = '' }) {
  return (
    <div className={`card p-5 flex items-start gap-4 hover:shadow-card-hover transition-all duration-300 animate-fade-up ${delay}`}
      style={{ animationFillMode: 'forwards' }}>
      <div className={`w-12 h-12 rounded-2xl ${iconClass} flex items-center justify-center shrink-0 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(148,163,184,0.6)' }}>{label}</p>
        {loading
          ? <div className="skeleton h-8 w-24 rounded-lg" />
          : <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
        }
        {sub && <p className="text-xs mt-1 font-medium" style={{ color: '#475569' }}>{sub}</p>}
      </div>
    </div>
  )
}

export function Spinner({ size = 'sm' }) {
  const s = size === 'sm' ? 'w-4 h-4 border-2' : 'w-8 h-8 border-3'
  return <div className={`${s} border-white/30 border-t-white rounded-full animate-spin`} />
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm mt-0.5 font-medium" style={{ color: '#475569' }}>{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
