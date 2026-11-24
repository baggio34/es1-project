import { apiFetch } from './client'
import type { GetRouteReply, GetRoutesReply } from '../../../sdk/src/dtos/route.dto.ts'

export const routeApi = {
  getById: (uuid: string) =>
    apiFetch<GetRouteReply>(`/routes/${uuid}`),

  getAll: () =>
    apiFetch<GetRoutesReply>('/routes'),

  authorizeDispatch: (uuid: string) =>
    apiFetch<string>(`/routes/${uuid}/authorize-dispatch`, { method: 'POST' }),

  unauthorizeDispatch: (uuid: string) =>
    apiFetch<string>(`/routes/${uuid}/unauthorize-dispatch`, { method: 'POST' }),

  confirmDispatch: (uuid: string) =>
    apiFetch<string>(`/routes/${uuid}/confirm-dispatch`, { method: 'POST' }),
}