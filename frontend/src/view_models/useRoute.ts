import { useState, useCallback } from 'react'
import { routeApi } from '../api/routeApi'
import type { RoutesGetAllReply } from '../models/route'

export function useRoute() {
  const [routes, setRoutes] = useState<RoutesGetAllReply>([])
  const [loading, setLoading] = useState(false)

  const loadRoutes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await routeApi.getAll()
      setRoutes(data)
    } finally {
      setLoading(false)
    }
  }, [])

  return { routes, loading, loadRoutes, api: routeApi }
}