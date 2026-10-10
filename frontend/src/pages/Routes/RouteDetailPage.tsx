import React from 'react'
import type { Route } from '../../models/route.ts'
import type { Order } from '../../models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { ArrowLeft, Truck, Package, CheckCircle, Map, User } from 'lucide-react'
import { getRouteStatusBadge, getOrderStatusBadge } from '../../utils/formatters.tsx'

export interface RouteDetailPageProps {
  route: Route
  orders: Order[]
  onBack: () => void
  onViewOrder: (orderId: string) => void
  onViewDriver: (driverId: string) => void
  onViewVehicle: (vehicleId: string) => void
}

export const RouteDetailPage: React.FC<RouteDetailPageProps> = ({
  route,
  orders,
  onBack,
  onViewOrder,
  onViewDriver,
  onViewVehicle,
}) => {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Voltar à Lista
          </Button>
          <div>
            <h1 className="page-title">Rota de Entrega #{route.id.slice(0, 8)}</h1>
            <p className="page-description">
              UUID: {route.id}
            </p>
          </div>
        </div>
        <div className="page-actions">
          {getRouteStatusBadge(route.status)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--color-primary)" />
              <CardTitle>Motorista Responsável</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onViewDriver(route.driverId)}>Ver Motorista</Button>
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="detail-item">
                <span className="detail-label">ID do Motorista</span>
                <span className="detail-value detail-value-mono">{route.driverId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--color-primary)" />
              <CardTitle>Veículo Alocado</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onViewVehicle(route.vehicleId)}>Ver Veículo</Button>
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="detail-item">
                <span className="detail-label">ID do Veículo</span>
                <span className="detail-value detail-value-mono">{route.vehicleId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="var(--color-primary)" />
            <CardTitle>Pedidos da Rota ({route.orderIds.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {orders.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Nenhum pedido vinculado a esta rota ou erro ao carregar os pedidos.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Código</TableHead>
                  <TableHead className="min-w-[200px]">Descrição da Carga</TableHead>
                  <TableHead className="min-w-[180px]">Destino</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="min-w-[140px]">Horário Status</TableHead>
                  <TableHead className="w-[110px]" style={{ textAlign: 'right' }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  let statusTime = ''
                  if (order.status === 'arrived' && 'arrivedOn' in order) {
                     statusTime = new Date(order.arrivedOn as string).toLocaleString('pt-BR')
                  } else if (order.status === 'accident' && 'accidentTime' in order) {
                     statusTime = new Date(order.accidentTime as string).toLocaleString('pt-BR')
                  }
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                          #{order.id.slice(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>{order.description}</TableCell>
                      <TableCell style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.destination}
                      </TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        {statusTime || '--'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <Button variant="ghost" size="sm" onClick={() => onViewOrder(order.id)}>Ver Pedido</Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
