import { createContext, useContext, useState, useEffect } from 'react'

const Ctx = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('sf_theme')
    if (s) return s === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('sf_theme', dark ? 'dark' : 'light')
  }, [dark])

  return <Ctx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
