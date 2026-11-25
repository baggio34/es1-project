import { apiFetch } from './client'
import type { GetDriverRoutesReply } from '../../../sdk/src/dtos/route.dto.ts'
import type { GetDriversReply } from '../../../sdk/src/dtos/user.dto.ts'

export const driverApi = {
  getRoutes: (username: string) =>
    apiFetch<GetDriverRoutesReply>(`/drivers/${username}/routes`),

  getAll: () =>
    apiFetch<GetDriversReply>('/drivers'),

  getMyRoutes: () =>
    apiFetch<GetDriverRoutesReply>('/drivers/my-routes'),
}