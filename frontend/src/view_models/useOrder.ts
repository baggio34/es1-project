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

      let orderList: Order[] = []

      // Verifica se os dados vieram como Array nativo
      if (Array.isArray(data)) {
        orderList = data
      } 
      // Verifica se os dados vieram como o Objeto da sua imagem
      else if (data && typeof data === 'object') {
        // Object.values pega apenas o conteúdo de dentro das chaves, transformando em Array
        orderList = Object.values(data)
      }

      setOrders(orderList)
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