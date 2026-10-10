import React, { useState } from 'react'
import type { User } from '../../models/user.ts'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Plus, Search, Pencil, RefreshCw, Eye } from 'lucide-react'
import { getUserRoleBadge } from '../../utils/formatters.tsx'

export interface UserListPageProps {
  users: User[]
  onReload: () => void
  onCreate: () => void
  onEdit: (id: string) => void
  onViewDetails: (username: string) => void
}

export const UserListPage: React.FC<UserListPageProps> = ({
  users,
  onReload,
  onCreate,
  onEdit,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const safeUsers = Array.isArray(users) ? users : []
  const filteredUsers = safeUsers.filter((user) => {
    const query = searchTerm.toLowerCase()
    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Usuários</h1>
          <p className="page-description">
            Gerencie o acesso e permissões de todos os colaboradores do sistema.
          </p>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={onReload}>
            Recarregar
          </Button>
          <Button icon={<Plus size={16} />} onClick={onCreate}>
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <Input
            className="pl-10"
            placeholder="Buscar por nome ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Filtrar Cargo:
          </span>
          <Select
            style={{ width: '200px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os Cargos' },
              { value: 'Admin', label: 'Administrador' },
              { value: 'Manager', label: 'Gerente' },
              { value: 'Clerk', label: 'Atendente' },
              { value: 'Driver', label: 'Motorista' },
            ]}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Nome de Usuário</TableHead>
            <TableHead className="min-w-[200px]">Nome Completo</TableHead>
            <TableHead className="w-[180px]">Cargo / Permissão</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[140px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum usuário localizado com os filtros informados.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    @{user.username}
                  </span>
                </TableCell>
                <TableCell style={{ fontWeight: 500 }}>{user.name}</TableCell>
                <TableCell>{getUserRoleBadge(user.role)}</TableCell>
                <TableCell>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.8125rem',
                    color: user.condition === 'active' ? 'var(--color-success-text)' : 'var(--color-danger-text)'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: user.condition === 'active' ? 'var(--color-success-button)' : 'var(--color-danger-button)'
                    }} />
                    {user.condition === 'active' ? 'Ativo' : 'Desativado'}
                  </span>
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye size={15} />}
                      title="Ver Perfil"
                      onClick={() => onViewDetails(user.username)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Pencil size={15} />}
                      title="Editar Usuário"
                      onClick={() => onEdit(user.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
