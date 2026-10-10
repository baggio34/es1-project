import React, { useState } from 'react'
import type { Order, OrderStatus } from '../../models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { ArrowLeft, Pencil, Package, MapPin, Truck, AlertTriangle, CheckCircle, Clock, Check, X, CreditCard, Box, Map } from 'lucide-react'
import { getOrderStatusBadge, formatReg } from '../../utils/formatters.tsx'

export interface OrderDetailPageProps {
  order: Order
  onBack: () => void
  onEdit: (id: string) => void
  onViewRoute?: (routeId: string) => void
  onAction?: (actionType: string, orderId: string, payload?: any) => void
}

const statusOrderList: { key: OrderStatus; label: string }[] = [
  { key: 'pendingApproval', label: 'Aprovação' },
  { key: 'waitingPayment', label: 'Pagamento' },
  { key: 'inPreparation', label: 'Preparação' },
  { key: 'waitingDispatch', label: 'Despacho' },
  { key: 'onRoute', label: 'Em Rota' },
  { key: 'arrived', label: 'Entregue' },
]

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({
  order,
  onBack,
  onEdit,
  onViewRoute,
  onAction,
}) => {
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [accidentModalOpen, setAccidentModalOpen] = useState(false)
  const [accidentReason, setAccidentReason] = useState('')

  const currentIndex = statusOrderList.findIndex((s) => s.key === order.status)
  const isRejected = order.status === 'rejected'
  const isAccident = order.status === 'accident' || order.status === 'resolvedAccident'

  const driverId = 'driverId' in order ? order.driverId : undefined
  const vehicleId = 'vehicleId' in order ? order.vehicleId : undefined
  const routeId = 'routeId' in order ? order.routeId : undefined
  const arrivedOn = 'arrivedOn' in order ? order.arrivedOn : undefined
  const rejectMsg = 'reason' in order ? order.reason : undefined
  const accidentMsg = 'accidentMessage' in order ? order.accidentMessage : undefined
  const requiredLicenses = order.requiredLicenses || []

  const renderTimelineTimestamp = (stepKey: OrderStatus) => {
    switch (stepKey) {
      case 'pendingApproval':
        return order.registeredOn ? new Date(order.registeredOn).toLocaleString('pt-BR') : ''
      case 'waitingPayment':
        return 'approvedOn' in order && order.approvedOn ? new Date(order.approvedOn).toLocaleString('pt-BR') : ''
      case 'inPreparation':
        return 'paymentConfirmedOn' in order && order.paymentConfirmedOn ? new Date(order.paymentConfirmedOn).toLocaleString('pt-BR') : ''
      case 'waitingDispatch':
        return 'loadedOn' in order && order.loadedOn ? new Date(order.loadedOn).toLocaleString('pt-BR') : ''
      case 'onRoute':
        // we can use the route dispatched time if we had it, but keeping it empty if not available
        return ''
      case 'arrived':
        return arrivedOn ? new Date(arrivedOn).toLocaleString('pt-BR') : ''
      default:
        return ''
    }
  }

  const renderActions = () => {
    switch (order.status) {
      case 'pendingApproval':
        return (
          <>
            <Button variant="primary" icon={<Check size={16} />} onClick={() => onAction?.('approve', order.id)}>
              Aprovar Pedido
            </Button>
            <Button variant="outline" style={{ color: 'var(--color-danger-button)', borderColor: 'var(--color-danger-button)' }} icon={<X size={16} />} onClick={() => setRejectModalOpen(true)}>
              Reprovar Pedido
            </Button>
          </>
        )
      case 'waitingPayment':
        return (
          <Button variant="primary" icon={<CreditCard size={16} />} onClick={() => onAction?.('confirm-payment', order.id)}>
            Confirmar Pagamento
          </Button>
        )
      case 'inPreparation':
        return (
          <Button variant="primary" icon={<Box size={16} />} onClick={() => onAction?.('load', order.id)}>
            Carregar Pedido
          </Button>
        )
      case 'waitingDispatch':
        return (
          <>
            <Button variant="outline" icon={<Box size={16} />} onClick={() => onAction?.('unload', order.id)}>
              Descarregar Pedido
            </Button>
          </>
        )
      case 'onRoute':
        return (
          <>
            <Button variant="primary" icon={<CheckCircle size={16} />} onClick={() => onAction?.('confirm-arrival', order.id)}>
              Confirmar Entrega
            </Button>
            <Button variant="outline" style={{ color: 'var(--color-danger-button)', borderColor: 'var(--color-danger-button)' }} icon={<AlertTriangle size={16} />} onClick={() => setAccidentModalOpen(true)}>
              Reportar Acidente
            </Button>
          </>
        )
      case 'accident':
        return (
          <Button variant="primary" icon={<Check size={16} />} onClick={() => onAction?.('resolve-accident', order.id)}>
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
            <h1 className="page-title">Pedido #{order.id.slice(0, 8)}</h1>
            <p className="page-description">
              Registrado em {new Date(order.registeredOn).toLocaleString('pt-BR')} • UUID: {order.id}
            </p>
          </div>
        </div>
        <div className="page-actions">
          {renderActions()}
          {order.status !== 'arrived' && order.status !== 'rejected' && (
            <Button variant="outline" style={{ color: 'var(--color-danger-button)', borderColor: 'var(--color-danger-button)' }} icon={<X size={16} />} onClick={() => setCancelModalOpen(true)}>
              Cancelar Pedido
            </Button>
          )}
          <Button variant="outline" icon={<Pencil size={16} />} onClick={() => onEdit(order.id)}>
            Editar Pedido
          </Button>
        </div>
      </div>

      {/* Linha do Tempo Visual do Ciclo do Pedido */}
      {!isRejected && !isAccident && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardContent style={{ padding: '1.25rem 2rem' }}>
            <div className="order-timeline">
              {statusOrderList.map((step, idx) => {
                const isCompleted = currentIndex > idx
                const isCurrent = currentIndex === idx
                const timestamp = renderTimelineTimestamp(step.key)
                return (
                  <div
                    key={step.key}
                    className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    style={{ position: 'relative' }}
                  >
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

      {/* Alerta em caso de Rejeição ou Acidente */}
      {isRejected && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={20} color="var(--color-danger-text)" style={{ marginTop: '0.15rem' }} />
          <div>
            <strong style={{ color: 'var(--color-danger-text)' }}>Pedido Rejeitado ou Cancelado</strong>
            <p style={{ color: 'var(--color-danger-text)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Motivo informado: {rejectMsg || 'Cancelamento solicitado ou recusa cadastral.'}
            </p>
          </div>
        </div>
      )}

      {isAccident && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: order.status === 'resolvedAccident' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
            border: `1px solid ${order.status === 'resolvedAccident' ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={20} color={order.status === 'resolvedAccident' ? 'var(--color-success-text)' : 'var(--color-warning-text)'} style={{ marginTop: '0.15rem' }} />
          <div>
            <strong style={{ color: order.status === 'resolvedAccident' ? 'var(--color-success-text)' : 'var(--color-warning-text)' }}>
              {order.status === 'resolvedAccident' ? 'Acidente Resolvido' : 'Ocorrência de Trânsito Reportada'}
            </strong>
            <p style={{ color: order.status === 'resolvedAccident' ? 'var(--color-success-text)' : 'var(--color-warning-text)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Relato: {accidentMsg || 'Incidente registrado na rota de entrega.'}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Detalhes da Carga */}
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
              {requiredLicenses.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Licenças Requeridas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {requiredLicenses.map((lic) => (
                      <Badge key={lic} variant="secondary">{lic}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Cliente */}
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

        {/* Alocação Logística */}
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
            {driverId && vehicleId ? (
              <div className="details-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Motorista Alocado</span>
                  <span className="detail-value detail-value-mono" style={{ fontSize: '0.8125rem' }}>
                    {driverId}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Veículo da Frota</span>
                  <span className="detail-value detail-value-mono" style={{ fontSize: '0.8125rem' }}>
                    {vehicleId}
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

      {/* Modal de Rejeição */}
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
          <textarea
            className="ui-textarea"
            rows={3}
            placeholder="Ex: Carga excede as dimensões de segurança da frota..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal de Cancelamento */}
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
          <textarea
            className="ui-textarea"
            rows={3}
            placeholder="Ex: Solicitação do cliente, dados inconsistentes..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal de Acidente */}
      <Modal
        isOpen={accidentModalOpen}
        onClose={() => setAccidentModalOpen(false)}
        title="Reportar Acidente"
        description="Informe os detalhes da ocorrência na rota."
        confirmText="Reportar Acidente"
        confirmVariant="destructive"
        onConfirm={() => {
          onAction?.('report-accident', order.id, { reason: accidentReason })
          setAccidentModalOpen(false)
        }}
      >
        <div className="ui-form-group">
          <label className="ui-label">Detalhes da Ocorrência</label>
          <textarea
            className="ui-textarea"
            rows={3}
            placeholder="Ex: Acidente na rodovia BR-101..."
            value={accidentReason}
            onChange={(e) => setAccidentReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
