import { useState, useCallback } from 'react'
import { vehicleApi } from '../api/vehicleApi'
import type { VehiclePreview } from '../../../sdk/src/models/vehicle.ts'
import type { CreateVehicleRequest, UpdateVehicleRequest } from '../../../sdk/src/dtos/vehicle.dto.ts'

export function useVehicle() {
  const [vehicles, setVehicles] = useState<VehiclePreview[]>([])
  const [loading, setLoading] = useState(false)

  const loadVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await vehicleApi.getAll()
      setVehicles(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const registerVehicle = async (data: CreateVehicleRequest) => {
    await vehicleApi.register(data)
    await loadVehicles()
  }

  const updateVehicle = async (plate: string, data: Partial<UpdateVehicleRequest>) => {
    await vehicleApi.patch(plate, data)
    await loadVehicles()
  }

  return { vehicles, loading, loadVehicles, registerVehicle, updateVehicle, api: vehicleApi }
}