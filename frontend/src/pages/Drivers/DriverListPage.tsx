import React, { useState } from 'react'
import type { DriverPreview } from '../../../../sdk/src/models/user.ts'
import type { RoutePreview, RouteWithOrders } from '../../../../sdk/src/models/route.ts'
import type { VehiclePreview, VehicleSignature } from '../../../../sdk/src/models/vehicle.ts'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Plus, Search, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { formatReg, getDriverStatusBadge } from '../../utils/formatters.tsx'
import { useAuth } from '../../contexts/AuthContext.tsx'

export interface DriverListPageProps {
  drivers: DriverPreview[]
  routes?: (RoutePreview | RouteWithOrders)[]
  vehicles?: (VehiclePreview | VehicleSignature)[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onReload: () => void
}

export const DriverListPage: React.FC<DriverListPageProps> = ({
  drivers,
  routes,
  vehicles,
  onViewDetails,
  onEdit,
  onCreate,
  onDelete,
  onReload,
}) => {
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [driverToDelete, setDriverToDelete] = useState<DriverPreview | null>(null)

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cpf.includes(searchTerm) ||
      driver.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || driver.transportState === statusFilter
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
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={onReload}>
            Recarregar
          </Button>
          {canEdit && (
            <Button icon={<Plus size={16} />} onClick={onCreate}>
              Novo Motorista
            </Button>
          )}
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <Input
            className="pl-10"
            placeholder="Buscar por nome, usuário ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Status:
          </span>
          <Select
            style={{ width: '220px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'FREE', label: 'Disponível' },
              { value: 'WAITING_OPERATOR_AUTHORIZATION', label: 'Em Montagem de Rota' },
              { value: 'WAITING_DRIVER_DISPATCH', label: 'Aguardando Despacho' },
              { value: 'ON_ROUTE', label: 'Em Rota' },
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
              const assignedRoute = driver.transportState !== 'FREE' ? driver.route : undefined
              const detailedRoute = assignedRoute
                ? routes?.find((r) => r.id === assignedRoute.id) ?? assignedRoute
                : undefined

              const routeVehicle = detailedRoute?.vehicle
              const vehicle = routeVehicle
                ? vehicles?.find((v) => v.plate === routeVehicle.plate || v.id === routeVehicle.id) ?? routeVehicle
                : undefined

              const orderCount =
                detailedRoute && 'orders' in detailedRoute && Array.isArray(detailedRoute.orders)
                  ? detailedRoute.orders.length
                  : 0

              return (
                <TableRow key={driver.username}>
                  <TableCell style={{ fontWeight: 600 }}>{driver.name}</TableCell>
                  <TableCell className="detail-value-mono">{formatReg(driver.cpf)}</TableCell>
                  <TableCell>{getDriverStatusBadge(driver.transportState)}</TableCell>
                  <TableCell>
                    {vehicle ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                        {vehicle.plate.toUpperCase()}
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
                        onClick={() => onViewDetails(driver.username)}
                      />
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Pencil size={15} />}
                            title="Editar Motorista"
                            onClick={() => onEdit(driver.username)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={15} color="var(--color-danger-button)" />}
                            title="Excluir Motorista"
                            onClick={() => setDriverToDelete(driver)}
                          />
                        </>
                      )}
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
            onDelete(driverToDelete.username)
            setDriverToDelete(null)
          }
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Deseja realmente excluir o motorista{' '}
          <strong>{driverToDelete?.name}</strong> (CPF: {driverToDelete ? formatReg(driverToDelete.cpf) : ''})?
        </p>
      </Modal>
    </div>
  )
}