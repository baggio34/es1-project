import { apiFetch } from './client'
import type { VehicleRegistrationPayload, VehiclePatchPayload, VehicleGetReply, Vehicle } from '../models/vehicle'

export const vehicleApi = {
  register: (data: VehicleRegistrationPayload) => 
    apiFetch<string>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    
  patch: (plate: string, data: VehiclePatchPayload) => 
    apiFetch<string>(`/vehicles/${plate}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  getByPlate: (plate: string) => 
    apiFetch<VehicleGetReply>(`/vehicles/${plate}`),
    
  getAll: () => 
    apiFetch<Vehicle[]>('/vehicles'),
}