import React, { useState } from 'react'
import type { VehiclePreview } from '../../../../sdk/src/models/vehicle.ts'
import type { TransportStateEnum } from '../../../../sdk/src/models/transport_state.ts'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Plus, Search, Eye, Pencil, RefreshCw } from 'lucide-react'
import { getVehicleStatusBadge } from '../../utils/formatters.tsx'
import { useAuth } from '../../contexts/AuthContext.tsx'

export interface VehicleListPageProps {
  vehicles: VehiclePreview[]
  routes?: any[]
  drivers?: any[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onReload: () => void
}

export const VehicleListPage: React.FC<VehicleListPageProps> = ({
  vehicles,
  routes,
  drivers,
  onViewDetails,
  onEdit,
  onCreate,
  onDelete,
  onReload,
}) => {
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TransportStateEnum>('all')
  const [vehicleToDelete, setVehicleToDelete] = useState<VehiclePreview | null>(null)

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.color.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.transportState === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Frota</h1>
          <p className="page-description">
            Controle de veículos, capacidades volumétricas, cargas e disponibilidade operacional.
          </p>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={onReload}>
            Recarregar
          </Button>
          {canEdit && (
            <Button icon={<Plus size={16} />} onClick={onCreate}>
              Novo Veículo
            </Button>
          )}
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <Input
            className="pl-10"
            placeholder="Buscar por placa, modelo ou cor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Status:
          </span>
          <Select
            style={{ width: '240px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | TransportStateEnum)}
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'FREE', label: 'Disponível' },
              { value: 'WAITING_OPERATOR_AUTHORIZATION', label: 'Aguardando Autorização' },
              { value: 'WAITING_DRIVER_DISPATCH', label: 'Aguardando Despacho' },
              { value: 'ON_ROUTE', label: 'Em Rota' },
            ]}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Modelo do Veículo</TableHead>
            <TableHead className="w-[120px]">Placa</TableHead>
            <TableHead className="w-[100px]">Cor</TableHead>
            <TableHead className="min-w-[150px]">Capacidade de Carga</TableHead>
            <TableHead className="min-w-[130px]">Volume Interno</TableHead>
            <TableHead className="w-[110px]">Situação</TableHead>
            <TableHead className="min-w-[140px]">Operação</TableHead>
            <TableHead className="min-w-[160px]">Condutor Vinculado</TableHead>
            <TableHead className="w-[110px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum veículo encontrado com os filtros selecionados.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            filteredVehicles.map((vehicle) => {
              const activeRoute =
                vehicle.transportState !== 'FREE'
                  ? routes?.find(
                      (r) =>
                        (r.vehicle?.plate === vehicle.plate || r.vehiclePlate === vehicle.plate) &&
                        r.status !== 'COMPLETED' &&
                        r.status !== 'completed'
                    )
                  : undefined
              const driver =
                activeRoute?.driver ??
                drivers?.find((d) => d.username === activeRoute?.driverId || d.id === activeRoute?.driverId)

              return (
                <TableRow key={vehicle.plate} style={{ opacity: vehicle.isActive ? 1 : 0.65 }}>
                  <TableCell style={{ fontWeight: 600 }}>{vehicle.model}</TableCell>
                  <TableCell>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-bg-subtle)',
                        padding: '0.2rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {vehicle.plate.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{vehicle.color}</TableCell>
                  <TableCell>{vehicle.maxLoad.toLocaleString('pt-BR')} kg</TableCell>
                  <TableCell>{vehicle.internalVolume} m³</TableCell>
                  <TableCell>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: vehicle.isActive ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: vehicle.isActive ? 'var(--color-success-button)' : 'var(--color-danger-button)',
                        }}
                      />
                      {vehicle.isActive ? 'Ativo' : 'Desativado'}
                    </span>
                  </TableCell>
                  <TableCell>{getVehicleStatusBadge(vehicle.transportState)}</TableCell>
                  <TableCell>
                    {driver ? (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          color: 'var(--color-primary)',
                          fontWeight: 500,
                        }}
                      >
                        @{driver.username}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>Nenhum</span>
                    )}
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={15} />}
                        title="Ver Detalhes"
                        onClick={() => onViewDetails(vehicle.plate)}
                      />
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Pencil size={15} />}
                            title="Editar Veículo"
                            onClick={() => onEdit(vehicle.plate)}
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
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        title="Confirmar Exclusão de Veículo"
        description="Esta ação removerá o veículo permanentemente da frota cadastrada."
        confirmText="Excluir Veículo"
        confirmVariant="destructive"
        onConfirm={() => {
          if (vehicleToDelete) {
            onDelete(vehicleToDelete.plate)
            setVehicleToDelete(null)
          }
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Deseja realmente excluir o veículo{' '}
          <strong>{vehicleToDelete?.model}</strong> (Placa:{' '}
          <span style={{ fontFamily: 'var(--font-mono)' }}>{vehicleToDelete?.plate}</span>)?
        </p>
      </Modal>
    </div>
  )
}