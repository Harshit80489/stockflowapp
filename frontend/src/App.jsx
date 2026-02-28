import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/dashboard/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Stock from './pages/Stock'
import Alerts from './pages/Alerts'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

function Guest({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
          <Routes>
            <Route path="/login" element={<Guest><Login /></Guest>} />
            <Route path="/register" element={<Guest><Register /></Guest>} />
            <Route path="/" element={<Protected><Layout /></Protected>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="stock" element={<Stock />} />
              <Route path="alerts" element={<Alerts />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
