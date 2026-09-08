import { useState, useEffect, useCallback } from 'react'
import { vehicleApi } from '../api/vehicleApi'
import { ApiError } from '../api/client'
import type { Vehicle, VehicleFormData } from '../models/vehicle'

export function useVehicle() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await vehicleApi.getAll()
      setVehicles(data)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro inesperado ao carregar veículos.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const saveVehicle = async (data: VehicleFormData, selectedId?: string | null) => {
    try {
      setError(null)
      if (selectedId) {
        await vehicleApi.update(selectedId, data)
      } else {
        await vehicleApi.create(data)
      }
      await loadVehicles()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao salvar veículo.')
      }
      throw err
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      setError(null)
      await vehicleApi.delete(id)
      await loadVehicles()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao deletar veículo.')
      }
      throw err
    }
  }

  return {
    vehicles,
    loading,
    error,
    saveVehicle,
    deleteVehicle,
    reload: loadVehicles,
  }
}