import { createContext, useContext, useState, useEffect } from 'react'
import { findUser } from '../data/users'

const AuthContext = createContext(null)

const STORAGE_KEY = 'cova_auth_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (email, password) => {
    const found = findUser(email, password)
    if (!found) return false
    const { password: _pw, ...safe } = found
    setUser(safe)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
