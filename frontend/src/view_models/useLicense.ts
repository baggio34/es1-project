import { useState, useCallback } from 'react'
import { licenseApi } from '../api/licenseApi'
import type { LicenseGetReply, LicenseCreationPayload } from '../models/license'
import { ApiError } from '../api/client'

export function useLicense() {
  const [licenses, setLicenses] = useState<LicenseGetReply>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLicenses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await licenseApi.getAll()
      setLicenses(data)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar licenças')
    } finally {
      setLoading(false)
    }
  }, [])

  const createLicense = async (data: LicenseCreationPayload) => {
    await licenseApi.create(data)
    await loadLicenses()
  }

  const updateLicense = async (slug: string, data: LicenseCreationPayload) => {
    await licenseApi.update(slug, data)
    await loadLicenses()
  }

  const deleteLicense = async (slug: string) => {
    await licenseApi.delete(slug)
    await loadLicenses()
  }

  return { licenses, loading, error, loadLicenses, createLicense, updateLicense, deleteLicense }
}