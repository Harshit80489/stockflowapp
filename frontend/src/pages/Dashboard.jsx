import { useState, useEffect } from 'react'
import { Package, Tag, AlertTriangle, DollarSign, TrendingUp, TrendingDown, RefreshCw, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { StatCard, Skeleton, Badge, PageHeader } from '../components/ui/index.jsx'
import api from '../utils/api'
import { formatDistanceToNow } from 'date-fns'

const PIE_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="p-3 rounded-xl text-xs font-semibold" style={{ background: 'rgba(12,18,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
      <p className="mb-1 text-slate-400">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.dataKey}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const chartData = (() => {
    if (!data?.stockMovements) return []
    const map = {}
    data.stockMovements.forEach(({ _id, total }) => {
      if (!map[_id.date]) map[_id.date] = { date: _id.date.slice(5), IN: 0, OUT: 0 }
      map[_id.date][_id.type] = total
    })
    return Object.values(map)
  })()

  const typeIcon  = { IN: TrendingUp, OUT: TrendingDown, ADJUSTMENT: RefreshCw }
  const typeBadge = { IN: 'green', OUT: 'red', ADJUSTMENT: 'amber' }
  const typeSign  = { IN: '+', OUT: '-', ADJUSTMENT: '~' }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Dashboard" subtitle="Real-time inventory overview" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Package}       label="Total Products"  value={data?.stats?.totalProducts  ?? '—'} iconClass="icon-brand"  loading={loading} delay="stagger-1" sub="Items in stock" />
        <StatCard icon={Tag}           label="Categories"      value={data?.stats?.totalCategories ?? '—'} iconClass="icon-accent" loading={loading} delay="stagger-2" sub="Product groups" />
        <StatCard icon={AlertTriangle} label="Low Stock"       value={data?.stats?.lowStockProducts ?? '—'} iconClass="icon-amber"  loading={loading} delay="stagger-3" sub="Need attention" />
        <StatCard icon={DollarSign}    label="Stock Value"
          value={data?.stats?.totalStockValue ? `$${Number(data.stats.totalStockValue).toLocaleString()}` : '—'}
          iconClass="icon-cyan" loading={loading} delay="stagger-4" sub="Total valuation" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white text-base">Stock Movements</h3>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#475569' }}>Last 7 days activity</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5" style={{ color: '#34d399' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} />IN
              </span>
              <span className="flex items-center gap-1.5" style={{ color: '#f87171' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />OUT
              </span>
            </div>
          </div>
          {loading ? <Skeleton className="h-52" /> : chartData.length === 0
            ? <div className="h-52 flex items-center justify-center text-sm font-medium" style={{ color: '#334155' }}>No movement data yet</div>
            : <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#334155', fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#334155', fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="IN"  stroke="#10b981" strokeWidth={2.5} fill="url(#gIn)"  dot={false} />
                  <Area type="monotone" dataKey="OUT" stroke="#ef4444" strokeWidth={2.5} fill="url(#gOut)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h3 className="font-bold text-white text-base mb-1">By Category</h3>
          <p className="text-xs font-medium mb-5" style={{ color: '#475569' }}>Product distribution</p>
          {loading ? <Skeleton className="h-52" /> : !data?.productsByCategory?.length
            ? <div className="h-52 flex items-center justify-center text-sm" style={{ color: '#334155' }}>No data yet</div>
            : <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data.productsByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="count" paddingAngle={4}>
                      {data.productsByCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {data.productsByCategory.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="font-medium truncate max-w-[100px]" style={{ color: '#94a3b8' }}>{c.name}</span>
                      </span>
                      <span className="font-bold text-white">{c.count}</span>
                    </div>
                  ))}
                </div>
              </>
          }
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h3 className="font-bold text-white">Recent Activity</h3>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#475569' }}>Latest stock movements</p>
          </div>
          <ArrowUpRight size={16} style={{ color: '#334155' }} />
        </div>

        {loading
          ? <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          : !data?.recentActivity?.length
            ? <div className="py-16 text-center text-sm font-medium" style={{ color: '#334155' }}>No activity yet</div>
            : <div>
                {data.recentActivity.map((item, idx) => {
                  const Icon = typeIcon[item.type] || Package
                  const iconColors = {
                    IN: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.2)' },
                    OUT: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.2)' },
                    ADJUSTMENT: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
                  }
                  const ic = iconColors[item.type] || iconColors.ADJUSTMENT
                  return (
                    <div key={item._id} className="flex items-center gap-4 px-6 py-3.5 transition-colors"
                      style={{ borderBottom: idx < data.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: ic.bg, border: `1px solid ${ic.border}` }}>
                        <Icon size={15} style={{ color: ic.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.product?.name}</p>
                        <p className="text-xs font-medium mt-0.5" style={{ color: '#475569' }}>
                          {item.performedBy?.name} · {item.note || 'No note'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge color={typeBadge[item.type]}>
                          {typeSign[item.type]}{item.quantity}
                        </Badge>
                        <p className="text-xs mt-1 font-medium" style={{ color: '#334155' }}>
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
        }
      </div>
    </div>
  )
}
