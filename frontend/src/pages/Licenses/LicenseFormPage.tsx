import React, { useState } from 'react'
import type { LicenseDetailed } from '../../../../sdk/src/models/license.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Label } from '../../components/ui/label.tsx'
import { ArrowLeft, Check, AlertCircle } from 'lucide-react'

export interface LicenseFormPageProps {
  initialLicense?: LicenseDetailed | null
  onSave: (data: { name: string }) => Promise<void>
  onCancel: () => void
}

export const LicenseFormPage: React.FC<LicenseFormPageProps> = ({ initialLicense, onSave, onCancel }) => {
  const isEditing = !!initialLicense

  const [name, setName] = useState(initialLicense ? initialLicense.name : '')
  const [nameError, setNameError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!name.trim()) {
      setNameError('O nome da licença é obrigatório.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({ name: name.trim() })
    } catch (err: any) {
      setApiError(err.message || 'Erro ao salvar a licença. Tente novamente.')
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
            <h1 className="page-title">{isEditing ? 'Editar Licença' : 'Nova Licença'}</h1>
            <p className="page-description">
              {isEditing
                ? 'Atualize o nome da licença regulatória.'
                : 'Cadastre uma nova licença para vincular a pedidos e motoristas.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-medium">{apiError}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="license-name" required className="text-sm font-semibold text-slate-700">
              Nome da Licença
            </Label>
            <Input
              autoComplete="off"
              id="license-name"
              placeholder="Ex: Transporte de Carga Perigosa (MOPP)"
              value={name}
              disabled={isSubmitting}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              error={nameError}
            />
            {nameError && <span className="text-xs font-medium text-red-600">{nameError}</span>}
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" icon={<Check size={16} />} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Licença'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}