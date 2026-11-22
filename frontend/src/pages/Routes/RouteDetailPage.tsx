import React, { useState } from 'react'
import type { Route } from '../../models/route.ts'
import type { Order } from '../../models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { ArrowLeft, Truck, Package, CheckCircle, XCircle, User, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { getRouteStatusBadge, getOrderStatusBadge } from '../../utils/formatters.tsx'
import { useAuth } from '../../contexts/AuthContext.tsx'

export interface RouteDetailPageProps {
  route: Route
  orders: Order[]
  onBack: () => void
  onViewOrder: (orderId: string) => void
  onViewDriver: (driverId: string) => void
  onViewVehicle: (vehicleId: string) => void
  onAuthorizeDispatch?: (id: string) => void
  onUnauthorizeDispatch?: (id: string) => void
}

export const RouteDetailPage: React.FC<RouteDetailPageProps> = ({
  route,
  orders,
  onBack,
  onViewOrder,
  onViewDriver,
  onViewVehicle,
  onAuthorizeDispatch,
  onUnauthorizeDispatch,
}) => {
  const { user } = useAuth()
  const userRole = user?.role?.toLowerCase()
  const canReorder = ['admin', 'manager', 'operator'].includes(userRole || '') && route.status !== 'completed'

  const [prevOrders, setPrevOrders] = useState(orders)
  const [orderedOrders, setOrderedOrders] = useState<Order[]>(orders)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  if (orders !== prevOrders) {
    setPrevOrders(orders)
    setOrderedOrders(orders)
  }

  const moveOrder = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedOrders.length || fromIndex === toIndex) return
    const updated = [...orderedOrders]
    const [movedItem] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, movedItem)
    setOrderedOrders(updated)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      moveOrder(draggedIndex, targetIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const orderCount = orderedOrders?.length || route.orders?.length || 0

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
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {route.status === 'waitingOperatorOrder' && (
            <Button 
              variant="default" 
              icon={<CheckCircle size={16} />} 
              onClick={() => onAuthorizeDispatch?.(route.id)}
            >
              Autorizar Saída
            </Button>
          )}
          {route.status === 'readyToDispatch' && (
            <Button 
              variant="outline" 
              style={{ color: 'var(--color-danger-text)', borderColor: 'var(--color-danger-border)' }} 
              icon={<XCircle size={16} />} 
              onClick={() => onUnauthorizeDispatch?.(route.id)}
            >
              Desautorizar Saída
            </Button>
          )}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} color="var(--color-primary)" />
              <CardTitle>Pedidos da Rota ({orderCount})</CardTitle>
            </div>
            {canReorder && orderedOrders.length > 1 && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                Arraste o ícone ⠿ ou use as setas para reordenar a sequência de entrega
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {orderedOrders.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Nenhum pedido vinculado a esta rota ou erro ao carregar os pedidos.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Sequência</TableHead>
                  <TableHead className="w-[110px]">Código</TableHead>
                  <TableHead className="min-w-[200px]">Descrição da Carga</TableHead>
                  <TableHead className="min-w-[180px]">Destino</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="min-w-[140px]">Horário Status</TableHead>
                  <TableHead className="w-[110px]" style={{ textAlign: 'right' }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedOrders.map((order, idx) => {
                  let statusTime = ''
                  if (order.status === 'arrived' && 'arrivedOn' in order) {
                     statusTime = new Date(order.arrivedOn as string).toLocaleString('pt-BR')
                  } else if (order.status === 'accident' && 'accidentTime' in order) {
                     statusTime = new Date(order.accidentTime as string).toLocaleString('pt-BR')
                  }

                  const isDragging = draggedIndex === idx
                  const isDragTarget = dragOverIndex === idx && draggedIndex !== idx

                  return (
                    <TableRow
                      key={order.id}
                      draggable={canReorder}
                      onDragStart={canReorder ? (e) => handleDragStart(e, idx) : undefined}
                      onDragOver={canReorder ? (e) => handleDragOver(e, idx) : undefined}
                      onDrop={canReorder ? (e) => handleDrop(e, idx) : undefined}
                      onDragEnd={canReorder ? handleDragEnd : undefined}
                      style={{
                        opacity: isDragging ? 0.4 : 1,
                        backgroundColor: isDragTarget ? 'rgba(30, 64, 175, 0.08)' : undefined,
                        borderTop: isDragTarget ? '2px solid var(--color-primary)' : undefined,
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {canReorder && (
                            <span
                              title="Arrastar para reordenar"
                              style={{
                                cursor: 'grab',
                                color: 'var(--color-text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px',
                              }}
                            >
                              <GripVertical size={16} />
                            </span>
                          )}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-bg-subtle)',
                              border: '1px solid var(--color-border)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            {idx + 1}º
                          </span>
                          {canReorder && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => { e.stopPropagation(); moveOrder(idx, idx - 1) }}
                                title="Mover para cima"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  opacity: idx === 0 ? 0.25 : 0.7,
                                  padding: 0,
                                  lineHeight: 1,
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === orderedOrders.length - 1}
                                onClick={(e) => { e.stopPropagation(); moveOrder(idx, idx + 1) }}
                                title="Mover para baixo"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: idx === orderedOrders.length - 1 ? 'not-allowed' : 'pointer',
                                  opacity: idx === orderedOrders.length - 1 ? 0.25 : 0.7,
                                  padding: 0,
                                  lineHeight: 1,
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                          #{order.id}
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
                        <Button variant="ghost" size="sm" onClick={() => onViewOrder(String(order.id))}>Ver Pedido</Button>
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