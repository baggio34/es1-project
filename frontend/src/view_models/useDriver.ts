import { useState, useCallback } from 'react'
import { driverApi } from '../api/driverApi'
import type { UserGetReply } from '../models/user'

export function useDriver() {
  const [drivers, setDrivers] = useState<UserGetReply[]>([])
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