import React, { useState } from 'react'
import type { Driver } from '../../models/driver.ts'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { formatCpf, getDriverStatusBadge } from '../../utils/formatters.tsx'

export interface DriverListPageProps {
  drivers: Driver[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export const DriverListPage: React.FC<DriverListPageProps> = ({
  drivers,
  onViewDetails,
  onEdit,
  onCreate,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null)

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cpf.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Motoristas</h1>
          <p className="page-description">
            Cadastre, consulte e acompanhe os condutores da sua frota logística.
          </p>
        </div>
        <div className="page-actions">
          <Button icon={<Plus size={16} />} onClick={onCreate}>
            Novo Motorista
          </Button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <Input
            className="pl-10"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Status:
          </span>
          <Select
            style={{ width: '200px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'free', label: 'Disponível' },
              { value: 'waitingDispatch', label: 'Aguardando Despacho' },
              { value: 'onRoute', label: 'Em Rota' },
            ]}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Nome Completo</TableHead>
            <TableHead className="w-[140px]">CPF</TableHead>
            <TableHead className="min-w-[150px]">Status Operacional</TableHead>
            <TableHead className="min-w-[160px]">Veículo Vinculado</TableHead>
            <TableHead className="min-w-[140px]">Cargas Atribuídas</TableHead>
            <TableHead className="w-[110px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDrivers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum motorista encontrado com os filtros selecionados.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            filteredDrivers.map((driver) => {
              const hasVehicle = 'vehicleId' in driver && driver.vehicleId
              const orderCount = 'orderIds' in driver ? driver.orderIds.length : 0

              return (
                <TableRow key={driver.id}>
                  <TableCell style={{ fontWeight: 600 }}>{driver.name}</TableCell>
                  <TableCell className="detail-value-mono">{formatCpf(driver.cpf)}</TableCell>
                  <TableCell>{getDriverStatusBadge(driver.status)}</TableCell>
                  <TableCell>
                    {hasVehicle ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                        ID {driver.vehicleId.slice(0, 8)}...
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>Nenhum</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {orderCount > 0 ? (
                      <Badge variant="primary">{orderCount} pedido(s)</Badge>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>0 pedidos</span>
                    )}
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={15} />}
                        title="Ver Detalhes"
                        onClick={() => onViewDetails(driver.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Pencil size={15} />}
                        title="Editar Motorista"
                        onClick={() => onEdit(driver.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={15} color="var(--color-danger-button)" />}
                        title="Excluir Motorista"
                        onClick={() => setDriverToDelete(driver)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={!!driverToDelete}
        onClose={() => setDriverToDelete(null)}
        title="Confirmar Exclusão de Motorista"
        description="Esta ação removerá o registro do motorista da base de dados do sistema."
        confirmText="Excluir Definitivamente"
        confirmVariant="destructive"
        onConfirm={() => {
          if (driverToDelete) {
            onDelete(driverToDelete.id)
            setDriverToDelete(null)
          }
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Deseja realmente excluir o motorista{' '}
          <strong>{driverToDelete?.name}</strong> (CPF: {driverToDelete ? formatCpf(driverToDelete.cpf) : ''})?
        </p>
      </Modal>
    </div>
  )
}
