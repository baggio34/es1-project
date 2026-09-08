import React, { useState } from 'react'
import type { Order, OrderStatus } from '../../models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { ArrowLeft, Pencil, Package, MapPin, Truck, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { formatCurrency, getOrderStatusBadge, formatReg } from '../../utils/formatters.tsx'

export interface OrderDetailPageProps {
  order: Order
  onBack: () => void
  onEdit: (id: string) => void
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus, extra?: any) => void
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
}) => {
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const currentIndex = statusOrderList.findIndex((s) => s.key === order.status)
  const isRejected = order.status === 'rejected'
  const isAccident = order.status === 'accident' || order.status === 'resolvedAccident'

  const driverId = 'driverId' in order ? order.driverId : undefined
  const vehicleId = 'vehicleId' in order ? order.vehicleId : undefined
  const arrivedOn = 'arrivedOn' in order ? order.arrivedOn : undefined
  const rejectMsg = 'reason' in order ? order.reason : undefined
  const accidentMsg = 'accidentMessage' in order ? order.accidentMessage : undefined

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
                return (
                  <div
                    key={step.key}
                    className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="timeline-step-circle">
                      {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                    </div>
                    <span className="timeline-step-label">{step.label}</span>
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
            <strong style={{ color: 'var(--color-danger-text)' }}>Pedido Rejeitado</strong>
            <p style={{ color: 'var(--color-danger-text)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Motivo informado: {rejectMsg || 'Incompatibilidade de transporte ou recusa cadastral.'}
            </p>
          </div>
        </div>
      )}

      {isAccident && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={20} color="var(--color-warning-text)" style={{ marginTop: '0.15rem' }} />
          <div>
            <strong style={{ color: 'var(--color-warning-text)' }}>Ocorrência de Trânsito Reportada</strong>
            <p style={{ color: 'var(--color-warning-text)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
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
                <span className="detail-label">Valor Declarado</span>
                <span className="detail-value" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {formatCurrency(order.value)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Peso Bruto</span>
                <span className="detail-value">{order.weight} kg</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Volume Cúbico</span>
                <span className="detail-value">{order.volume} m³</span>
              </div>
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
              <div className="detail-item">
                <span className="detail-label">Prazo Estimado</span>
                <span className="detail-value">Rotas Regionais (2 a 4 dias úteis)</span>
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

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Rejeitar Pedido"
        description="Informe o motivo da recusa deste pedido comercial."
        confirmText="Confirmar Rejeição"
        confirmVariant="destructive"
        onConfirm={() => {
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
    </div>
  )
}
