import { apiFetch } from './client'
import type { Driver, DriverFormData } from '../models/driver'

export const driverApi = {
  /**
   * Busca a lista completa de motoristas[cite: 1].
   */
  getAll: () => apiFetch<Driver[]>('/drivers'),

  /**
   * Busca os detalhes de um motorista por ID[cite: 1].
   */
  getById: (id: string) => apiFetch<Driver>(`/drivers/${id}`),

  /**
   * Cadastra um novo motorista[cite: 1].
   */
  create: (data: DriverFormData) =>
    apiFetch<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Atualiza um motorista existente[cite: 1].
   */
  update: (id: string, data: DriverFormData) =>
    apiFetch<Driver>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Remove um motorista do sistema[cite: 1].
   */
  delete: (id: string) =>
    apiFetch<void>(`/drivers/${id}`, {
      method: 'DELETE',
    }),
}