import { apiFetch } from './client'
import type { RouteGetReply, RoutesGetAllReply } from '../models/route'

export const routeApi = {
  getById: (uuid: string) => 
    apiFetch<RouteGetReply>(`/routes/${uuid}`),
    
  getAll: () => 
    apiFetch<RoutesGetAllReply>('/routes'),
    
  authorizeDispatch: (uuid: string) => 
    apiFetch<string>(`/routes/${uuid}/authorize-dispatch`, { method: 'POST' }),
    
  unauthorizeDispatch: (uuid: string) => 
    apiFetch<string>(`/routes/${uuid}/unauthorize-dispatch`, { method: 'POST' }),
    
  confirmDispatch: (uuid: string) => 
    apiFetch<string>(`/routes/${uuid}/confirm-dispatch`, { method: 'POST' }),
}