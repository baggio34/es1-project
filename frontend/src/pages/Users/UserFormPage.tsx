import React, { useState } from 'react'
import type { User, UserRole, UserRegistrationPayload } from '../../models/user.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card.tsx'
import { ArrowLeft, Save, User as UserIcon, AlertCircle, Plus, X } from 'lucide-react'
import { Badge } from '../../components/ui/badge.tsx'

const AVAILABLE_LICENSES = [
  'Carga Perigosa',
  'Carga Refrigerada',
  'Carga Viva',
  'Carga Indivisível',
  'Produtos Químicos',
  'Inflamáveis',
  'Medicamentos',
  'Alimentos Perecíveis',
]

export interface UserFormPageProps {
  initialUser?: User | null
  onSave: (data: UserRegistrationPayload) => Promise<void>
  onCancel: () => void
}

export const UserFormPage: React.FC<UserFormPageProps> = ({
  initialUser,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialUser

  const [name, setName] = useState(initialUser?.name || '')
  const [username, setUsername] = useState(initialUser?.username || '')
  const [cpf, setCpf] = useState(initialUser?.cpf || '')
  const [password, setPassword] = useState('') 
  const [role, setRole] = useState<UserRole>(initialUser?.role || 'driver')
  const [condition, setCondition] = useState<'active' | 'deactivated'>(initialUser?.condition || 'active')
  const [licenses, setLicenses] = useState<string[]>(
    initialUser && initialUser.role === 'driver' && 'licenses' in initialUser ? initialUser.licenses || [] : []
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleAddLicense = (license: string) => {
    if (!licenses.includes(license)) {
      setLicenses((prev) => [...prev, license])
    }
  }

  const handleRemoveLicense = (license: string) => {
    setLicenses((prev) => prev.filter((l) => l !== license))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    const cleanCpf = cpf.replace(/\D/g, '')

    if (!isEditing && (!password || password.length < 8)) {
      setApiError('A senha inicial deve conter pelo menos 8 caracteres.')
      return
    }
    if (cleanCpf.length !== 11) {
      setApiError('O CPF deve conter exatamente 11 dígitos.')
      return
    }
    // Removida a validação que obrigava licenças para motoristas

    setIsSubmitting(true)

    try {
      const payload: any = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        role,
      }

      if (isEditing) {
        payload.condition = condition
        if (password) payload.password = password
      } else {
        payload.cpf = cleanCpf
        payload.password = password
        if (role === 'driver') {
          payload.licenses = licenses // Se estiver vazio, envia [] normalmente
        }
      }

      await onSave(payload)
    } catch (err: any) {
      setApiError(err.message || 'Erro ao processar utilizador. Verifique as permissões de gestor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <div>
            <h1 className="page-title">{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h1>
            <p className="page-description">
              {isEditing ? 'Atualize as informações de acesso do colaborador.' : 'Cadastre um novo colaborador no sistema.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-medium">{apiError}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserIcon size={18} color="var(--color-primary)" />
                <CardTitle>Dados de Acesso e Identificação</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Nome Completo
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Gabriel Varnier"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    CPF do Colaborador
                  </label>
                  <Input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="Somente números (11 dígitos)"
                    required
                    disabled={isSubmitting || isEditing}
                  />
                  {isEditing && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>O CPF não pode ser alterado após o cadastro.</p>}
                </div>

                <div>
                  <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Nome de Usuário (@)
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: gabriel.log"
                    required
                    disabled={isSubmitting || isEditing}
                  />
                </div>

                <div>
                  <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Senha de Acesso (Min. 8 carac.)
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEditing ? 'Digite para alterar a senha' : 'Senha inicial (Obrigatório)'}
                    required={!isEditing}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Nível de Acesso (Cargo)
                  </label>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={isSubmitting || isEditing}
                    options={[
                      { value: 'admin', label: 'Administrador (T.I)' },
                      { value: 'manager', label: 'Gerente Logístico' },
                      { value: 'operator', label: 'Operador de Pátio' },
                      { value: 'clerk', label: 'Atendente Comercial' },
                      { value: 'driver', label: 'Motorista' },
                    ]}
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Status da Conta
                    </label>
                    <Select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as 'active' | 'deactivated')}
                      disabled={isSubmitting}
                      options={[
                        { value: 'active', label: 'Ativo' },
                        { value: 'deactivated', label: 'Desativado' },
                      ]}
                    />
                  </div>
                )}
              </div>

              {role === 'driver' && (
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Gerenciamento de Licenças Especiais (Opcional)</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    Adicione as licenças válidas na CNH do motorista caso ele opere cargas especiais. {isEditing && <span style={{ color: 'var(--color-danger-text)' }}>Não é possível alterar as licenças após a contratação.</span>}
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {licenses.map((license) => (
                      <Badge key={license} variant="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {license}
                        {!isEditing && (
                          <X
                            size={12}
                            style={{ opacity: 0.7, cursor: 'pointer' }}
                            onClick={() => handleRemoveLicense(license)}
                          />
                        )}
                      </Badge>
                    ))}
                    {licenses.length === 0 && <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Nenhuma licença especial vinculada. O motorista operará apenas cargas padrão.</span>}
                  </div>

                  {!isEditing && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        id="user-license-select"
                        className="ui-select"
                        style={{
                          flex: 1,
                          maxWidth: '300px',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          fontSize: '0.875rem',
                          backgroundColor: 'var(--color-bg-card)',
                        }}
                        defaultValue=""
                        disabled={isSubmitting}
                      >
                        <option value="" disabled>Selecione uma licença...</option>
                        {AVAILABLE_LICENSES.filter((l) => !licenses.includes(l)).map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<Plus size={14} />}
                        disabled={isSubmitting}
                        onClick={() => {
                          const select = document.getElementById('user-license-select') as HTMLSelectElement
                          if (select?.value) {
                            handleAddLicense(select.value)
                            select.value = ''
                          }
                        }}
                      >
                        Vincular
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="ghost" onClick={onCancel} type="button" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button variant="default" icon={<Save size={16} />} type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}