import { useState } from 'react'
import { userApi } from '../api/userApi'
import type { LoginRequest } from '../../../sdk/src/dtos/auth.dto.ts'
import { ApiError } from '../api/client'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true)
      setError(null)
      const res = await userApi.login(data)
      if (res.token) {
        localStorage.setItem('token', res.token)
      }
      return res
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao iniciar sessão')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
  }

  return { login, logout, loading, error }
}