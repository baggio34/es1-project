import React, { useState } from 'react'
import type { Vehicle } from '../../models/vehicle.ts'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { getVehicleStatusBadge } from '../../utils/formatters.tsx'

export interface VehicleListPageProps {
  vehicles: Vehicle[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export const VehicleListPage: React.FC<VehicleListPageProps> = ({
  vehicles,
  onViewDetails,
  onEdit,
  onCreate,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
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
          <Button icon={<Plus size={16} />} onClick={onCreate}>
            Novo Veículo
          </Button>
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
            <TableHead className="min-w-[180px]">Modelo do Veículo</TableHead>
            <TableHead className="w-[120px]">Placa</TableHead>
            <TableHead className="w-[100px]">Cor</TableHead>
            <TableHead className="min-w-[150px]">Capacidade de Carga</TableHead>
            <TableHead className="min-w-[130px]">Volume Interno</TableHead>
            <TableHead className="min-w-[140px]">Status</TableHead>
            <TableHead className="min-w-[160px]">Condutor Vinculado</TableHead>
            <TableHead className="w-[110px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum veículo encontrado com os filtros selecionados.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            filteredVehicles.map((vehicle) => {
              const hasDriver = 'driverId' in vehicle && vehicle.driverId

              return (
                <TableRow key={vehicle.id}>
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
                  <TableCell>{getVehicleStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>
                    {hasDriver ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                        ID {vehicle.driverId.slice(0, 8)}...
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
                        onClick={() => onViewDetails(vehicle.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Pencil size={15} />}
                        title="Editar Veículo"
                        onClick={() => onEdit(vehicle.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={15} color="var(--color-danger-button)" />}
                        title="Excluir Veículo"
                        onClick={() => setVehicleToDelete(vehicle)}
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
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        title="Confirmar Exclusão de Veículo"
        description="Esta ação removerá o veículo permanentemente da frota cadastrada."
        confirmText="Excluir Veículo"
        confirmVariant="destructive"
        onConfirm={() => {
          if (vehicleToDelete) {
            onDelete(vehicleToDelete.id)
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
