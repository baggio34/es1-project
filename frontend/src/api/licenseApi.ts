import { apiFetch } from './client'
import type { LicenseCreationPayload, LicenseGetReply } from '../models/license'

export const licenseApi = {
  create: (data: LicenseCreationPayload) => 
    apiFetch<string>('/licenses', { method: 'POST', body: JSON.stringify(data) }),
    
  getAll: () => 
    apiFetch<LicenseGetReply>('/licenses'),
    
  delete: (slug: string) => 
    apiFetch<string>(`/licenses/${slug}`, { method: 'DELETE' }),
}