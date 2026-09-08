import { apiFetch } from './client'
import type { Order, OrderFormData } from '../models/order'

export const orderApi = {
  /**
   * Busca a lista completa de pedidos.
   */
  getAll: () => apiFetch<Order[]>('/orders'),

  /**
   * Busca os detalhes de um pedido por ID.
   */
  getById: (id: string) => apiFetch<Order>(`/orders/${id}`),

  /**
   * Cadastra um novo pedido.
   */
  create: (data: OrderFormData) =>
    apiFetch<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Atualiza um pedido existente.
   */
  update: (id: string, data: OrderFormData) =>
    apiFetch<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Remove um pedido do sistema.
   */
  delete: (id: string) =>
    apiFetch<void>(`/orders/${id}`, {
      method: 'DELETE',
    }),
}