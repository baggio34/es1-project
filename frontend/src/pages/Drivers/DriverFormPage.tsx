import React, { useState, useEffect } from 'react'
import type { DriverPreview, UserDetailed } from '../../../../sdk/src/models/user.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Label } from '../../components/ui/label.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { ArrowLeft, Check, AlertCircle, Plus, X } from 'lucide-react'
import { useLicense } from '../../view_models/useLicense.ts'

export type DriverFormData = {
  name: string
  cpf: string
  username: string
  password: string | undefined
  licenseIds: string[]
}

export interface DriverFormPageProps {
  initialDriver?: Extract<UserDetailed, { role: 'DRIVER' }> | DriverPreview | null
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
  const [username, setUsername] = useState(initialDriver ? initialDriver.username : '')
  const [password, setPassword] = useState('')
  const [licenseIds, setLicenseIds] = useState<string[]>(
    initialDriver && 'licenses' in initialDriver ? initialDriver.licenses.map((l) => l.id) : []
  )
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { licenses: dbLicenses, loading: loadingLicenses, loadLicenses } = useLicense()

  useEffect(() => {
    loadLicenses().catch(console.error)
  }, [loadLicenses])

  const handleAddLicense = (id: string) => {
    if (!licenseIds.includes(id)) {
      setLicenseIds((prev) => [...prev, id])
    }
  }

  const handleRemoveLicense = (id: string) => {
    setLicenseIds((prev) => prev.filter((l) => l !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    const newErrors: { [key: string]: string } = {}
    if (!name.trim()) newErrors.name = 'O nome completo é obrigatório.'
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) newErrors.cpf = 'O CPF deve conter exatamente 11 dígitos.'
    if (!username.trim()) newErrors.username = 'O nome de usuário é obrigatório.'
    if (!isEditing && !password.trim()) newErrors.password = 'A senha é obrigatória para novos motoristas.'
    if (password.length > 0 && password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        name: name.trim(),
        cpf: cleanCpf,
        username: username.trim(),
        password: password || undefined,
        licenseIds,
      })
    } catch (err: any) {
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
                : 'Preencha os dados abaixo para cadastrar um novo motorista no sistema. Será criada também a conta de acesso (usuário) do motorista.'}
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
              Dados Pessoais do Condutor
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
          </div>

          <div className="mb-4 pb-6 border-b border-slate-200" style={{ marginTop: '2rem' }}>
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
              Conta de Acesso (Usuário)
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Credenciais para o motorista acessar o sistema. O papel será automaticamente definido como "Motorista".
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-username" required className="text-sm font-semibold text-slate-700">
                  Nome de Usuário (@)
                </Label>
                <Input
                  autoComplete='off'
                  id="driver-username"
                  placeholder="Ex: joao.silva"
                  value={username}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (errors.username) setErrors((prev) => ({ ...prev, username: '' }))
                  }}
                  error={errors.username}
                />
                {errors.username && (
                  <span className="text-xs font-medium text-red-600">{errors.username}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="driver-password" required={!isEditing} className="text-sm font-semibold text-slate-700">
                  {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso'}
                </Label>
                <Input
                  autoComplete='new-password'
                  id="driver-password"
                  type="password"
                  placeholder={isEditing ? '••••••••' : 'Mínimo 6 caracteres'}
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                  }}
                  error={errors.password}
                />
                {errors.password && (
                  <span className="text-xs font-medium text-red-600">{errors.password}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4 pb-6 border-b border-slate-200" style={{ marginTop: '2rem' }}>
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
              Licenças
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie as licenças do motorista.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-slate-700">
                Licenças Atribuídas
              </Label>
              <p className="text-xs text-slate-500" style={{ marginTop: '-0.25rem' }}>
                Licenças que habilitam o motorista para tipos específicos de transporte.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {licenseIds.map((id) => (
                  <Badge key={id} variant="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    {dbLicenses.find((l) => l.id === id)?.name ?? id}
                    <X
                      size={12}
                      style={{ opacity: 0.7 }}
                      onClick={() => handleRemoveLicense(id)}
                    />
                  </Badge>
                ))}
                {licenseIds.length === 0 && (
                  <span className="text-xs text-slate-400">Nenhuma licença atribuída.</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <select
                  id="driver-license-select"
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
                  <option value="" disabled>Selecione uma licença para adicionar...</option>
                  {dbLicenses.filter((l) => !licenseIds.includes(l.id)).map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Plus size={14} />}
                  disabled={isSubmitting || loadingLicenses}
                  onClick={() => {
                    const select = document.getElementById('driver-license-select') as HTMLSelectElement
                    if (select?.value) {
                      handleAddLicense(select.value)
                      select.value = ''
                    }
                  }}
                >
                  Adicionar
                </Button>
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