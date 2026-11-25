import { useState, useCallback } from 'react'
import { userApi } from '../api/userApi.ts'
import type { UserPreview } from '../../../sdk/src/models/user.ts'
import type { CreateUserRequest, UpdateUserRequest } from '../../../sdk/src/dtos/user.dto.ts'

export function useUser() {
  const [users, setUsers] = useState<UserPreview[]>([])
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

  const registerUser = async (data: CreateUserRequest) => {
    await userApi.register(data)
    await loadUsers()
  }

  const updateUser = async (username: string, data: Partial<UpdateUserRequest>) => {
    await userApi.patch(username, data)
    await loadUsers()
  }

  return { users, loading, loadUsers, registerUser, updateUser, api: userApi }
}