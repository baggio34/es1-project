import { apiFetch } from './client'
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  GetVehicleReply,
  GetVehiclesReply,
} from '../../../sdk/src/dtos/vehicle.dto.ts'

export const vehicleApi = {
  register: (data: CreateVehicleRequest) =>
    apiFetch<string>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),

  patch: (plate: string, data: Partial<UpdateVehicleRequest>) =>
    apiFetch<string>(`/vehicles/${plate}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getByPlate: (plate: string) =>
    apiFetch<GetVehicleReply>(`/vehicles/${plate}`),

  getAll: () =>
    apiFetch<GetVehiclesReply>('/vehicles'),
}