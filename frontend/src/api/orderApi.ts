import { apiFetch } from './client'
import type { 
  OrderCreationPayload, OrderGetReply, OrdersGetAllReply, 
  OrderRejectionPayload, OrderCancellationPayload, OrderLoadingPayload 
} from '../models/order'

export const orderApi = {
  create: (data: OrderCreationPayload) => 
    apiFetch<string>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    
  getAll: () => 
    apiFetch<OrdersGetAllReply>('/orders'),
    
  getById: (id: number | string) => 
    apiFetch<OrderGetReply>(`/orders/${id}`),

  patch: (id: number | string, data: any) => 
    apiFetch<string>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  approve: (id: number | string) => 
    apiFetch<string>(`/orders/${id}/approve`, { method: 'POST' }),
    
  reject: (id: number | string, data: OrderRejectionPayload) => 
    apiFetch<string>(`/orders/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
    
  confirmPayment: (id: number | string) => 
    apiFetch<string>(`/orders/${id}/confirm-payment`, { method: 'POST' }),
    
  cancel: (id: number | string, data: OrderCancellationPayload) => 
    apiFetch<string>(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify(data) }),
    
  load: (id: number | string, data: OrderLoadingPayload) => 
    apiFetch<string>(`/orders/${id}/load`, { method: 'POST', body: JSON.stringify(data) }),
    
  unload: (id: number | string) => 
    apiFetch<string>(`/orders/${id}/unload`, { method: 'POST' }),

  reportAccident: (id: number | string, data: { accidentMessage: string }) => 
    apiFetch<string>(`/orders/${id}/report-accident`, { method: 'POST', body: JSON.stringify(data) }),

  resolveAccident: (id: number | string, data: { resolutionMessage: string }) => 
    apiFetch<string>(`/orders/${id}/resolve-accident`, { method: 'POST', body: JSON.stringify(data) }),

  confirmArrival: (id: number | string) => 
    apiFetch<string>(`/orders/${id}/confirm-arrival`, { method: 'POST' }),

  getSuggestedRoutes: (id: number | string) => 
    apiFetch<any>(`/orders/${id}/suggested-routes`),
}