import React, { useState } from 'react'
import type { Driver, DriverFormData, DriverStatus } from '../../models/driver.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Label } from '../../components/ui/label.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { ArrowLeft, Check, AlertCircle } from 'lucide-react'

export interface DriverFormPageProps {
  initialDriver?: Driver | null
  onSave: (data: DriverFormData) => Promise<void>
  onCancel: () => void
}

export const DriverFormPage: React.FC<DriverFormPageProps> = ({
  initialDriver,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialDriver

  const [name, setName] = useState(initialDriver ? initialDriver.name : '')
  const [cpf, setCpf] = useState(initialDriver ? initialDriver.cpf : '')
  const [status, setStatus] = useState<DriverStatus>(initialDriver ? initialDriver.status : 'free')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  // Novos estados para controlar o envio e erros da API
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    // Validação local de formulário
    const newErrors: { [key: string]: string } = {}
    if (!name.trim()) newErrors.name = 'O nome completo é obrigatório.'
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) newErrors.cpf = 'O CPF deve conter exatamente 11 dígitos.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // Aguarda a resposta do backend enviada via prop onSave
      await onSave({
        name: name.trim(),
        cpf: cleanCpf,
        status,
        vehicleId: initialDriver && 'vehicleId' in initialDriver ? initialDriver.vehicleId : undefined,
      })
    } catch (err: any) {
      // Exibe a mensagem de erro da API na tela e mantém o formulário aberto
      setApiError(err.message || 'Erro ao salvar motorista. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button 
            variant="outline" 
            size="sm" 
            icon={<ArrowLeft size={16} />} 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
          <div>
            <h1 className="page-title">{isEditing ? 'Editar Motorista' : 'Novo Motorista'}</h1>
            <p className="page-description">
              {isEditing
                ? 'Atualize as informações cadastrais do motorista.'
                : 'Preencha os dados abaixo para cadastrar um novo motorista no sistema.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Banner para exibir erros vindos da API */}
          {apiError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-medium">{apiError}</span>
            </div>
          )}

          <div className="mb-4 pb-6 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
              Dados Cadastrais do Condutor
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Campos marcados com asterisco (*) são de preenchimento obrigatório.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="driver-name" required className="text-sm font-semibold text-slate-700">
                Nome Completo
              </Label>
              <Input
                autoComplete='off'
                id="driver-name"
                placeholder="Ex: João da Silva"
                value={name}
                disabled={isSubmitting}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                }}
                error={errors.name}
              />
              {errors.name && (
                <span className="text-xs font-medium text-red-600">{errors.name}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-cpf" required className="text-sm font-semibold text-slate-700">
                  CPF (somente números)
                </Label>
                <Input
                  autoComplete='off'
                  id="driver-cpf"
                  placeholder="Ex: 12345678901"
                  maxLength={14}
                  value={cpf}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setCpf(e.target.value)
                    if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: '' }))
                  }}
                  error={errors.cpf}
                />
                {errors.cpf && (
                  <span className="text-xs font-medium text-red-600">{errors.cpf}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-status" className="text-sm font-semibold text-slate-700">Status Inicial</Label>
                <Select
                  id="driver-status"
                  value={status}
                  disabled={isSubmitting}
                  onChange={(e) => setStatus(e.target.value as DriverStatus)}
                  options={[
                    { value: 'free', label: 'Disponível (Livre)' },
                    { value: 'waitingDispatch', label: 'Aguardando Despacho' },
                    { value: 'onRoute', label: 'Em Rota' },
                  ]}
                />
              </div>
            </div>

            {isEditing && initialDriver && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-xs text-slate-500">
                  ID do Registro:{' '}
                  <code className="font-mono font-semibold text-slate-700">{initialDriver.id}</code>
                </span>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" icon={<Check size={16} />} disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : isEditing
                ? 'Salvar Alterações'
                : 'Cadastrar Motorista'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
