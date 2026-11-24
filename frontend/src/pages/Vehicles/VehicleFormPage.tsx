import React, { useState, useEffect } from 'react'
import type { VehicleDetailed, VehiclePreview } from '../../../../sdk/src/models/vehicle.ts'
import type { LicensePreview } from '../../../../sdk/src/models/license.ts'
import type { CreateVehicleRequest, UpdateVehicleRequest } from '../../../../sdk/src/dtos/vehicle.dto.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Label } from '../../components/ui/label.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { ArrowLeft, Check, AlertCircle, Plus, X} from 'lucide-react'
import { useLicense } from '../../view_models/useLicense.ts'
import { vehicleApi } from '../../api/vehicleApi.ts'

export interface VehicleFormPageProps {
  initialVehicle?: VehicleDetailed | VehiclePreview | null
  onSave: (data: CreateVehicleRequest | Partial<UpdateVehicleRequest>) => Promise<void>
  onCancel: () => void
}

export const VehicleFormPage: React.FC<VehicleFormPageProps> = ({
  initialVehicle,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialVehicle

  const [detailedVehicle, setDetailedVehicle] = useState<VehicleDetailed | null>(
    initialVehicle && 'licenses' in initialVehicle ? initialVehicle : null
  )

  const [model, setModel] = useState(initialVehicle?.model || '')
  const [plate, setPlate] = useState(initialVehicle?.plate || '')
  const [color, setColor] = useState(initialVehicle?.color || '')
  const [internalVolume, setInternalVolume] = useState<number | string>(
    initialVehicle?.internalVolume ?? ''
  )
  const [maxLoad, setMaxLoad] = useState<number | string>(
    initialVehicle?.maxLoad ?? ''
  )
  const [isActive, setIsActive] = useState<boolean>(initialVehicle?.isActive ?? true)
  const [licenseIds, setLicenseIds] = useState<string[]>(
    initialVehicle && 'licenses' in initialVehicle
      ? (initialVehicle.licenses ?? []).map((l: LicensePreview) => l.id)
      : []
  )
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { licenses: dbLicenses, loading: loadingLicenses, loadLicenses, createLicense} = useLicense()
  const [newLicenseName, setNewLicenseName] = useState('')

  useEffect(() => {
    loadLicenses().catch(console.error)
  }, [loadLicenses])

  useEffect(() => {
    if (!initialVehicle) return

    setModel(initialVehicle.model)
    setPlate(initialVehicle.plate)
    setColor(initialVehicle.color)
    setInternalVolume(initialVehicle.internalVolume)
    setMaxLoad(initialVehicle.maxLoad)
    setIsActive(initialVehicle.isActive)

    if ('licenses' in initialVehicle && Array.isArray(initialVehicle.licenses)) {
      setDetailedVehicle(initialVehicle)
      setLicenseIds(initialVehicle.licenses.map((l: LicensePreview) => l.id))
    } else {
      vehicleApi
        .getByPlate(initialVehicle.plate)
        .then((fullVehicle) => {
          setDetailedVehicle(fullVehicle)
          setLicenseIds((fullVehicle.licenses ?? []).map((l: LicensePreview) => l.id))
        })
        .catch(console.error)
    }
  }, [initialVehicle])

  const handleAddLicense = (licenseId: string) => {
    if (!licenseIds.includes(licenseId)) {
      setLicenseIds((prev) => [...prev, licenseId])
    }
  }

  const handleRemoveLicense = (licenseId: string) => {
    setLicenseIds((prev) => prev.filter((id) => id !== licenseId))
  }

  const getLicenseName = (id: string) => {
    const fromDb = dbLicenses.find((l) => l.id === id)
    if (fromDb) return fromDb.name
    const fromVehicle = (detailedVehicle?.licenses ?? []).find((l: LicensePreview) => l.id === id)
    if (fromVehicle) return fromVehicle.name
    return id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    const newErrors: { [key: string]: string } = {}
    if (!model.trim()) newErrors.model = 'O modelo do veículo é obrigatório.'
    const cleanPlate = plate.trim().toUpperCase()
    if (cleanPlate.length !== 7) newErrors.plate = 'A placa deve conter exatamente 7 caracteres (ex: ABC1D23).'
    if (!color.trim()) newErrors.color = 'A cor do veículo é obrigatória.'
    if (Number(internalVolume) <= 0 || isNaN(Number(internalVolume))) {
      newErrors.internalVolume = 'O volume interno deve ser maior que zero.'
    }
    if (Number(maxLoad) <= 0 || isNaN(Number(maxLoad))) {
      newErrors.maxLoad = 'A capacidade de carga deve ser maior que zero.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing) {
        const updatePayload: Partial<UpdateVehicleRequest> = {
          model: model.trim(),
          color: color.trim(),
          internalVolume: Number(internalVolume),
          maxLoad: Number(maxLoad),
          isActive,
          licenseIds,
        }
        await onSave(updatePayload)
      } else {
        const createPayload: CreateVehicleRequest = {
          plate: cleanPlate,
          model: model.trim(),
          color: color.trim(),
          internalVolume: Number(internalVolume),
          maxLoad: Number(maxLoad),
          licenseIds,
        }
        await onSave(createPayload)
      }
    } catch (err: any) {
      setApiError(err.message || 'Erro ao salvar o veículo. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onCancel} disabled={isSubmitting}>
            Voltar
          </Button>
          <div>
            <h1 className="page-title">{isEditing ? 'Editar Veículo' : 'Novo Veículo da Frota'}</h1>
            <p className="page-description">
              {isEditing
                ? 'Atualize os dados técnicos e operacionais do veículo.'
                : 'Cadastre um novo caminhão ou utilitário na frota da empresa.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-medium">{apiError}</span>
            </div>
          )}

          <div className="mb-4 pb-6 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
              Especificações do Veículo
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Preencha as informações conforme os padrões da documentação do veículo.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicle-model" required className="text-sm font-semibold text-slate-700">
                Modelo / Fabricante
              </Label>
              <Input
                autoComplete="off"
                id="vehicle-model"
                placeholder="Ex: Mercedes-Benz Sprinter 415 CDI"
                value={model}
                disabled={isSubmitting}
                onChange={(e) => {
                  setModel(e.target.value)
                  if (errors.model) setErrors((prev) => ({ ...prev, model: '' }))
                }}
                error={errors.model}
              />
              {errors.model && (
                <span className="text-xs font-medium text-red-600">{errors.model}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="vehicle-plate" required className="text-sm font-semibold text-slate-700">
                  Placa (7 caracteres)
                </Label>
                <Input
                  autoComplete="off"
                  id="vehicle-plate"
                  placeholder="Ex: ABC1D23"
                  maxLength={7}
                  value={plate}
                  disabled={isSubmitting || isEditing}
                  onChange={(e) => {
                    setPlate(e.target.value.toUpperCase())
                    if (errors.plate) setErrors((prev) => ({ ...prev, plate: '' }))
                  }}
                  error={errors.plate}
                />
                {errors.plate && (
                  <span className="text-xs font-medium text-red-600">{errors.plate}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="vehicle-color" required className="text-sm font-semibold text-slate-700">
                  Cor Predominante
                </Label>
                <Input
                  autoComplete="off"
                  id="vehicle-color"
                  placeholder="Ex: Branco, Azul, Prata"
                  value={color}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setColor(e.target.value)
                    if (errors.color) setErrors((prev) => ({ ...prev, color: '' }))
                  }}
                  error={errors.color}
                />
                {errors.color && (
                  <span className="text-xs font-medium text-red-600">{errors.color}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="vehicle-volume" required className="text-sm font-semibold text-slate-700">
                  Volume Interno Útil (m³)
                </Label>
                <Input
                  autoComplete="off"
                  id="vehicle-volume"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ex: 14.5"
                  value={internalVolume}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setInternalVolume(e.target.value)
                    if (errors.internalVolume) setErrors((prev) => ({ ...prev, internalVolume: '' }))
                  }}
                  error={errors.internalVolume}
                />
                {errors.internalVolume && (
                  <span className="text-xs font-medium text-red-600">{errors.internalVolume}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="vehicle-load" required className="text-sm font-semibold text-slate-700">
                  Carga Máxima Permitida (kg)
                </Label>
                <Input
                  autoComplete="off"
                  id="vehicle-load"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Ex: 1500"
                  value={maxLoad}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setMaxLoad(e.target.value)
                    if (errors.maxLoad) setErrors((prev) => ({ ...prev, maxLoad: '' }))
                  }}
                  error={errors.maxLoad}
                />
                {errors.maxLoad && (
                  <span className="text-xs font-medium text-red-600">{errors.maxLoad}</span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="vehicle-status" className="text-sm font-semibold text-slate-700">
                  Status do Veículo na Frota
                </Label>
                <Select
                  id="vehicle-status"
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  disabled={isSubmitting}
                  options={[
                    { value: 'true', label: 'Ativo' },
                    { value: 'false', label: 'Desativado' },
                  ]}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-slate-700">
                Licenças Requeridas e do Sistema
              </Label>
              <p className="text-xs text-slate-500" style={{ marginTop: '-0.25rem' }}>
                Gerencie as licenças disponíveis no banco de dados e vincule-as ao veículo.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {licenseIds.map((licId) => (
                  <Badge key={licId} variant="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    {getLicenseName(licId)}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemoveLicense(licId)
                      }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}
                    >
                      <X size={14} style={{ opacity: 0.8 }} />
                    </button>
                  </Badge>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <select
                  id="vehicle-license-select"
                  className="ui-select"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--color-bg-card)',
                  }}
                  defaultValue=""
                  disabled={isSubmitting || loadingLicenses}
                >
                  <option value="" disabled>Selecione uma licença...</option>
                  {dbLicenses
                    .filter((l) => !licenseIds.includes(l.id))
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Plus size={14} />}
                  disabled={isSubmitting || loadingLicenses}
                  onClick={() => {
                    const select = document.getElementById('vehicle-license-select') as HTMLSelectElement
                    if (select?.value) {
                      handleAddLicense(select.value)
                      select.value = ''
                    }
                  }}
                >
                  Vincular
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <Input
                  placeholder="Criar nova licença no sistema..."
                  value={newLicenseName}
                  onChange={(e) => setNewLicenseName(e.target.value)}
                  disabled={isSubmitting || loadingLicenses}
                  style={{ flex: 1 }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!newLicenseName.trim() || isSubmitting || loadingLicenses}
                  onClick={async () => {
                    if (newLicenseName.trim()) {
                      await createLicense({ name: newLicenseName.trim() })
                      setNewLicenseName('')
                    }
                  }}
                >
                  Cadastrar Licença
                </Button>
              </div>
            </div>

            {isEditing && initialVehicle && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 mt-4">
                <span className="text-xs text-slate-500">
                  ID do Veículo:{' '}
                  <code className="font-mono font-semibold text-slate-700">{initialVehicle.id}</code>
                </span>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" icon={<Check size={16} />} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Especificações' : 'Cadastrar Veículo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}