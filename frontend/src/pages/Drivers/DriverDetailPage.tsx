import React from 'react'
import type { DriverPreview, UserDetailed } from '../../../../sdk/src/models/user.ts'
import type { RoutePreview, RouteWithOrders } from '../../../../sdk/src/models/route.ts'
import type { VehicleSignature } from '../../../../sdk/src/models/vehicle.ts'
import type { OrderSignature } from '../../../../sdk/src/models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { ArrowLeft, Pencil, User, Truck, Package, Map } from 'lucide-react'
import { formatReg, getDriverStatusBadge } from '../../utils/formatters.tsx'

export type DriverDetailModel = Extract<UserDetailed, { role: 'DRIVER' }> | DriverPreview

export interface DriverDetailPageProps {
  driver: DriverDetailModel
  routes?: (RoutePreview | RouteWithOrders)[]
  vehicles?: VehicleSignature[]
  onBack: () => void
  onEdit: (id: string) => void
  onViewRoute?: (routeId: string) => void
}

export const DriverDetailPage: React.FC<DriverDetailPageProps> = ({
  driver,
  routes,
  vehicles,
  onBack,
  onEdit,
  onViewRoute,
}) => {
  const assignedRoute = driver.transportState !== 'FREE' ? driver.route : undefined
  const detailedRoute = assignedRoute
    ? routes?.find(r => r.id === assignedRoute.id) ?? assignedRoute
    : undefined

  const routeVehicle = detailedRoute?.vehicle
  const vehicle = routeVehicle
    ? vehicles?.find(v => v.plate === routeVehicle.plate || v.id === routeVehicle.id) ?? routeVehicle
    : undefined

  const hasVehicle = !!vehicle
  const orders: OrderSignature[] =
    detailedRoute && 'orders' in detailedRoute && Array.isArray(detailedRoute.orders)
      ? detailedRoute.orders
      : []
  const routeId = detailedRoute?.id
  const licenses = 'licenses' in driver ? driver.licenses : []

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Voltar à Lista
          </Button>
          <div>
            <h1 className="page-title">{driver.name}</h1>
            <p className="page-description">Identificador: @{driver.username}</p>
          </div>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<Pencil size={16} />} onClick={() => onEdit(driver.username)}>
            Editar Cadastro
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--color-primary)" />
              <CardTitle>Dados Pessoais</CardTitle>
            </div>
            {getDriverStatusBadge(driver.transportState)}
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Nome Completo</span>
                <span className="detail-value">{driver.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">CPF</span>
                <span className="detail-value detail-value-mono">{formatReg(driver.cpf)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status Operacional</span>
                <span className="detail-value">{getDriverStatusBadge(driver.transportState)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Usuário</span>
                <span className="detail-value detail-value-mono" style={{ fontSize: '0.8125rem' }}>
                  @{driver.username}
                </span>
              </div>
              {licenses.length > 0 && (
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Licenças Especiais (CNH)</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {licenses.map((lic) => (
                      <Badge key={lic.id} variant="secondary">{lic.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--color-primary)" />
              <CardTitle>Alocação de Transporte</CardTitle>
            </div>
            {routeId && (
              <Button variant="ghost" size="sm" icon= {<Map size={16}/>} onClick={() => onViewRoute?.(routeId)}>
                Ver Rota Atual
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {hasVehicle ? (
              <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Veículo Designado</span>
                  <span className="detail-value detail-value-mono">
                    {vehicle.plate.toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Modelo</span>
                  <span className="detail-value">{vehicle.model}</span>
                </div>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Total de Pedidos na Rota</span>
                  <span className="detail-value" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {orders.length} remessa(s) vinculada(s)
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p>Nenhum veículo vinculado atualmente.</p>
                {driver.transportState === 'FREE' && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    O motorista está com status <strong>Disponível</strong> para novas rotas.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="var(--color-primary)" />
            <CardTitle>Pedidos Vinculados ao Motorista</CardTitle>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {orders.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Nenhum pedido associado a este motorista no momento.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificador do Pedido</TableHead>
                  <TableHead>Cliente / Destino</TableHead>
                  <TableHead>Status da Carga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="detail-value-mono">#{order.id}</TableCell>
                    <TableCell>{order.clientName} — {order.destination}</TableCell>
                    <TableCell>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {driver.transportState === 'ON_ROUTE' ? 'Em Transporte' : 'Aguardando Despacho'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}