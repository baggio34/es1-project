import React, { useState, useEffect } from 'react'
import type { RoutePreview, RouteWithOrders } from '../../../../sdk/src/models/route.ts'
import type { OrderSignature, OrderStatusEnum } from '../../../../sdk/src/models/order.ts'
import { routeApi } from '../../api/routeApi.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { ArrowLeft, Truck, Package, CheckCircle, XCircle, User, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { getRouteStatusBadge, getOrderStatusBadge, formatReg } from '../../utils/formatters.tsx'
import { useAuth } from '../../contexts/AuthContext.tsx'

export type RouteOrderItem = OrderSignature & {
  description?: string
  arrivedOn?: string
  accidentOn?: string
}

export interface RouteDetailPageProps {
  route: RouteWithOrders | RoutePreview
  orders?: RouteOrderItem[]
  onBack: () => void
  onViewOrder: (orderId: string) => void
  onViewDriver: (driverUsername: string) => void
  onViewVehicle: (vehiclePlate: string) => void
  onAuthorizeDispatch?: (id: string) => void
  onUnauthorizeDispatch?: (id: string) => void
}

const EMPTY_ORDERS: RouteOrderItem[] = []

const isRouteWithOrders = (r: RouteWithOrders | RoutePreview): r is RouteWithOrders =>
  'createdBy' in r && Boolean(r.createdBy)

const sortOrdersByRouteIndex = (list: RouteOrderItem[]): RouteOrderItem[] =>
  [...list].sort((a, b) => (a.routeIndex ?? 0) - (b.routeIndex ?? 0))

const formatDateTime = (date?: string): string => {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  const [detailedRoute, setDetailedRoute] = useState<RouteWithOrders | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const hasFullDetails = isRouteWithOrders(route)

  useEffect(() => {
    if (hasFullDetails) return

    let cancelled = false
    setLoadingDetails(true)

    routeApi
      .getById(route.id)
      .then((data) => {
        if (!cancelled) {
          setDetailedRoute(data)
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar detalhes da rota:', error)
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingDetails(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [route.id, route.status, hasFullDetails])

  const activeRoute: RouteWithOrders | RoutePreview = hasFullDetails
    ? route
    : detailedRoute && detailedRoute.id === route.id
      ? detailedRoute
      : route

  const fullRoute: RouteWithOrders | null = isRouteWithOrders(activeRoute) ? activeRoute : null

  const canReorder =
    ['ADMIN', 'MANAGER', 'OPERATOR'].includes(user?.role ?? '') &&
    activeRoute.status !== 'COMPLETED'

  const routeOrders: RouteOrderItem[] = fullRoute?.orders ?? EMPTY_ORDERS
  const sourceOrders: RouteOrderItem[] = orders && orders.length > 0 ? orders : routeOrders
  const ordersKey = `${activeRoute.id}:${sourceOrders.map((o) => `${o.id}:${o.status}:${o.routeIndex ?? ''}`).join('|')}`

  const [prevOrdersKey, setPrevOrdersKey] = useState<string>(ordersKey)
  const [orderedOrders, setOrderedOrders] = useState<RouteOrderItem[]>(() =>
    sortOrdersByRouteIndex(sourceOrders)
  )
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  if (ordersKey !== prevOrdersKey) {
    setPrevOrdersKey(ordersKey)
    setOrderedOrders(sortOrdersByRouteIndex(sourceOrders))
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

  const orderCount = orderedOrders.length

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Voltar à Lista
          </Button>
          <div>
            <h1 className="page-title">Rota de Entrega #{activeRoute.id.slice(0, 8)}</h1>
            {fullRoute ? (
              <p className="page-description">
                Criada em {formatDateTime(fullRoute.createdAt)} por {fullRoute.createdBy.name} (@{fullRoute.createdBy.username})
              </p>
            ) : (
              <p className="page-description">UUID: {activeRoute.id}</p>
            )}
          </div>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {activeRoute.status === 'WAITING_OPERATOR_AUTHORIZATION' && (
            <Button
              variant="default"
              icon={<CheckCircle size={16} />}
              onClick={() => onAuthorizeDispatch?.(activeRoute.id)}
            >
              Autorizar Saída
            </Button>
          )}
          {activeRoute.status === 'WAITING_DRIVER_DISPATCH' && (
            <Button
              variant="outline"
              style={{ color: 'var(--color-danger-text)', borderColor: 'var(--color-danger-border)' }}
              icon={<XCircle size={16} />}
              onClick={() => onUnauthorizeDispatch?.(activeRoute.id)}
            >
              Desautorizar Saída
            </Button>
          )}
          {getRouteStatusBadge(activeRoute.status)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--color-primary)" />
              <CardTitle>Motorista Responsável</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onViewDriver(activeRoute.driver.username)}>
              Ver Motorista
            </Button>
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Nome</span>
                <span className="detail-value">{activeRoute.driver.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Usuário</span>
                <span className="detail-value detail-value-mono">@{activeRoute.driver.username}</span>
              </div>
              {fullRoute && fullRoute.status !== 'WAITING_OPERATOR_AUTHORIZATION' && (
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Despacho Autorizado Por</span>
                  <span className="detail-value">
                    {fullRoute.dispatchApprovedBy.name} em {formatDateTime(fullRoute.dispatchApprovedOn)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--color-primary)" />
              <CardTitle>Veículo Alocado</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onViewVehicle(activeRoute.vehicle.plate)}>
              Ver Veículo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Placa</span>
                <span className="detail-value detail-value-mono">{activeRoute.vehicle.plate.toUpperCase()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Modelo / Cor</span>
                <span className="detail-value">{activeRoute.vehicle.model} ({activeRoute.vehicle.color})</span>
              </div>
              {fullRoute && (fullRoute.status === 'ON_COURSE' || fullRoute.status === 'COMPLETED') && (
                <div className="detail-item">
                  <span className="detail-label">Início do Percurso</span>
                  <span className="detail-value">{formatDateTime(fullRoute.routeStartedOn)}</span>
                </div>
              )}
              {fullRoute && fullRoute.status === 'COMPLETED' && (
                <div className="detail-item">
                  <span className="detail-label">Conclusão da Rota</span>
                  <span className="detail-value">{formatDateTime(fullRoute.routeCompletedOn)}</span>
                </div>
              )}
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
          {loadingDetails && orderedOrders.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Carregando pedidos da rota...
            </div>
          ) : orderedOrders.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Nenhum pedido vinculado a esta rota.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Sequência</TableHead>
                  <TableHead className="w-[110px]">Código</TableHead>
                  <TableHead className="min-w-[200px]">Cliente / Carga</TableHead>
                  <TableHead className="min-w-[180px]">Destino</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="min-w-[140px]">Horário Status</TableHead>
                  <TableHead className="w-[110px]" style={{ textAlign: 'right' }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedOrders.map((order, idx) => {
                  let statusTime = ''
                  if (order.status === 'ARRIVED' && order.arrivedOn) {
                    statusTime = formatDateTime(order.arrivedOn)
                  } else if (order.status === 'ACCIDENT' && order.accidentOn) {
                    statusTime = formatDateTime(order.accidentOn)
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
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>
                          {order.description || order.clientName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {order.description ? `${order.clientName} • ` : ''}
                          {formatReg(order.clientRegistration)}
                        </div>
                      </TableCell>
                      <TableCell style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.destination}
                      </TableCell>
                      <TableCell>{getOrderStatusBadge(order.status as OrderStatusEnum)}</TableCell>
                      <TableCell style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        {statusTime || '--'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <Button variant="ghost" size="sm" onClick={() => onViewOrder(String(order.id))}>
                          Ver Pedido
                        </Button>
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