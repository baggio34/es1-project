import { useState, useCallback } from 'react'
import { driverApi } from '../api/driverApi.ts'
import type { GetDriversReply } from '../../../sdk/src/dtos/user.dto.ts'

export function useDriver() {
  const [drivers, setDrivers] = useState<GetDriversReply>([])
  const [loading, setLoading] = useState(false)

  const loadDrivers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await driverApi.getAll()
      setDrivers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  return { drivers, loading, loadDrivers, api: driverApi }
}