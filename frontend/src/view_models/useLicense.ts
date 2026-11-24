import { useState, useCallback } from 'react'
import { licenseApi } from '../api/licenseApi'
import type { CreateLicenseRequest, UpdateLicenseRequest, GetLicensesReply } from '../../../sdk/src/dtos/license.dto.ts'
import { ApiError } from '../api/client'

export function useLicense() {
  const [licenses, setLicenses] = useState<GetLicensesReply>([])
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

  const createLicense = async (data: CreateLicenseRequest) => {
    await licenseApi.create(data)
    await loadLicenses()
  }

  const updateLicense = async (id: string, data: UpdateLicenseRequest) => {
    await licenseApi.update(id, data)
    await loadLicenses()
  }

  const deleteLicense = async (id: string) => {
    await licenseApi.delete(id)
    await loadLicenses()
  }

  return { licenses, loading, error, loadLicenses, createLicense, updateLicense, deleteLicense }
}