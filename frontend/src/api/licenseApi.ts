import { apiFetch } from './client'
import type { LicenseCreationPayload, LicenseGetReply } from '../models/license'

export const licenseApi = {
  create: (data: LicenseCreationPayload) => 
    apiFetch<string>('/licenses', { method: 'POST', body: JSON.stringify(data) }),
    
  getAll: () => 
    apiFetch<LicenseGetReply>('/licenses'),
    
  update: (id: string, data: LicenseCreationPayload) => 
    apiFetch<string>(`/licenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => 
    apiFetch<string>(`/licenses/${id}`, { method: 'DELETE' }),
}