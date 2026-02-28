import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ArrowLeftRight, Bell, Zap, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/stock', icon: ArrowLeftRight, label: 'Stock Movements' },
  { to: '/alerts', icon: Bell, label: 'Low Stock Alerts' },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: '256px',
          minWidth: '256px',
          maxWidth: '256px',
          background: 'rgba(8,14,26,0.98)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-64 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full animate-glow"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }}
          />
        </div>

        {/* Logo */}
        <div
          className="relative flex items-center gap-3 px-5 h-[70px] shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
            }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-lg leading-none">StockFlow</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Inventory System
            </p>
          </div>
        </div>

        {/* Nav */}
       <nav className="px-3 py-4 space-y-1 overflow-y-auto" style={{ flex: '1 1 0', minHeight: 0 }}>
          <p
            className="px-3.5 text-[10px] font-black uppercase tracking-[0.15em] mb-3"
            style={{ color: 'rgba(148,163,184,0.35)' }}
          >
            Navigation
          </p>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth < 1024 && onClose()}
            >
              <Icon size={17} className="shrink-0" />
              <span className="font-semibold text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* System status */}
        <div
          className="mx-3 mb-3 p-3 rounded-xl shrink-0"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.15)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={13} style={{ color: '#34d399' }} />
            <p className="text-xs font-bold" style={{ color: '#34d399' }}>System Status</p>
          </div>
          <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>
            All systems operational
          </p>
        </div>

        {/* User - FIXED */}
        <div
          className="p-3 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>

            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.name}
              </p>
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'capitalize',
                color: user?.role === 'admin' ? '#34d399' : '#94a3b8',
              }}>
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}