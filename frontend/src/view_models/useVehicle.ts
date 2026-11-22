import { useState, useCallback } from 'react'
import { vehicleApi } from '../api/vehicleApi'
import type { Vehicle, VehicleRegistrationPayload } from '../models/vehicle'

export function useVehicle() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
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

  const registerVehicle = async (data: VehicleRegistrationPayload) => {
    await vehicleApi.register(data)
    await loadVehicles()
  }

  return { vehicles, loading, loadVehicles, registerVehicle, api: vehicleApi }
}