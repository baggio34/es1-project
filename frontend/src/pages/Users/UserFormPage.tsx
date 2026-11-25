import React, { useState, useEffect } from 'react'
import type { UserDetailed, UserPreview, RoleEnum } from '../../../../sdk/src/models/user.ts'
import type { CreateUserRequest, UpdateUserRequest } from '../../../../sdk/src/dtos/user.dto.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card.tsx'
import { ArrowLeft, Save, User as UserIcon, AlertCircle, Plus, X } from 'lucide-react'
import { Badge } from '../../components/ui/badge.tsx'
import { useLicense } from '../../view_models/useLicense.ts'
import { userApi } from '../../api/userApi.ts'

export interface UserFormPageProps {
  initialUser?: UserDetailed | UserPreview | null
  onSave: (data: CreateUserRequest | Partial<UpdateUserRequest>) => Promise<void>
  onCancel: () => void
}

export const UserFormPage: React.FC<UserFormPageProps> = ({
  initialUser,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialUser

  const [detailedUser, setDetailedUser] = useState<UserDetailed | null>(
    initialUser && 'licenses' in initialUser ? initialUser : null
  )

  const [name, setName] = useState(initialUser?.name || '')
  const [username, setUsername] = useState(initialUser?.username || '')
  const [cpf, setCpf] = useState(initialUser?.cpf || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RoleEnum>(initialUser?.role || 'DRIVER')
  const [isActive, setIsActive] = useState<boolean>(initialUser?.isActive ?? true)
  const [licenseIds, setLicenseIds] = useState<string[]>(
    initialUser && initialUser.role === 'DRIVER' && 'licenses' in initialUser
      ? (initialUser.licenses ?? []).map((l) => l.id)
      : []
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { licenses: dbLicenses, loading: loadingLicenses, loadLicenses, createLicense } = useLicense()
  const [newLicenseName, setNewLicenseName] = useState('')

  useEffect(() => {
    loadLicenses().catch(console.error)
  }, [loadLicenses])

  // Se initialUser veio da listagem (UserPreview, sem licenses), busca o UserDetailed completo
  useEffect(() => {
    if (!initialUser) return

    setName(initialUser.name)
    setUsername(initialUser.username)
    setCpf(initialUser.cpf)
    setRole(initialUser.role)
    setIsActive(initialUser.isActive)

    if (initialUser.role === 'DRIVER') {
      if ('licenses' in initialUser && Array.isArray(initialUser.licenses)) {
        setDetailedUser(initialUser)
        setLicenseIds(initialUser.licenses.map((l) => l.id))
      } else {
        userApi
          .getByUsername(initialUser.username)
          .then((fullUser) => {
            setDetailedUser(fullUser)
            if (fullUser.role === 'DRIVER') {
              setLicenseIds((fullUser.licenses ?? []).map((l) => l.id))
            }
          })
          .catch(console.error)
      }
    }
  }, [initialUser])

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
    if (detailedUser?.role === 'DRIVER') {
      const fromUser = (detailedUser.licenses ?? []).find((l) => l.id === id)
      if (fromUser) return fromUser.name
    }
    return id
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

    setIsSubmitting(true)

    try {
      if (isEditing) {
        const updatePayload: Partial<UpdateUserRequest> = {
          name: name.trim(),
          isActive,
          ...(password ? { password } : {}),
          ...(role === 'DRIVER' ? { licenseIds } : {}),
        }
        await onSave(updatePayload)
      } else {
        const basePayload = {
          name: name.trim(),
          username: username.trim().toLowerCase(),
          cpf: cleanCpf,
          password,
        }

        const createPayload: CreateUserRequest =
          role === 'DRIVER'
            ? { ...basePayload, role: 'DRIVER', licenseIds }
            : { ...basePayload, role }

        await onSave(createPayload)
      }
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
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
                      const masked = raw
                        .replace(/^(\d{3})(\d)/, '$1.$2')
                        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
                      setCpf(masked)
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
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
                    onChange={(e) => setRole(e.target.value as RoleEnum)}
                    disabled={isSubmitting || isEditing}
                    options={[
                      { value: 'ADMIN', label: 'Administrador (T.I)' },
                      { value: 'MANAGER', label: 'Gerente Logístico' },
                      { value: 'OPERATOR', label: 'Operador de Pátio' },
                      { value: 'CLERK', label: 'Atendente Comercial' },
                      { value: 'DRIVER', label: 'Motorista' },
                    ]}
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Status da Conta
                    </label>
                    <Select
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
              </div>

              {role === 'DRIVER' && (
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Gerenciamento de Licenças Especiais (Opcional)</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    Adicione ou remova as licenças válidas na CNH do motorista caso ele opere cargas especiais.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
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
                    {licenseIds.length === 0 && <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Nenhuma licença especial vinculada. O motorista operará apenas cargas padrão.</span>}
                  </div>

                  {/* Controles de vinculação */}
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
                      disabled={isSubmitting || loadingLicenses}
                    >
                      <option value="" disabled>Selecione uma licença...</option>
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

                  {/* Controle de criação */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <Input
                      placeholder="Criar nova licença no sistema..."
                      value={newLicenseName}
                      onChange={(e) => setNewLicenseName(e.target.value)}
                      disabled={isSubmitting || loadingLicenses}
                      style={{ flex: 1, maxWidth: '300px' }}
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