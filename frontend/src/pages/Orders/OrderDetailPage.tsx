import React, { useState } from 'react'
import type { Order, OrderStatus } from '../../models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { ArrowLeft, Pencil, Package, MapPin, Truck, AlertTriangle, CheckCircle, Clock, Check, X, CreditCard, Box, Map } from 'lucide-react'
import { getOrderStatusBadge, formatReg, formatCurrency } from '../../utils/formatters.tsx'
import { useAuth } from '../../contexts/AuthContext.tsx'

export interface OrderDetailPageProps {
  order: Order
  route?: { id?: string; driverId: string; vehicleId: string }
  vehicle?: { plate: string; model: string }
  users?: Record<string, string>
  drivers?: any[]
  vehicles?: any[]
  onBack: () => void
  onEdit: (id: number) => void
  onViewRoute?: (routeId: string) => void
  onAction?: (actionType: string, orderId: number, payload?: any) => void
}

const statusOrderList: { key: OrderStatus; label: string }[] = [
  { key: 'pendingApproval', label: 'Aprovação' },
  { key: 'waitingPayment', label: 'Pagamento' },
  { key: 'inPreparation', label: 'Preparação' },
  { key: 'loaded', label: 'Carga' },
  { key: 'waitingDispatch', label: 'Despacho' },
  { key: 'onRoute', label: 'Em Rota' },
  { key: 'arrived', label: 'Entregue' },
]

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({
  order,
  route,
  vehicle,
  users,
  drivers = [],
  vehicles = [],
  onBack,
  onEdit,
  onViewRoute,
  onAction,
}) => {
  const { user } = useAuth()
  const userRole = user?.role?.toLowerCase()
  // Admin, Manager e Operator podem gerenciar ações operacionais de pedidos
  const canManageStatus = ['admin', 'manager', 'operator'].includes(userRole || '')

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [accidentModalOpen, setAccidentModalOpen] = useState(false)
  const [accidentReason, setAccidentReason] = useState('')
  
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [loadDriverId, setLoadDriverId] = useState('')
  const [loadVehicleId, setLoadVehicleId] = useState('')

  const currentIndex = statusOrderList.findIndex((s) => s.key === order.status)
  const isRejected = order.status === 'rejected'
  const isCancelled = order.status === 'cancelled'
  const isAccident = order.status === 'accident' || order.status === 'resolvedAccident'

  const routeId = route?.id || (order as any).routeId
  const arrivedOn = order.arrivedOn
  
  const licenses = order.licenses || (order as any).requiredLicenses || []
  
  const formatDate = (date?: string) => (date ? new Date(date).toLocaleString('pt-BR') : '')
  const userName = (id: string) => users?.[id] ?? id

  const renderTimelineTimestamp = (stepKey: OrderStatus) => {
    switch (stepKey) {
      case 'pendingApproval': return formatDate(order.createdOn)
      case 'waitingPayment': return formatDate(order.approvedOn)
      case 'inPreparation': return formatDate(order.paymentConfirmedOn)
      case 'loaded': return formatDate(order.loadedAt)
      case 'arrived': return formatDate(order.arrivedOn)
      default: return ''
    }
  }

  const renderActions = () => {
    // Se não tiver permissão para gerir status, não mostra botões
    if (!canManageStatus) return null

    switch (order.status) {
      case 'pendingApproval':
        return (
          <>
            <Button variant="default" icon={<Check size={16} />} onClick={() => onAction?.('approve', order.id)}>
              Aprovar Pedido
            </Button>
            <Button variant="outline" style={{ color: 'var(--color-danger-button)', borderColor: 'var(--color-danger-button)' }} icon={<X size={16} />} onClick={() => setRejectModalOpen(true)}>
              Reprovar Pedido
            </Button>
          </>
        )
      case 'waitingPayment':
        return (
          <Button variant="default" icon={<CreditCard size={16} />} onClick={() => onAction?.('confirm-payment', order.id)}>
            Confirmar Pagamento
          </Button>
        )
      case 'inPreparation':
        return (
          <Button variant="default" icon={<Box size={16} />} onClick={() => setLoadModalOpen(true)}>
            Carregar Pedido
          </Button>
        )
      case 'waitingDispatch':
        return (
          <Button variant="outline" icon={<Box size={16} />} onClick={() => onAction?.('unload', order.id)}>
            Descarregar Pedido
          </Button>
        )
      case 'onRoute':
        return (
          <>
            <Button variant="default" icon={<CheckCircle size={16} />} onClick={() => onAction?.('confirm-arrival', order.id)}>
              Confirmar Entrega
            </Button>
            <Button variant="outline" style={{ color: 'var(--color-danger-button)', borderColor: 'var(--color-danger-button)' }} icon={<AlertTriangle size={16} />} onClick={() => setAccidentModalOpen(true)}>
              Reportar Acidente
            </Button>
          </>
        )
      case 'accident':
        return (
          <Button variant="default" icon={<Check size={16} />} onClick={() => onAction?.('resolve-accident', order.id)}>
            Resolver Acidente
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Voltar à Lista
          </Button>
          <div>
            <h1 className="page-title">Pedido #{order.id}</h1>
            <p className="page-description">
              Registrado em {formatDate(order.createdOn)} por {userName(order.createdBy)}
            </p>
          </div>
        </div>
        <div className="page-actions">
          {renderActions()}
          {canManageStatus && order.status !== 'arrived' && order.status !== 'rejected' && !isCancelled && (
            <Button variant="outline" style={{ color: 'var(--color-danger-button)', borderColor: 'var(--color-danger-button)' }} icon={<X size={16} />} onClick={() => setCancelModalOpen(true)}>
              Cancelar Pedido
            </Button>
          )}
        </div>
      </div>

      {!isRejected && !isCancelled && !isAccident && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardContent style={{ padding: '1.25rem 2rem' }}>
            <div className="order-timeline">
              {statusOrderList.map((step, idx) => {
                const isCompleted = currentIndex > idx
                const isCurrent = currentIndex === idx
                const timestamp = renderTimelineTimestamp(step.key)
                return (
                  <div key={step.key} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`} style={{ position: 'relative' }}>
                    <div className="timeline-step-circle">
                      {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                    </div>
                    <span className="timeline-step-label">{step.label}</span>
                    {timestamp && (
                      <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px', whiteSpace: 'nowrap' }}>
                        {timestamp}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {(isRejected || isCancelled) && (
        <div
          style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
        >
          <AlertTriangle size={20} color="var(--color-danger-text)" style={{ marginTop: '0.15rem' }} />
          <div>
            <strong style={{ color: 'var(--color-danger-text)' }}>{isCancelled ? 'Pedido Cancelado' : 'Pedido Rejeitado'}</strong>
            <p style={{ color: 'var(--color-danger-text)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Motivo informado: {(isCancelled ? order.cancellationReason : order.reason) || 'Motivo não informado.'}
            </p>
          </div>
        </div>
      )}

      {isAccident && (
        <div
          style={{ padding: '1rem 1.25rem', backgroundColor: order.status === 'resolvedAccident' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', border: `1px solid ${order.status === 'resolvedAccident' ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`, borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
        >
          <AlertTriangle size={20} color={order.status === 'resolvedAccident' ? 'var(--color-success-text)' : 'var(--color-warning-text)'} style={{ marginTop: '0.15rem' }} />
          <div>
            <strong style={{ color: order.status === 'resolvedAccident' ? 'var(--color-success-text)' : 'var(--color-warning-text)' }}>
              {order.status === 'resolvedAccident' ? 'Acidente Resolvido' : 'Ocorrência de Trânsito Reportada'}
            </strong>
            <p style={{ color: order.status === 'resolvedAccident' ? 'var(--color-success-text)' : 'var(--color-warning-text)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Relato: {order.accidentDescription || 'Incidente registrado na rota de entrega.'}
              {order.status === 'resolvedAccident' && order.resolutionDescription && (<> Resolução: {order.resolutionDescription}</>)}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} color="var(--color-primary)" />
              <CardTitle>Dados da Carga</CardTitle>
            </div>
            {getOrderStatusBadge(order.status)}
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Descrição dos Itens</span>
                <span className="detail-value">{order.description}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Peso Bruto</span>
                <span className="detail-value">{order.weight} kg</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Volume Cúbico</span>
                <span className="detail-value">{order.volume} m³</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Valor dos Itens</span>
                <span className="detail-value">{formatCurrency(order.value)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Preço do Frete</span>
                <span className="detail-value">{formatCurrency(order.shipmentPrice)}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Licenças Requeridas</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {licenses.length > 0 ? (
                    licenses.map((lic: string) => (
                      <Badge key={lic} variant="secondary">{lic}</Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Nenhuma licença especial exigida.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--color-primary)" />
              <CardTitle>Cliente & Destino</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Razão Social / Cliente</span>
                <span className="detail-value">{order.clientName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">CPF / CNPJ</span>
                <span className="detail-value detail-value-mono">{formatReg(order.clientRegistration)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Endereço de Entrega</span>
                <span className="detail-value">{order.destination}</span>
              </div>
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
              <Button variant="ghost" size="sm" icon={<Map size={14} />} onClick={() => onViewRoute?.(routeId)}>
                Ver Rota
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {route ? (
              <div className="details-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Motorista Alocado</span>
                  <span className="detail-value detail-value-mono" style={{ fontSize: '0.8125rem' }}>
                    {userName(route.driverId)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Veículo da Frota</span>
                  <span className="detail-value detail-value-mono" style={{ fontSize: '0.8125rem' }}>
                    {vehicle ? `${vehicle.model} (${vehicle.plate})` : route.vehicleId}
                  </span>
                </div>
                {routeId && (
                  <div className="detail-item">
                    <span className="detail-label">Rota Logística</span>
                    <span className="detail-value detail-value-mono" style={{ fontSize: '0.8125rem' }}>
                      {routeId}
                    </span>
                  </div>
                )}
                {arrivedOn && (
                  <div className="detail-item">
                    <span className="detail-label">Entregue com Sucesso Em</span>
                    <span className="detail-value" style={{ color: 'var(--color-success-text)', fontWeight: 600 }}>
                      {new Date(arrivedOn).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <Clock size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: 500 }}>Aguardando Vinculação</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  Este pedido aguarda a aprovação e a designação de um veículo e motorista disponíveis.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(() => {
        const activeDrivers = (drivers || []).filter((d: any) => d.condition !== 'deactivated')
        const activeVehicles = (vehicles || []).filter((v: any) => v.condition !== 'deactivated')

        const selectedVehicleObj = activeVehicles.find((v: any) => v.plate === loadVehicleId || v.id === loadVehicleId)
        const selectedDriverObj = activeDrivers.find((d: any) => d.username === loadDriverId || d.id === loadDriverId)

        const requiredLicenses: string[] = order.licenses || (order as any).requiredLicenses || []

        // Validação de Peso (Carga)
        const isWeightExceeded = !!selectedVehicleObj && (Number(order.weight) > Number(selectedVehicleObj.maxLoad))

        // Validação de Volume
        const isVolumeExceeded = !!selectedVehicleObj && (Number(order.volume) > Number(selectedVehicleObj.internalVolume))

        // Validação de Licenças do Veículo
        const vehicleLicenses: string[] = selectedVehicleObj?.licenses || []
        const missingVehicleLicenses = requiredLicenses.filter(lic => !vehicleLicenses.includes(lic))
        const isVehicleMissingLicense = !!selectedVehicleObj && missingVehicleLicenses.length > 0

        // Validação de Licenças do Condutor
        const driverLicenses: string[] = selectedDriverObj?.licenses || []
        const missingDriverLicenses = requiredLicenses.filter(lic => !driverLicenses.includes(lic))
        const isDriverMissingLicense = !!selectedDriverObj && missingDriverLicenses.length > 0

        const hasCapacityError = isWeightExceeded || isVolumeExceeded
        const hasLicenseError = isVehicleMissingLicense || isDriverMissingLicense

        const canConfirmLoad = Boolean(
          loadDriverId && 
          loadVehicleId && 
          !hasCapacityError && 
          !hasLicenseError
        )

        return (
          <Modal
            isOpen={loadModalOpen}
            onClose={() => setLoadModalOpen(false)}
            title="Carregar Pedido em Veículo"
            description="Selecione o motorista e o veículo adequados para realizar a entrega desta carga."
            confirmText="Confirmar Carregamento"
            confirmDisabled={!canConfirmLoad}
            onConfirm={() => {
              if (!canConfirmLoad) return
              onAction?.('load', order.id, { driverId: loadDriverId, vehicleId: loadVehicleId.toUpperCase() })
              setLoadModalOpen(false)
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Resumo de Requisitos da Carga */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8125rem'
              }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Peso do Pedido:</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{order.weight} kg</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Volume do Pedido:</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{order.volume} m³</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Licenças Exigidas:</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                    {requiredLicenses.length > 0 ? requiredLicenses.join(', ') : 'Nenhuma'}
                  </strong>
                </div>
              </div>

              {/* Select de Motorista */}
              <div className="ui-form-group">
                <label className="ui-label" style={{ fontWeight: 600 }}>Motorista Responsável *</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs transition-colors outline-none hover:border-slate-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  value={loadDriverId}
                  onChange={(e) => setLoadDriverId(e.target.value)}
                >
                  <option value="">Selecione um motorista...</option>
                  {activeDrivers.map((d: any) => {
                    const isBusy = d.status === 'onRoute'
                    const statusLabel = isBusy ? ' (Em Rota - Indisponível)' : d.status === 'waitingOperatorOrder' ? ' (Em Montagem de Rota)' : ' (Disponível)'
                    return (
                      <option key={d.username} value={d.username} disabled={isBusy}>
                        {d.name} (@{d.username}){statusLabel}
                      </option>
                    )
                  })}
                </select>
                {isDriverMissingLicense && (
                  <div style={{ marginTop: '0.35rem', color: 'var(--color-danger-text)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={14} />
                    <span>Motorista selecionado não possui as licenças: {missingDriverLicenses.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Select de Veículo */}
              <div className="ui-form-group">
                <label className="ui-label" style={{ fontWeight: 600 }}>Veículo de Transporte *</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs transition-colors outline-none hover:border-slate-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  value={loadVehicleId}
                  onChange={(e) => setLoadVehicleId(e.target.value)}
                >
                  <option value="">Selecione um veículo com capacidade suficiente...</option>
                  {activeVehicles.map((v: any) => {
                    const isBusy = v.status === 'onRoute'
                    const isUnderWeight = Number(order.weight) > Number(v.maxLoad)
                    const isUnderVolume = Number(order.volume) > Number(v.internalVolume)
                    const capacityWarning = (isUnderWeight || isUnderVolume) ? ' ⚠️ [Capacidade Insuficiente]' : ''
                    const statusLabel = isBusy ? ' (Em Rota - Indisponível)' : capacityWarning
                    return (
                      <option key={v.plate} value={v.plate} disabled={isBusy}>
                        {v.plate} - {v.model} (Carga: {v.maxLoad}kg | Vol: {v.internalVolume}m³){statusLabel}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Feedback de Validação do Veículo Selecionado */}
              {selectedVehicleObj && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${hasCapacityError || isVehicleMissingLicense ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
                  backgroundColor: hasCapacityError || isVehicleMissingLicense ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)',
                  fontSize: '0.8125rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Capacidade de Carga ({selectedVehicleObj.maxLoad} kg máx):</span>
                    {isWeightExceeded ? (
                      <span style={{ color: 'var(--color-danger-text)', fontWeight: 600 }}>
                        Insuficiente ({order.weight} kg &gt; {selectedVehicleObj.maxLoad} kg)
                      </span>
                    ) : (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        Compatível ({order.weight} kg / {selectedVehicleObj.maxLoad} kg)
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Capacidade Volumétrica ({selectedVehicleObj.internalVolume} m³ máx):</span>
                    {isVolumeExceeded ? (
                      <span style={{ color: 'var(--color-danger-text)', fontWeight: 600 }}>
                        Insuficiente ({order.volume} m³ &gt; {selectedVehicleObj.internalVolume} m³)
                      </span>
                    ) : (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        Compatível ({order.volume} m³ / {selectedVehicleObj.internalVolume} m³)
                      </span>
                    )}
                  </div>

                  {isVehicleMissingLicense && (
                    <div style={{ color: 'var(--color-danger-text)', fontWeight: 500, marginTop: '0.25rem' }}>
                      Veículo não possui as licenças: {missingVehicleLicenses.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal>
        )
      })()}

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reprovar Pedido"
        description="Informe o motivo da recusa deste pedido comercial."
        confirmText="Confirmar Rejeição"
        confirmVariant="destructive"
        onConfirm={() => {
          onAction?.('reject', order.id, { reason: rejectReason })
          setRejectModalOpen(false)
        }}
      >
        <div className="ui-form-group">
          <label className="ui-label">Motivo da Rejeição</label>
          <textarea className="ui-textarea" rows={3} placeholder="Ex: Carga excede as dimensões..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        </div>
      </Modal>

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancelar Pedido"
        description="Informe o motivo do cancelamento deste pedido."
        confirmText="Confirmar Cancelamento"
        confirmVariant="destructive"
        onConfirm={() => {
          onAction?.('cancel', order.id, { reason: cancelReason })
          setCancelModalOpen(false)
        }}
      >
        <div className="ui-form-group">
          <label className="ui-label">Motivo do Cancelamento</label>
          <textarea className="ui-textarea" rows={3} placeholder="Ex: Solicitação do cliente..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
        </div>
      </Modal>

      <Modal
        isOpen={accidentModalOpen}
        onClose={() => setAccidentModalOpen(false)}
        title="Reportar Acidente"
        description="Informe os detalhes da ocorrência na rota."
        confirmText="Reportar Acidente"
        confirmVariant="destructive"
        onConfirm={() => {
          onAction?.('report-accident', order.id, { accidentMessage: accidentReason })
          setAccidentModalOpen(false)
        }}
      >
        <div className="ui-form-group">
          <label className="ui-label">Detalhes da Ocorrência</label>
          <textarea className="ui-textarea" rows={3} placeholder="Ex: Acidente na rodovia..." value={accidentReason} onChange={(e) => setAccidentReason(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}