import { useState, useCallback } from 'react'
import { orderApi } from '../api/orderApi'
import type { GetOrdersReply } from '../../../sdk/src/dtos/order.dto.ts'

export function useOrder() {
  const [orders, setOrders] = useState<GetOrdersReply>([])
  const [loading, setLoading] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await orderApi.getAll()
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }, [])

  return { orders, loading, loadOrders, api: orderApi }
}