import { useState, useEffect, useCallback } from 'react'
import { orderApi } from '../api/orderApi'
import { ApiError } from '../api/client'
import type { Order, OrderFormData } from '../models/order'

export function useOrder() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await orderApi.getAll()
      setOrders(data)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro inesperado ao carregar pedidos.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const saveOrder = async (data: OrderFormData, selectedId?: string | null) => {
    try {
      setError(null)
      if (selectedId) {
        await orderApi.update(selectedId, data)
      } else {
        await orderApi.create(data)
      }
      await loadOrders()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao salvar pedido.')
      }
      throw err
    }
  }

  const deleteOrder = async (id: string) => {
    try {
      setError(null)
      await orderApi.delete(id)
      await loadOrders()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao deletar pedido.')
      }
      throw err
    }
  }

  return {
    orders,
    loading,
    error,
    saveOrder,
    deleteOrder,
    reload: loadOrders,
  }
}