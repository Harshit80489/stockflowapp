import { Menu, Sun, Moon, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex items-center h-[70px] px-4 lg:px-6"
      style={{ background: 'rgba(8,14,26,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>

      <button onClick={onMenu}
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all"
        style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
        <Menu size={18} />
      </button>

      {/* Page breadcrumb area */}
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>
          StockFlow
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => navigate('/alerts')}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
          title="Alerts">
          <Bell size={16} />
        </button>

        <button onClick={toggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
          title="Toggle theme">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">{user?.name}</p>
            <p className="text-xs font-semibold capitalize mt-0.5" style={{ color: user?.role === 'admin' ? '#34d399' : '#64748b' }}>
              {user?.role}
            </p>
          </div>
        </div>

        <button onClick={handleLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center ml-1 transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
          title="Logout">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
