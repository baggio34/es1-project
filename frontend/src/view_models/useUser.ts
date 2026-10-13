import { useState, useCallback } from 'react'
import { userApi } from '../api/userApi.ts'
import type { User, UserRegistrationPayload } from '../models/user.ts'

export function useUser() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await userApi.getAll()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const registerUser = async (data: UserRegistrationPayload) => {
    await userApi.register(data)
    await loadUsers()
  }

  return { users, loading, loadUsers, registerUser, api: userApi }
}