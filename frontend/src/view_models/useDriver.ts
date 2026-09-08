// frontend/src/view_models/useDrivers.ts
import { useState, useEffect, useCallback } from 'react'
import { driverApi } from '../api/driverApi'
import { ApiError } from '../api/client'
import type { Driver, DriverFormData } from '../models/driver'

export function useDriver() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Função para carregar a lista de motoristas do backend
  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await driverApi.getAll()
      setDrivers(data)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro inesperado ao carregar motoristas.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Carrega os dados na montagem do componente
  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  // Função para criar ou atualizar um motorista
  const saveDriver = async (data: DriverFormData, selectedId?: string | null) => {
    try {
      setError(null)
      if (selectedId) {
        await driverApi.update(selectedId, data)
      } else {
        await driverApi.create(data)
      }
      await loadDrivers() // Recarrega a lista atualizada
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao salvar motorista.')
      }
      throw err // Repassa o erro para o formulário tratar
    }
  }

  // Função para deletar um motorista
  const deleteDriver = async (id: string) => {
    try {
      setError(null)
      await driverApi.delete(id)
      await loadDrivers() // Recarrega a lista após exclusão
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao deletar motorista.')
      }
      throw err
    }
  }

  return {
    drivers,
    loading,
    error,
    saveDriver,
    deleteDriver,
    reload: loadDrivers,
  }
}