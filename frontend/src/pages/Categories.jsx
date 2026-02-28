import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Tag, Box } from 'lucide-react'
import { Modal, Skeleton, Empty, Spinner, PageHeader } from '../components/ui/index.jsx'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

const COLORS = ['#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#f97316','#ec4899','#3b82f6']
const EMPTY  = { name: '', description: '', color: '#10b981' }

export default function Categories() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, type: '', data: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/categories'); setCategories(data.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(EMPTY); setModal({ open: true, type: 'create' }) }
  const openEdit = c => { setForm({ name: c.name, description: c.description || '', color: c.color }); setModal({ open: true, type: 'edit', data: c }) }

  const save = async e => {
    e.preventDefault()
    if (!form.name) return toast.error('Name required')
    setSaving(true)
    try {
      if (modal.type === 'create') { await api.post('/categories', form); toast.success('Category created!') }
      else { await api.put(`/categories/${modal.data._id}`, form); toast.success('Updated!') }
      setModal({ open: false }); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async () => {
    try { await api.delete(`/categories/${deleteId}`); toast.success('Deleted'); setDeleteId(null); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete') }
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader title="Categories" subtitle={`${categories.length} product groups`}
        action={isAdmin && <button onClick={openCreate} className="btn-primary"><Plus size={15} />New Category</button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="card"><Empty icon={Tag} title="No categories yet" description="Create categories to organize your products" action={isAdmin && <button onClick={openCreate} className="btn-primary">Create Category</button>} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="card p-5 group transition-all duration-200 hover:shadow-card-hover relative overflow-hidden animate-fade-up"
              style={{ animationFillMode: 'forwards' }}>
              {/* Color accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: cat.color }} />

              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: cat.color + '18', border: `1px solid ${cat.color}30` }}>
                  <Tag size={18} style={{ color: cat.color }} />
                </div>
                {isAdmin && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button onClick={() => openEdit(cat)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setDeleteId(cat._id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-white text-base mb-1">{cat.name}</h3>
              {cat.description && <p className="text-xs font-medium line-clamp-2 mb-4" style={{ color: '#475569' }}>{cat.description}</p>}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Box size={13} style={{ color: '#475569' }} />
                  <span className="text-xs font-bold" style={{ color: '#475569' }}>{cat.productCount ?? 0} products</span>
                </div>
                <div className="flex gap-1">
                  {[0.4, 0.65, 1].map((o, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color, opacity: o }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.type === 'create' ? '✦ New Category' : '✦ Edit Category'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-8 h-8 rounded-xl transition-all hover:scale-110"
                  style={{ background: c, boxShadow: form.color === c ? `0 0 0 3px rgba(255,255,255,0.3), 0 0 16px ${c}60` : 'none', transform: form.color === c ? 'scale(1.15)' : '' }} />
              ))}
              <input type="color" className="w-8 h-8 rounded-xl cursor-pointer p-0.5 border-0"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
            {/* Preview */}
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: form.color + '12', border: `1px solid ${form.color}25` }}>
              <Tag size={13} style={{ color: form.color }} />
              <span className="text-xs font-bold" style={{ color: form.color }}>{form.name || 'Preview'}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal({ open: false })} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner /> : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category" size="sm">
        <p className="text-sm font-medium mb-5" style={{ color: '#94a3b8' }}>Products in this category must be reassigned first. This <span className="text-red-400 font-bold">cannot be undone</span>.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteId(null)} className="btn-ghost">Cancel</button>
          <button onClick={remove} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
