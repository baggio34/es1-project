import { useState, useEffect, useCallback } from 'react'
import { driverApi } from '../api/driverApi'
import { ApiError } from '../api/client'
import type { Driver, DriverFormData } from '../models/driver'

export function useDriver() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Função para carregar a lista de motoristas com suporte a Array ou Objeto do backend[cite: 3]
  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await driverApi.getAll()

      let driverList: Driver[] = []
      if (Array.isArray(data)) {
        driverList = data
      } else if (data && typeof data === 'object') {
        driverList = Object.values(data)
      }

      setDrivers(driverList)
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

  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  const saveDriver = async (data: DriverFormData, selectedId?: string | null) => {
    try {
      setError(null)
      if (selectedId) {
        await driverApi.update(selectedId, data)
      } else {
        await driverApi.create(data)
      }
      await loadDrivers()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao salvar motorista.')
      }
      throw err
    }
  }

  const deleteDriver = async (id: string) => {
    try {
      setError(null)
      await driverApi.delete(id)
      await loadDrivers()
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