import React, { useState } from 'react'
import type { User, UserRole } from '../../models/user.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card.tsx'
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react'

export interface UserFormPageProps {
  initialUser?: User | null
  onSave: (data: Partial<User>) => void
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
  const [role, setRole] = useState<UserRole>(initialUser?.role || 'Driver')
  const [condition, setCondition] = useState<'active' | 'inactive'>(initialUser?.condition || 'active')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, username, role, condition })
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onCancel}>
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
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserIcon size={18} color="var(--color-primary)" />
                <CardTitle>Dados de Acesso</CardTitle>
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
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>
                <div>
                  <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Nome de Usuário (@)
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: joao.silva"
                    required
                  />
                </div>
                <div>
                  <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Nível de Acesso (Cargo)
                  </label>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    options={[
                      { value: 'Admin', label: 'Administrador' },
                      { value: 'Manager', label: 'Gerente' },
                      { value: 'Clerk', label: 'Atendente' },
                      { value: 'Driver', label: 'Motorista' },
                    ]}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    As regras de quem pode cadastrar gerentes/admins devem ser validadas no backend.
                  </p>
                </div>
                <div>
                  <label className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Status da Conta
                  </label>
                  <Select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as 'active' | 'inactive')}
                    options={[
                      { value: 'active', label: 'Ativo' },
                      { value: 'inactive', label: 'Desativado' },
                    ]}
                  />
                </div>
              </div>

              {role === 'Driver' && (
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Gerenciamento de Licenças</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    Apenas motoristas possuem licenças vinculadas. Para adicionar licenças, salve o usuário e acesse a integração com a rota `/licenses`.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Adicionar Licença
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="ghost" onClick={onCancel} type="button">
                Cancelar
              </Button>
              <Button variant="primary" icon={<Save size={16} />} type="submit">
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
