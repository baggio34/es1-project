import { useState, useCallback } from 'react'
import { routeApi } from '../api/routeApi.ts'
import type { GetRoutesReply } from '../../../sdk/src/dtos/route.dto.ts'

export function useRoute() {
  const [routes, setRoutes] = useState<GetRoutesReply>([])
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