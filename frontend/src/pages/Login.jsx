import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Zap, Eye, EyeOff, ArrowRight, Package, BarChart2, Bell } from 'lucide-react'
import { Spinner } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'

const features = [
  { icon: Package, text: 'Real-time inventory tracking' },
  { icon: BarChart2, text: 'Analytics & insights dashboard' },
  { icon: Bell, text: 'Automatic low stock alerts' },
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080e1a' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'rgba(15,22,41,0.8)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* BG decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full animate-glow"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full animate-glow"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', animationDelay: '1.5s' }} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">StockFlow</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Manage inventory<br />
            <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              like a pro.
            </span>
          </h2>
          <p className="text-base mb-12 leading-relaxed" style={{ color: '#64748b' }}>
            The modern stock management platform for growing businesses.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Icon size={15} style={{ color: '#34d399' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs font-medium" style={{ color: '#334155' }}>
          © 2024 StockFlow. All rights reserved.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white">StockFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome back</h1>
            <p className="text-sm font-medium" style={{ color: '#475569' }}>Sign in to your dashboard</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@company.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="input pr-11" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#475569' }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <Spinner /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-6 font-medium" style={{ color: '#475569' }}>
            No account?{' '}
            <Link to="/register" className="font-bold transition-colors" style={{ color: '#34d399' }}>
              Create one free
            </Link>
          </p>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#334155' }}>Quick Start</p>
            <p className="text-xs font-mono" style={{ color: '#475569' }}>Register with any email & password to begin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
