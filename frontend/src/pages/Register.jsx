import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Zap, ArrowRight } from 'lucide-react'
import { Spinner } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be 6+ characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080e1a' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">StockFlow</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Create account</h1>
          <p className="text-sm font-medium" style={{ color: '#475569' }}>Start managing your inventory today</p>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="John Smith" required value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@company.com" required value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 6 characters" required value={form.password} onChange={set('password')} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={set('role')}
                style={{ appearance: 'none' }}>
                <option value="staff" style={{ background: '#0f1629' }}>Staff Member</option>
                <option value="admin" style={{ background: '#0f1629' }}>Administrator</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <Spinner /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6 font-medium" style={{ color: '#475569' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold" style={{ color: '#34d399' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
