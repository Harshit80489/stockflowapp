import { useState, useEffect } from 'react'
import { AlertTriangle, Package, ArrowUpCircle, Zap } from 'lucide-react'
import { Modal, Skeleton, Empty, Spinner, PageHeader } from '../components/ui/index.jsx'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ quantity: 10, note: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const { data } = await api.get('/stock/alerts'); setAlerts(data.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const restock = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post(`/stock/${modal._id}/update`, { type: 'IN', quantity: Number(form.quantity), note: form.note || 'Restock' })
      toast.success(`Restocked ${modal.name}!`)
      setModal(null); setForm({ quantity: 10, note: '' }); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const urgency = p => {
    if (p.quantity === 0) return { label: 'Out of Stock', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', bar: '#ef4444', glow: 'rgba(239,68,68,0.15)' }
    if (p.quantity <= p.lowStockThreshold * 0.5) return { label: 'Critical',    color: '#fb923c', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)', bar: '#f97316', glow: 'rgba(249,115,22,0.1)' }
    return { label: 'Low Stock',   color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', bar: '#f59e0b', glow: 'rgba(245,158,11,0.1)' }
  }

  const outOfStock = alerts.filter(p => p.quantity === 0).length
  const lowStock   = alerts.filter(p => p.quantity > 0).length

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader title="Low Stock Alerts" subtitle="Products needing immediate attention" />

      {!loading && alerts.length > 0 && (
        <div className="p-4 rounded-2xl flex items-center gap-4"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={18} style={{ color: '#f87171' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: '#f87171' }}>Inventory Action Required</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#475569' }}>
              {outOfStock} out of stock · {lowStock} running low · Act now to prevent shortages
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
            <span className="text-xs font-bold" style={{ color: '#f87171' }}>{alerts.length} alerts</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Zap size={28} style={{ color: '#34d399' }} />
            </div>
            <h3 className="font-bold text-white mb-2">All stocked up!</h3>
            <p className="text-sm font-medium" style={{ color: '#475569' }}>No products below their low stock threshold.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map(p => {
            const u = urgency(p)
            const pct = Math.min(100, p.lowStockThreshold > 0 ? (p.quantity / p.lowStockThreshold) * 100 : 0)
            return (
              <div key={p._id} className="card p-5 transition-all duration-200 hover:shadow-card-hover relative overflow-hidden animate-fade-up"
                style={{ animationFillMode: 'forwards', boxShadow: `0 0 30px ${u.glow}` }}>

                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: u.color, opacity: 0.7 }} />

                <div className="flex items-start justify-between mb-4">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{ background: u.bg, border: `1px solid ${u.border}`, color: u.color }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: u.color }} />
                    {u.label}
                  </span>
                  {p.category && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg"
                      style={{ background: p.category.color + '15', color: p.category.color, border: `1px solid ${p.category.color}25` }}>
                      {p.category.name}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white mb-1">{p.name}</h3>
                <p className="text-xs font-mono font-medium mb-5" style={{ color: '#475569' }}>{p.sku}</p>

                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#334155' }}>Current Stock</p>
                    <p className="text-3xl font-extrabold tracking-tight" style={{ color: u.color }}>{p.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold mb-1" style={{ color: '#334155' }}>Threshold</p>
                    <p className="text-2xl font-bold text-white">{p.lowStockThreshold}</p>
                  </div>
                </div>

                <div className="w-full rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.06)', height: '6px' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: u.bar, boxShadow: `0 0 8px ${u.bar}60` }} />
                </div>

                <button onClick={() => setModal(p)} className="btn-primary w-full py-2.5">
                  <ArrowUpCircle size={14} />Restock Now
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!modal} onClose={() => { setModal(null); setForm({ quantity: 10, note: '' }) }} title={`✦ Restock: ${modal?.name}`} size="sm">
        <form onSubmit={restock} className="space-y-4">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-sm font-semibold">
              <span style={{ color: '#64748b' }}>Current:</span>
              <span className="text-white">{modal?.quantity} units</span>
            </div>
            <div className="flex justify-between text-sm font-semibold mt-1">
              <span style={{ color: '#64748b' }}>After restock:</span>
              <span style={{ color: '#34d399' }}>{(modal?.quantity || 0) + Number(form.quantity || 0)} units</span>
            </div>
          </div>
          <div>
            <label className="label">Add Quantity *</label>
            <input type="number" min={1} className="input" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Note</label>
            <input className="input" value={form.note} placeholder="e.g. New shipment received" onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner /> : 'Add Stock'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
