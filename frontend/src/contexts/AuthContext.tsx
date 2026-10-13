import React, { createContext, useContext, useState, useEffect } from 'react'
import { userApi } from '../api/userApi'
import type { LoginReply } from '../models/user'
import { ApiError } from '../api/client'

interface AuthContextType {
  user: LoginReply | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginReply | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Recupera o usuário salvo ao recarregar a página (F5)
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Bate no Fastify: POST /users/login
      const res = await userApi.login({ username, password })
      
      if (res.token) {
        // Salva o token para o client.ts injetar no header
        localStorage.setItem('token', res.token)
        // Salva os dados do perfil para manter o estado no React
        localStorage.setItem('user', JSON.stringify(res)) 
        setUser(res)
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
        alert(`Erro: ${err.message}`) // Aviso básico (pode trocar por um toast depois)
      } else {
        setError('Erro inesperado de comunicação com o servidor.')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}