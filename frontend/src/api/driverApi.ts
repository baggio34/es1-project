import { apiFetch } from './client'
import type { DriverRoutesGetReply } from '../models/route'
import type { UserGetReply } from '../models/user'

export const driverApi = {
  getRoutes: (username: string) => 
    apiFetch<DriverRoutesGetReply>(`/drivers/${username}/routes`),
    
  getAll: () => 
    apiFetch<UserGetReply[]>('/drivers'),
}