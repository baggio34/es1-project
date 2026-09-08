import { apiFetch } from './client'
import type { Driver, DriverFormData } from '../models/driver'

export const driverApi = {
  /**
   * Busca a lista completa de motoristas.
   */
  getAll: () => apiFetch<Driver[]>('/drivers'),

  /**
   * Busca os detalhes de um motorista por ID.
   */
  getById: (id: string) => apiFetch<Driver>(`/drivers/${id}`),

  /**
   * Cadastra um novo motorista.
   */
  create: (data: DriverFormData) =>
    apiFetch<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Atualiza um motorista existente.
   */
  update: (id: string, data: DriverFormData) =>
    apiFetch<Driver>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Remove um motorista do sistema.
   */
  delete: (id: string) =>
    apiFetch<void>(`/drivers/${id}`, {
      method: 'DELETE',
    }),
}