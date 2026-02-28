import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Download, Pencil, Trash2, Package } from 'lucide-react'
import { Modal, TableSkeleton, Badge, Empty, Pagination, Spinner, PageHeader } from '../components/ui/index.jsx'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import api from '../utils/api'
import toast from 'react-hot-toast'

const EMPTY = { name: '', sku: '', category: '', quantity: 0, price: 0, supplier: '', description: '', lowStockThreshold: 10 }

export default function Products() {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState({ search: '', category: '', lowStock: '', page: 1 })
  const [modal, setModal] = useState({ open: false, type: '', data: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ ...filters, limit: 10 })
      const { data } = await api.get(`/products?${params}`)
      setProducts(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])
  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {}) }, [])

  const openCreate = () => { setForm(EMPTY); setModal({ open: true, type: 'create' }) }
  const openEdit = p => {
    setForm({ name: p.name, sku: p.sku, category: p.category?._id || '', quantity: p.quantity, price: p.price, supplier: p.supplier || '', description: p.description || '', lowStockThreshold: p.lowStockThreshold || 10 })
    setModal({ open: true, type: 'edit', data: p })
  }

  const save = async e => {
    e.preventDefault()
    if (!form.name || !form.sku || !form.category) return toast.error('Name, SKU and Category are required')
    setSaving(true)
    try {
      if (modal.type === 'create') { await api.post('/products', form); toast.success('Product created!') }
      else { await api.put(`/products/${modal.data._id}`, form); toast.success('Product updated!') }
      setModal({ open: false }); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving product') }
    finally { setSaving(false) }
  }

  const remove = async () => {
    try { await api.delete(`/products/${deleteId}`); toast.success('Product deleted'); setDeleteId(null); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
  }

  const exportCSV = async () => {
    try {
      const res = await api.get('/products/export/csv', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url; a.download = 'products.csv'; a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded!')
    } catch { toast.error('Export failed') }
  }

  const s = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const thStyle = { color: 'rgba(148,163,184,0.5)', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 16px', whiteSpace: 'nowrap' }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <PageHeader title="Products" subtitle={`${pagination?.total ?? 0} items in inventory`}
        action={<>
          <button onClick={exportCSV} className="btn-ghost"><Download size={15} />Export</button>
          <button onClick={openCreate} className="btn-primary"><Plus size={15} />Add Product</button>
        </>}
      />

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2.5 flex-1 px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Search size={15} style={{ color: '#475569' }} className="shrink-0" />
          <input className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-300 placeholder-slate-600"
            placeholder="Search by name, SKU, supplier..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
        <select className="input sm:w-44" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
          <option value="" style={{ background: '#0f1629' }}>All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id} style={{ background: '#0f1629' }}>{c.name}</option>)}
        </select>
        <select className="input sm:w-36" value={filters.lowStock} onChange={e => setFilters(f => ({ ...f, lowStock: e.target.value, page: 1 }))}>
          <option value=""    style={{ background: '#0f1629' }}>All Stock</option>
          <option value="true" style={{ background: '#0f1629' }}>Low Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <tr>
                {['Product', 'SKU', 'Category', 'Qty', 'Price', 'Supplier', 'Added', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton rows={6} cols={8} />
                : products.length === 0 ? (
                  <tr><td colSpan={8}><Empty icon={Package} title="No products found" description="Add your first product to get started" action={<button onClick={openCreate} className="btn-primary">Add Product</button>} /></td></tr>
                ) : products.map(p => (
                  <tr key={p._id} className="table-row">
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      {p.isLowStock && <span className="badge badge-amber mt-1">Low Stock</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{p.sku}</span>
                    </td>
                    <td className="px-4 py-4">
                      {p.category && (
                        <span className="badge" style={{ background: p.category.color + '20', color: p.category.color, border: `1px solid ${p.category.color}30` }}>
                          {p.category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-bold ${p.isLowStock ? 'text-amber-400' : 'text-white'}`}>{p.quantity}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold" style={{ color: '#34d399' }}>${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm font-medium" style={{ color: '#475569' }}>{p.supplier || '—'}</td>
                    <td className="px-4 py-4 text-xs font-medium whitespace-nowrap" style={{ color: '#334155' }}>{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}
                          title="Edit">
                          <Pencil size={13} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => setDeleteId(p._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                            title="Delete">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onChange={p => setFilters(f => ({ ...f, page: p }))} />
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.type === 'create' ? '✦ Add New Product' : '✦ Edit Product'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Product Name *</label>
              <input className="input" value={form.name} onChange={s('name')} placeholder="e.g. Wireless Keyboard" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">SKU *</label>
              <input className="input font-mono" value={form.sku} onChange={s('sku')} placeholder="e.g. PRD-001" required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={s('category')} required>
                <option value="" style={{ background: '#0c1220' }}>Select category...</option>
                {categories.map(c => <option key={c._id} value={c._id} style={{ background: '#0c1220' }}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Supplier</label>
              <input className="input" value={form.supplier} onChange={s('supplier')} placeholder="Supplier name" />
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input type="number" min={0} className="input" value={form.quantity} onChange={s('quantity')} required />
            </div>
            <div>
              <label className="label">Price ($) *</label>
              <input type="number" min={0} step="0.01" className="input" value={form.price} onChange={s('price')} required />
            </div>
            <div className="col-span-2">
              <label className="label">Low Stock Threshold</label>
              <input type="number" min={0} className="input" value={form.lowStockThreshold} onChange={s('lowStockThreshold')} />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} value={form.description} onChange={s('description')} placeholder="Optional description..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal({ open: false })} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner /> : modal.type === 'create' ? 'Create Product' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <p className="text-sm font-medium mb-5" style={{ color: '#94a3b8' }}>
          Are you sure you want to delete this product? This action <span className="text-red-400 font-bold">cannot be undone</span>.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteId(null)} className="btn-ghost">Cancel</button>
          <button onClick={remove} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
