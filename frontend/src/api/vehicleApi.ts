import { apiFetch } from './client'
import type { Vehicle, VehicleFormData } from '../models/vehicle'

export const vehicleApi = {
  /**
   * Busca a lista completa de veículos[cite: 2].
   */
  getAll: () => apiFetch<Vehicle[]>('/vehicles'),

  /**
   * Busca os detalhes de um veículo por ID[cite: 2].
   */
  getById: (id: string) => apiFetch<Vehicle>(`/vehicles/${id}`),

  /**
   * Cadastra um novo veículo[cite: 2].
   */
  create: (data: VehicleFormData) =>
    apiFetch<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Atualiza um veículo existente[cite: 2].
   */
  update: (id: string, data: VehicleFormData) =>
    apiFetch<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Remove um veículo do sistema[cite: 2].
   */
  delete: (id: string) =>
    apiFetch<void>(`/vehicles/${id}`, {
      method: 'DELETE',
    }),
}