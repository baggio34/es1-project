import React, { useState } from 'react'
import type { Route } from '../../models/route.ts'
import type { Driver } from '../../models/driver.ts'
import type { Vehicle } from '../../models/vehicle.ts'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { getRouteStatusBadge } from '../../utils/formatters.tsx'

export interface RouteListPageProps {
  routes: Route[]
  drivers: Driver[]           // added to resolve driver names
  vehicles: Vehicle[]         // added to resolve vehicle names
  onReload: () => void
  onViewDetails: (id: string) => void
  onAuthorizeDispatch: (id: string) => void
  onUnauthorizeDispatch: (id: string) => void
}

export const RouteListPage: React.FC<RouteListPageProps> = ({
  routes,
  drivers,
  vehicles,
  onReload,
  onViewDetails,
  onAuthorizeDispatch,
  onUnauthorizeDispatch,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const safeRoutes = Array.isArray(routes) ? routes : []
  const filteredRoutes = safeRoutes.filter((route) => {
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter
    return matchesStatus
  })

  // Helper functions to resolve names from IDs – fall back to ID if not found
  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId)
    return driver ? driver.name : driverId
  }
  const getVehicleModel = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? vehicle.model : vehicleId
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rotas de Entregas</h1>
          <p className="page-description">
            Acompanhe o andamento das rotas dos motoristas.
          </p>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={onReload}>
            Recarregar
          </Button>
        </div>
      </div>

      <div className="filters-bar" style={{ justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Filtrar Status:
          </span>
          <Select
            style={{ width: '220px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'waitingDispatch', label: 'Aguardando Despacho' },
              { value: 'onCourse', label: 'Em Curso' },
              { value: 'completed', label: 'Concluída' },
            ]}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">ID Rota</TableHead>
            <TableHead className="min-w-[150px]">Motorista</TableHead>
            <TableHead className="min-w-[150px]">Veículo</TableHead>
            <TableHead className="min-w-[150px]">Status</TableHead>
            <TableHead className="min-w-[150px]">Pedidos</TableHead>
            <TableHead className="w-[140px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRoutes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Nenhuma rota localizada com os filtros informados.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            filteredRoutes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}
                  >
                    #{route.id.slice(0, 8)}
                  </span>
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>
                  {getDriverName(route.driverId)}
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>
                  {getVehicleModel(route.vehicleId)}
                </TableCell>
                <TableCell>{getRouteStatusBadge(route.status)}</TableCell>
                <TableCell style={{ color: 'var(--color-text-secondary)' }}>
                  {route.orderIds.length} pedidos
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    {route.status === 'waitingDispatch' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle size={15} color="var(--color-success-button)" />}
                          title="Autorizar Saída"
                          onClick={() => onAuthorizeDispatch(route.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<XCircle size={15} color="var(--color-danger-button)" />}
                          title="Desautorizar Saída"
                          onClick={() => onUnauthorizeDispatch(route.id)}
                        />
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye size={15} />}
                      title="Ver Detalhes da Rota"
                      onClick={() => onViewDetails(route.id)}
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
