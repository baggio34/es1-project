import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, UserRole } from '../models/user.ts'
import { mockUsers } from '../utils/mockData.ts'

interface AuthContextType {
  user: User | null
  login: (username: string, password?: string) => void
  logout: () => void
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  // O mock de login aceitará o username e procurará na lista de usuários mockados.
  const login = (username: string, password?: string) => {
    const foundUser = mockUsers.find(u => u.username === username)
    if (foundUser) {
      setUser(foundUser)
    } else {
      alert('Usuário não encontrado nos mocks! Tente: admin, gerente.log, joao.atend, carlos.mot')
    }
  }

  const logout = () => {
    setUser(null)
  }

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
