import { apiFetch } from './client'
import type { CreateLicenseRequest, UpdateLicenseRequest, GetLicensesReply } from '../../../sdk/src/dtos/license.dto.ts'

export const licenseApi = {
  create: (data: CreateLicenseRequest) =>
    apiFetch<string>('/licenses', { method: 'POST', body: JSON.stringify(data) }),

  getAll: () =>
    apiFetch<GetLicensesReply>('/licenses'),

  update: (id: string, data: UpdateLicenseRequest) =>
    apiFetch<string>(`/licenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<string>(`/licenses/${id}`, { method: 'DELETE' }),
}