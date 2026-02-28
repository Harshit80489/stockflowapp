import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sf_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(r => { setUser(r.data.user); localStorage.setItem('sf_user', JSON.stringify(r.data.user)) })
      .catch(() => { localStorage.removeItem('sf_token'); localStorage.removeItem('sf_user'); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('sf_token', data.token)
    localStorage.setItem('sf_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role })
    localStorage.setItem('sf_token', data.token)
    localStorage.setItem('sf_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('sf_token')
    localStorage.removeItem('sf_user')
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
