import React, { useState } from 'react'
import type { Order, OrderFormData, OrderStatus } from '../../models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Label } from '../../components/ui/label.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { ArrowLeft, Check, AlertCircle } from 'lucide-react'

export interface OrderFormPageProps {
  initialOrder?: Order | null
  onSave: (data: OrderFormData) => Promise<void>
  onCancel: () => void
}

export const OrderFormPage: React.FC<OrderFormPageProps> = ({
  initialOrder,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialOrder

  const [description, setDescription] = useState(initialOrder ? initialOrder.description : '')
  const [clientName, setClientName] = useState(initialOrder ? initialOrder.clientName : '')
  const [clientCpf, setClientCpf] = useState(initialOrder ? initialOrder.clientCpf : '')
  const [destination, setDestination] = useState(initialOrder ? initialOrder.destination : '')
  const [value, setValue] = useState<number | string>(initialOrder ? initialOrder.value : '')
  const [weight, setWeight] = useState<number | string>(initialOrder ? initialOrder.weight : '')
  const [volume, setVolume] = useState<number | string>(initialOrder ? initialOrder.volume : '')
  const [status, setStatus] = useState<OrderStatus>(initialOrder ? initialOrder.status : 'pendingApproval')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    const newErrors: { [key: string]: string } = {}
    if (!description.trim()) newErrors.description = 'A descrição do pedido é obrigatória.'
    if (!clientName.trim()) newErrors.clientName = 'O nome do cliente é obrigatório.'
    const cleanCpf = clientCpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) newErrors.clientCpf = 'O CPF do cliente deve ter 11 dígitos.'
    if (!destination.trim()) newErrors.destination = 'O endereço de destino é obrigatório.'
    if (Number(value) <= 0 || isNaN(Number(value))) newErrors.value = 'O valor deve ser maior que zero.'
    if (Number(weight) <= 0 || isNaN(Number(weight))) newErrors.weight = 'O peso deve ser maior que zero.'
    if (Number(volume) <= 0 || isNaN(Number(volume))) newErrors.volume = 'O volume deve ser maior que zero.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        description: description.trim(),
        clientName: clientName.trim(),
        clientCpf: cleanCpf,
        destination: destination.trim(),
        value: Number(value),
        weight: Number(weight),
        volume: Number(volume),
        status,
      })
    } catch (err: any) {
      setApiError(err.message || 'Erro ao salvar o pedido. Tente novamente.')
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
            <h1 className="page-title">{isEditing ? 'Editar Pedido' : 'Novo Pedido de Entrega'}</h1>
            <p className="page-description">
              {isEditing
                ? 'Atualize os dados comerciais e de transporte do pedido.'
                : 'Cadastre uma nova solicitação de transporte logístico no sistema.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-medium">{apiError}</span>
            </div>
          )}

          <div className="mb-8 pb-6 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
              {isEditing ? 'Informações do Pedido' : 'Dados Gerais do Pedido'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Preencha os campos abaixo com os dados necessários para o transporte.
            </p>
          </div>

          <div className="space-y-10">
            <div className="flex flex-col gap-2">
              <Label htmlFor="order-description" required className="text-sm font-semibold text-slate-700">
                Descrição dos Itens / Carga
              </Label>
              <Input
                id="order-description"
                placeholder="Ex: Lote de Peças Automotivas e Rolamentos Industriais"
                value={description}
                disabled={isSubmitting}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (errors.description) setErrors((p) => ({ ...p, description: '' }))
                }}
                error={errors.description}
              />
              {errors.description && (
                <span className="text-xs font-medium text-red-600">{errors.description}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="order-client" required className="text-sm font-semibold text-slate-700">
                  Nome do Cliente / Empresa
                </Label>
                <Input
                  id="order-client"
                  placeholder="Ex: Indústria Catarinense S/A"
                  value={clientName}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setClientName(e.target.value)
                    if (errors.clientName) setErrors((p) => ({ ...p, clientName: '' }))
                  }}
                  error={errors.clientName}
                />
                {errors.clientName && (
                  <span className="text-xs font-medium text-red-600">{errors.clientName}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="order-cpf" required className="text-sm font-semibold text-slate-700">
                  CPF do Solicitante (11 dígitos)
                </Label>
                <Input
                  id="order-cpf"
                  placeholder="Ex: 11122233344"
                  maxLength={14}
                  value={clientCpf}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setClientCpf(e.target.value)
                    if (errors.clientCpf) setErrors((p) => ({ ...p, clientCpf: '' }))
                  }}
                  error={errors.clientCpf}
                />
                {errors.clientCpf && (
                  <span className="text-xs font-medium text-red-600">{errors.clientCpf}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="order-dest" required className="text-sm font-semibold text-slate-700">
                Endereço Completo de Destino
              </Label>
              <Input
                id="order-dest"
                placeholder="Ex: Rua das Palmeiras, 1500 - Joinville/SC - CEP 89200-000"
                value={destination}
                disabled={isSubmitting}
                onChange={(e) => {
                  setDestination(e.target.value)
                  if (errors.destination) setErrors((p) => ({ ...p, destination: '' }))
                }}
                error={errors.destination}
              />
              {errors.destination && (
                <span className="text-xs font-medium text-red-600">{errors.destination}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="order-value" required className="text-sm font-semibold text-slate-700">
                  Valor Declarado (R$)
                </Label>
                <Input
                  id="order-value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 12500.00"
                  value={value}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setValue(e.target.value)
                    if (errors.value) setErrors((p) => ({ ...p, value: '' }))
                  }}
                  error={errors.value}
                />
                {errors.value && (
                  <span className="text-xs font-medium text-red-600">{errors.value}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="order-weight" required className="text-sm font-semibold text-slate-700">
                  Peso Total (kg)
                </Label>
                <Input
                  id="order-weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ex: 450.0"
                  value={weight}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setWeight(e.target.value)
                    if (errors.weight) setErrors((p) => ({ ...p, weight: '' }))
                  }}
                  error={errors.weight}
                />
                {errors.weight && (
                  <span className="text-xs font-medium text-red-600">{errors.weight}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="order-volume" required className="text-sm font-semibold text-slate-700">
                  Volume Útil (m³)
                </Label>
                <Input
                  id="order-volume"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ex: 3.2"
                  value={volume}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setVolume(e.target.value)
                    if (errors.volume) setErrors((p) => ({ ...p, volume: '' }))
                  }}
                  error={errors.volume}
                />
                {errors.volume && (
                  <span className="text-xs font-medium text-red-600">{errors.volume}</span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="order-status" className="text-sm font-semibold text-slate-700">
                  Situação do Pedido
                </Label>
                <Select
                  id="order-status"
                  value={status}
                  disabled={isSubmitting}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  options={[
                    { value: 'pendingApproval', label: 'Pendente de Aprovação' },
                    { value: 'waitingPayment', label: 'Aguardando Pagamento' },
                    { value: 'inPreparation', label: 'Em Preparação' },
                    { value: 'waitingDispatch', label: 'Aguardando Despacho' },
                    { value: 'onRoute', label: 'Em Rota' },
                    { value: 'arrived', label: 'Entregue' },
                    { value: 'rejected', label: 'Rejeitado' },
                  ]}
                />
              </div>
            )}

            {isEditing && initialOrder && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-xs text-slate-500">
                  Código do Pedido:{' '}
                  <code className="font-mono font-semibold text-slate-700">{initialOrder.id}</code>
                </span>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" icon={<Check size={16} />} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Pedido'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}