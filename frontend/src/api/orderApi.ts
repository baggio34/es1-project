import { apiFetch } from './client'
import type {
  CreateOrderRequest, UpdateOrderRequest, GetOrdersReply, GetOrderReply,
  RejectOrderRequest, CancelOrderRequest, LoadOrderRequest,
  ReportOrderAccidentRequest, ResolveOrderAccidentRequest,
} from '../../../sdk/src/dtos/order.dto.ts'

export const orderApi = {
  create: (data: CreateOrderRequest) =>
    apiFetch<string>('/orders', { method: 'POST', body: JSON.stringify(data) }),

  getAll: () =>
    apiFetch<GetOrdersReply>('/orders'),

  getById: (id: number | string) =>
    apiFetch<GetOrderReply>(`/orders/${id}`),

  patch: (id: number | string, data: Partial<UpdateOrderRequest>) =>
    apiFetch<string>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  approve: (id: number | string) =>
    apiFetch<string>(`/orders/${id}/approve`, { method: 'POST' }),

  reject: (id: number | string, data: RejectOrderRequest) =>
    apiFetch<string>(`/orders/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),

  confirmPayment: (id: number | string) =>
    apiFetch<string>(`/orders/${id}/confirm-payment`, { method: 'POST' }),

  cancel: (id: number | string, data: CancelOrderRequest) =>
    apiFetch<string>(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify(data) }),

  load: (id: number | string, data: LoadOrderRequest) =>
    apiFetch<string>(`/orders/${id}/load`, { method: 'POST', body: JSON.stringify(data) }),

  unload: (id: number | string) =>
    apiFetch<string>(`/orders/${id}/unload`, { method: 'POST' }),

  reportAccident: (id: number | string, data: ReportOrderAccidentRequest) =>
    apiFetch<string>(`/orders/${id}/report-accident`, { method: 'POST', body: JSON.stringify(data) }),

  resolveAccident: (id: number | string, data: ResolveOrderAccidentRequest) =>
    apiFetch<string>(`/orders/${id}/resolve-accident`, { method: 'POST', body: JSON.stringify(data) }),

  confirmArrival: (id: number | string) =>
    apiFetch<string>(`/orders/${id}/confirm-arrival`, { method: 'POST' }),
}