import { apiFetch } from './client'
import type { Vehicle, VehicleFormData } from '../models/vehicle'

export const vehicleApi = {
  /**
   * Busca a lista completa de veículos.
   */
  getAll: () => apiFetch<Vehicle[]>('/vehicles'),

  /**
   * Busca os detalhes de um veículo por ID.
   */
  getById: (id: string) => apiFetch<Vehicle>(`/vehicles/${id}`),

  /**
   * Cadastra um novo veículo.
   */
  create: (data: VehicleFormData) =>
    apiFetch<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Atualiza um veículo existente.
   */
  update: (id: string, data: VehicleFormData) =>
    apiFetch<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Remove um veículo do sistema.
   */
  delete: (id: string) =>
    apiFetch<void>(`/vehicles/${id}`, {
      method: 'DELETE',
    }),
}