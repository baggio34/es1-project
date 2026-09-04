import React, { useState } from 'react'
import type { Vehicle, VehicleFormData, VehicleStatus } from '../../models/vehicle.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Label } from '../../components/ui/label.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { ArrowLeft, Check } from 'lucide-react'

export interface VehicleFormPageProps {
  initialVehicle?: Vehicle | null
  onSave: (data: VehicleFormData) => void
  onCancel: () => void
}

export const VehicleFormPage: React.FC<VehicleFormPageProps> = ({
  initialVehicle,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialVehicle

  const [model, setModel] = useState(initialVehicle ? initialVehicle.model : '')
  const [plate, setPlate] = useState(initialVehicle ? initialVehicle.plate : '')
  const [color, setColor] = useState(initialVehicle ? initialVehicle.color : '')
  const [internalVolume, setInternalVolume] = useState<number | string>(
    initialVehicle ? initialVehicle.internalVolume : ''
  )
  const [maxLoad, setMaxLoad] = useState<number | string>(
    initialVehicle ? initialVehicle.maxLoad : ''
  )
  const [status, setStatus] = useState<VehicleStatus>(
    initialVehicle ? initialVehicle.status : 'free'
  )
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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

    onSave({
      model: model.trim(),
      plate: cleanPlate,
      color: color.trim(),
      internalVolume: Number(internalVolume),
      maxLoad: Number(maxLoad),
      status,
      driverId: initialVehicle && 'driverId' in initialVehicle ? initialVehicle.driverId : undefined,
    })
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onCancel}>
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
          <div className="mb-8 pb-6 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
              Especificações do Veículo
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Preencha as informações conforme os padrões da documentação do veículo.
            </p>
          </div>

          <div className="space-y-10">
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicle-model" required className="text-sm font-semibold text-slate-700">
                Modelo / Fabricante
              </Label>
              <Input
                id="vehicle-model"
                placeholder="Ex: Mercedes-Benz Sprinter 415 CDI"
                value={model}
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
                  id="vehicle-plate"
                  placeholder="Ex: ABC1D23"
                  maxLength={7}
                  value={plate}
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
                  id="vehicle-color"
                  placeholder="Ex: Branco, Azul, Prata"
                  value={color}
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
                  id="vehicle-volume"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ex: 14.5"
                  value={internalVolume}
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
                  id="vehicle-load"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Ex: 1500"
                  value={maxLoad}
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicle-status" className="text-sm font-semibold text-slate-700">Status Operacional</Label>
              <Select
                id="vehicle-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                options={[
                  { value: 'free', label: 'Disponível no Pátio' },
                  { value: 'waitingDispatch', label: 'Aguardando Despacho' },
                  { value: 'onRoute', label: 'Em Rota de Entrega' },
                ]}
              />
            </div>

            {isEditing && initialVehicle && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-xs text-slate-500">
                  ID do Veículo:{' '}
                  <code className="font-mono font-semibold text-slate-700">{initialVehicle.id}</code>
                </span>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" icon={<Check size={16} />}>
              {isEditing ? 'Salvar Especificações' : 'Cadastrar Veículo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
