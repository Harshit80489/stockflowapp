import { useState, useEffect, useCallback } from 'react'
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, TrendingUp, TrendingDown, History } from 'lucide-react'
import { Modal, TableSkeleton, Badge, Empty, Pagination, Spinner, PageHeader } from '../components/ui/index.jsx'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Stock() {
  const [history, setHistory] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ productId: '', type: 'IN', quantity: 1, note: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/stock/history?page=${page}&limit=15`)
      setHistory(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])
  useEffect(() => { api.get('/products?limit=200').then(r => setProducts(r.data.data)).catch(() => {}) }, [])

  const submit = async e => {
    e.preventDefault()
    if (!form.productId) return toast.error('Select a product')
    setSaving(true)
    try {
      await api.post(`/stock/${form.productId}/update`, { type: form.type, quantity: Number(form.quantity), note: form.note })
      toast.success('Stock updated!')
      setModal(false); setForm({ productId: '', type: 'IN', quantity: 1, note: '' }); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const thStyle = { color: 'rgba(148,163,184,0.5)', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 16px', whiteSpace: 'nowrap' }

  const typeCfg = {
    IN: { badge: 'green', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', color: '#34d399', icon: TrendingUp, sign: '+' },
    OUT: { badge: 'red', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#f87171', icon: TrendingDown, sign: '-' },
    ADJUSTMENT: { badge: 'amber', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24', icon: RefreshCw, sign: '~' },
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader title="Stock Movements" subtitle="Track all inventory changes"
        action={<button onClick={() => setModal(true)} className="btn-primary"><ArrowUpCircle size={15} />Update Stock</button>}
      />

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { type: 'IN',  label: 'Stock In',   icon: ArrowUpCircle,   color: '#34d399', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.15)' },
          { type: 'OUT', label: 'Stock Out',  icon: ArrowDownCircle, color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.15)' },
          { type: 'ADJUSTMENT', label: 'Adjustments', icon: RefreshCw, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.15)' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#334155' }}>{s.label}</p>
              <p className="text-xl font-extrabold text-white">{history.filter(h => h.type === s.type).length}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <History size={16} style={{ color: '#475569' }} />
          <h3 className="font-bold text-white text-sm">Movement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <tr>{['Type', 'Product', 'Change', 'Before → After', 'Note', 'By', 'When'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton rows={8} cols={7} />
                : history.length === 0 ? <tr><td colSpan={7}><Empty icon={History} title="No movements yet" description="Update stock to see history" /></td></tr>
                : history.map(h => {
                  const cfg = typeCfg[h.type] || typeCfg.ADJUSTMENT
                  const Icon = cfg.icon
                  return (
                    <tr key={h._id} className="table-row">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                            <Icon size={13} style={{ color: cfg.color }} />
                          </div>
                          <Badge color={cfg.badge}>{h.type}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-white">{h.product?.name}</p>
                        <p className="text-xs font-mono mt-0.5" style={{ color: '#475569' }}>{h.product?.sku}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold font-mono" style={{ color: cfg.color }}>{cfg.sign}{h.quantity}</span>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono font-medium" style={{ color: '#475569' }}>{h.previousQuantity} → {h.newQuantity}</td>
                      <td className="px-4 py-4 text-sm font-medium max-w-[120px] truncate" style={{ color: '#475569' }}>{h.note || '—'}</td>
                      <td className="px-4 py-4 text-sm font-medium" style={{ color: '#475569' }}>{h.performedBy?.name}</td>
                      <td className="px-4 py-4 text-xs font-medium whitespace-nowrap" style={{ color: '#334155' }}>
                        {formatDistanceToNow(new Date(h.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onChange={setPage} />
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setForm({ productId: '', type: 'IN', quantity: 1, note: '' }) }} title="✦ Update Stock">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Product *</label>
            <select className="input" value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required>
              <option value="" style={{ background: '#0c1220' }}>Select product...</option>
              {products.map(p => <option key={p._id} value={p._id} style={{ background: '#0c1220' }}>{p.name} ({p.sku}) — Stock: {p.quantity}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Movement Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'IN', label: 'Stock In', icon: ArrowUpCircle, color: '#34d399', activeBg: 'rgba(16,185,129,0.12)', activeBorder: 'rgba(16,185,129,0.35)' },
                { v: 'OUT', label: 'Stock Out', icon: ArrowDownCircle, color: '#f87171', activeBg: 'rgba(239,68,68,0.12)', activeBorder: 'rgba(239,68,68,0.35)' },
                { v: 'ADJUSTMENT', label: 'Adjust', icon: RefreshCw, color: '#fbbf24', activeBg: 'rgba(245,158,11,0.12)', activeBorder: 'rgba(245,158,11,0.35)' },
              ].map(opt => (
                <button key={opt.v} type="button" onClick={() => setForm(f => ({ ...f, type: opt.v }))}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    background: form.type === opt.v ? opt.activeBg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.type === opt.v ? opt.activeBorder : 'rgba(255,255,255,0.08)'}`,
                    color: form.type === opt.v ? opt.color : '#64748b',
                  }}>
                  <opt.icon size={18} />
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">{form.type === 'ADJUSTMENT' ? 'Set New Quantity' : 'Quantity'} *</label>
            <input type="number" min={1} className="input" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Note</label>
            <input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Reason for change..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner /> : 'Update Stock'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
