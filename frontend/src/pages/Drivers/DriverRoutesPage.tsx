import React from 'react'
import type { Route } from '../../models/route.ts'
import type { Order } from '../../models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Map, Package, CheckCircle, AlertTriangle, Eye } from 'lucide-react'
import { getOrderStatusBadge, getRouteStatusBadge } from '../../utils/formatters.tsx'

export interface DriverRoutesPageProps {
  currentRoute?: Route
  currentOrders?: Order[]
  pastRoutes: Route[]
  onConfirmDispatch?: (routeId: string) => void
  onConfirmArrival?: (orderId: string) => void
  onReportAccident?: (orderId: string) => void
  onViewOrderDetails: (orderId: string) => void
  onViewRouteDetails: (routeId: string) => void
}

export const DriverRoutesPage: React.FC<DriverRoutesPageProps> = ({
  currentRoute,
  currentOrders = [],
  pastRoutes,
  onConfirmDispatch,
  onConfirmArrival,
  onReportAccident,
  onViewOrderDetails,
  onViewRouteDetails,
}) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Minhas Rotas</h1>
          <p className="page-description">
            Acompanhe sua rota atual e gerencie as entregas do percurso.
          </p>
        </div>
      </div>

      {currentRoute ? (
        <Card style={{ marginBottom: '2rem', border: '2px solid var(--color-primary)' }}>
          <CardHeader style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Map size={20} color="var(--color-primary)" />
              <CardTitle>Rota em Execução #{currentRoute.id.slice(0, 8)}</CardTitle>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {getRouteStatusBadge(currentRoute.status)}
              {currentRoute.status === 'waitingDispatch' && (
                <Button variant="primary" icon={<CheckCircle size={16} />} onClick={() => onConfirmDispatch?.(currentRoute.id)}>
                  Iniciar Percurso
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent style={{ paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Pedidos da Rota</h3>
            {currentOrders.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Nenhum pedido carregado nesta rota.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentOrders.map(order => (
                  <div key={order.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: order.status === 'arrived' ? 'var(--color-success-bg)' : 'transparent'
                  }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>#{order.id.slice(0, 8)}</strong>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <p style={{ fontWeight: 500, marginTop: '0.25rem' }}>{order.description}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Destino: {order.destination}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {currentRoute.status === 'onCourse' && order.status === 'onRoute' && (
                        <>
                          <Button variant="primary" size="sm" icon={<CheckCircle size={15} />} onClick={() => onConfirmArrival?.(order.id)}>
                            Marcar Entregue
                          </Button>
                          <Button variant="outline" size="sm" style={{ color: 'var(--color-danger-text)', borderColor: 'var(--color-danger-border)' }} icon={<AlertTriangle size={15} />} onClick={() => onReportAccident?.(order.id)}>
                            Acidente
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" icon={<Eye size={15} />} onClick={() => onViewOrderDetails(order.id)}>
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card style={{ marginBottom: '2rem' }}>
          <CardContent style={{ padding: '3rem', textAlign: 'center' }}>
            <Map size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>Nenhuma Rota Ativa</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Você não possui nenhuma rota alocada ou em andamento no momento.</p>
          </CardContent>
        </Card>
      )}

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', marginTop: '2rem' }}>Rotas Anteriores</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">ID Rota</TableHead>
            <TableHead className="min-w-[150px]">Status</TableHead>
            <TableHead className="min-w-[150px]">Volume de Pedidos</TableHead>
            <TableHead className="w-[140px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pastRoutes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum histórico de rotas finalizadas.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            pastRoutes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    #{route.id.slice(0, 8)}
                  </span>
                </TableCell>
                <TableCell>{getRouteStatusBadge(route.status)}</TableCell>
                <TableCell style={{ color: 'var(--color-text-secondary)' }}>
                  {route.orderIds.length} pedidos vinculados
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <Button variant="ghost" size="sm" icon={<Eye size={15} />} onClick={() => onViewRouteDetails(route.id)}>
                    Ver Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
