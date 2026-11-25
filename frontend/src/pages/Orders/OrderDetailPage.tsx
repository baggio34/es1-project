import React, { useState } from 'react'
import { cancellableOrderStatuses, type OrderDetailed, type OrderStatusEnum } from '../../../../sdk/src/models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { ArrowLeft, Package, MapPin, Truck, AlertTriangle, CheckCircle, Clock, Check, X, CreditCard, Box, Map as MapIcon, User, Sparkles, Edit3 } from 'lucide-react'
import { getOrderStatusBadge, formatReg } from '../../utils/formatters.tsx'
import type { DriverPreview, UserSignature } from '../../../../sdk/src/models/user.ts'
import type { VehicleDetailed, VehiclePreview } from '../../../../sdk/src/models/vehicle.ts'
import type { GetRouteSuggestionsReply } from '../../../../sdk/src/dtos/route.dto.ts'
import { orderApi } from '../../api/orderApi.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'

export interface OrderDetailPageProps {
  order: OrderDetailed
  drivers?: DriverPreview[]
  vehicles?: (VehiclePreview | VehicleDetailed)[]
  onBack: () => void
  onEdit?: (id: number) => void
  onViewRoute?: (routeId: string) => void
  onAction?: (actionType: string, orderId: number, payload?: any) => void
}

const statusOrderList: { key: OrderStatusEnum; label: string }[] = [
  { key: 'WAITING_APPROVAL', label: 'Aprovação' },
  { key: 'WAITING_PAYMENT', label: 'Pagamento' },
  { key: 'IN_PREPARATION', label: 'Preparação' },
  { key: 'LOADED', label: 'Carregado' },
  { key: 'WAITING_DISPATCH', label: 'Despacho' },
  { key: 'ON_ROUTE', label: 'Em Rota' },
  { key: 'ARRIVED', label: 'Entregue' },
]

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({
  order,
  drivers = [],
  vehicles = [],
  onBack,
  onEdit: _onEdit,
  onViewRoute,
  onAction,
}) => {
  const { user } = useAuth()
  const canManageStatus = ['ADMIN', 'MANAGER', 'OPERATOR'].includes(user?.role ?? '')

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [accidentModalOpen, setAccidentModalOpen] = useState(false)
  const [accidentReason, setAccidentReason] = useState('')
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [resolutionText, setResolutionText] = useState('')

  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [loadDriverId, setLoadDriverId] = useState('')
  const [loadVehicleId, setLoadVehicleId] = useState('')
  const [suggestionsData, setSuggestionsData] = useState<GetRouteSuggestionsReply | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const [isManualEdit, setIsManualEdit] = useState(false)

  const openLoadModal = () => {
    setLoadModalOpen(true)
    if (order.status !== 'IN_PREPARATION') return

    setLoadingSuggestions(true)
    setSuggestionsError(null)
    setSuggestionsData(null)
    setIsManualEdit(false)
    setLoadVehicleId('')
    setLoadDriverId('')

    orderApi
      .getSuggestions(order.id)
      .then((data) => {
        setSuggestionsData(data)
        const suggestedVehicleIds = Object.keys(data.suggestions || {})
        if (suggestedVehicleIds.length > 0) {
          const firstId = suggestedVehicleIds[0]!
          const veh = data.vehicles[firstId]
          const drv = data.suggestions[firstId]
          if (veh && drv) {
            setLoadVehicleId(veh.plate)
            setLoadDriverId(drv.username)
            setIsManualEdit(false)
          } else {
            setIsManualEdit(true)
          }
        } else {
          setIsManualEdit(true)
        }
      })
      .catch((err: any) => {
        setSuggestionsError(err?.message || 'Não foi possível carregar as sugestões automáticas.')
        setIsManualEdit(true)
      })
      .finally(() => {
        setLoadingSuggestions(false)
      })
  }

  const currentIndex = statusOrderList.findIndex((s) => s.key === order.status)
  const isRejected = order.status === 'REJECTED'
  const isCancelled = order.status === 'CANCELLED'
  const isAccident = order.status === 'ACCIDENT' || order.status === 'RESOLVED_ACCIDENT'

  const route = 'route' in order && order.route ? order.route : undefined

  const routeId = route?.id
  const arrivedOn = order.status === 'ARRIVED' ? order.arrivedOn : undefined
  const licenses = order.licenses
  const closingReason =
    order.status === 'CANCELLED' ? order.cancellationReason
    : order.status === 'REJECTED' ? order.rejectionReason
    : undefined

  const formatDate = (date?: string) => {
    if (!date) return ''
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const getUserDisplayName = (u?: UserSignature): string => (u ? u.name || u.username : '')

  const getStepTrackingInfo = (stepKey: OrderStatusEnum) => {
    let userRaw: UserSignature | undefined = undefined
    let dateRaw: string | undefined = undefined

    switch (stepKey) {
      case 'WAITING_APPROVAL':
        userRaw = order.createdBy
        dateRaw = order.createdAt
        break
      case 'WAITING_PAYMENT':
        if ('approvedBy' in order) {
          userRaw = order.approvedBy
          dateRaw = order.approvedOn
        }
        break
      case 'IN_PREPARATION':
        if ('paymentConfirmedBy' in order) {
          userRaw = order.paymentConfirmedBy
          dateRaw = order.paymentConfirmedOn
        }
        break
      case 'LOADED':
      case 'WAITING_DISPATCH':
        if ('loadedBy' in order) {
          userRaw = order.loadedBy
          dateRaw = order.loadedOn
        }
        break
      case 'ON_ROUTE':
        userRaw = route?.driver
        if ('route' in order && order.route && 'routeStartedOn' in order.route) dateRaw = order.route.routeStartedOn
        break
      case 'ARRIVED':
        userRaw = route?.driver
        if ('arrivedOn' in order) dateRaw = order.arrivedOn
        break
    }

    const userName = getUserDisplayName(userRaw)
    const formattedDate = dateRaw ? formatDate(dateRaw) : ''
    const hasData = Boolean(userName || formattedDate)

    return {
      userName,
      formattedDate,
      hasData,
    }
  }

  const renderActions = () => {
    if (!canManageStatus) return null

    switch (order.status) {
      case 'WAITING_APPROVAL':
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
      case 'WAITING_PAYMENT':
        return (
          <Button variant="default" icon={<CreditCard size={16} />} onClick={() => onAction?.('confirm-payment', order.id)}>
            Confirmar Pagamento
          </Button>
        )
      case 'IN_PREPARATION':
        return (
          <Button variant="default" icon={<Box size={16} />} onClick={openLoadModal}>
            Carregar Pedido
          </Button>
        )
      case 'LOADED':
        return (
          <Button variant="outline" icon={<Box size={16} />} onClick={() => onAction?.('unload', order.id)}>
            Descarregar Pedido
          </Button>
        )
      case 'ON_ROUTE':
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
      case 'ACCIDENT':
        return (
          <Button variant="default" icon={<Check size={16} />} onClick={() => setResolveModalOpen(true)}>
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
              Registrado em {formatDate(order.createdAt)} por {getUserDisplayName(order.createdBy)}
            </p>
          </div>
        </div>
        <div className="page-actions">
          {renderActions()}
          {canManageStatus && (cancellableOrderStatuses as readonly string[]).includes(order.status) && (
            <Button variant="outline" style={{ color: 'var(--color-danger-button)', borderColor: 'var(--color-danger-button)' }} icon={<X size={16} />} onClick={() => setCancelModalOpen(true)}>
              Cancelar Pedido
            </Button>
          )}
        </div>
      </div>

      {!isRejected && !isCancelled && !isAccident && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardContent style={{ padding: '1.25rem 1.5rem' }}>
            <div className="order-timeline">
              {statusOrderList.map((step, idx) => {
                const isCompleted = order.status === 'ARRIVED' ? true : currentIndex > idx
                const isCurrent = order.status === 'ARRIVED' ? false : currentIndex === idx
                const stepInfo = getStepTrackingInfo(step.key)
                const isPassed = isCompleted || (isCurrent && stepInfo.hasData)

                return (
                  <div
                    key={step.key}
                    className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="timeline-step-circle">
                      {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                    </div>
                    <span className="timeline-step-label">{step.label}</span>

                    {isPassed ? (
                      <div className="timeline-step-audit">
                        <div
                          className="timeline-step-audit-item"
                          title={stepInfo.userName ? `Confirmado por: ${stepInfo.userName}` : 'Confirmado'}
                        >
                          <User size={11} className="timeline-step-audit-icon" />
                          <span className="timeline-step-audit-name">
                            {stepInfo.userName || 'Confirmado'}
                          </span>
                        </div>
                        <div
                          className="timeline-step-audit-item"
                          title={stepInfo.formattedDate ? `Data: ${stepInfo.formattedDate}` : 'Data não informada'}
                        >
                          <Clock size={11} className="timeline-step-audit-icon" />
                          <span className="timeline-step-audit-date">
                            {stepInfo.formattedDate || '—'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="timeline-step-audit timeline-step-audit-pending">
                        <div className="timeline-step-audit-item">
                          <span className="timeline-step-audit-placeholder">—</span>
                        </div>
                      </div>
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
              Motivo informado: {closingReason || 'Motivo não informado.'}
            </p>
          </div>
        </div>
      )}

      {isAccident && (() => {
        const isResolved = order.status === 'RESOLVED_ACCIDENT'
        const color = isResolved ? 'var(--color-success-text)' : 'var(--color-warning-text)'
        return (
          <div
            style={{ padding: '1rem 1.25rem', backgroundColor: isResolved ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', border: `1px solid ${isResolved ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`, borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
          >
            <AlertTriangle size={20} color={color} style={{ marginTop: '0.15rem' }} />
            <div>
              <strong style={{ color }}>
                {isResolved ? 'Acidente Resolvido' : 'Ocorrência de Trânsito Reportada'}
              </strong>
              <p style={{ color, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {order.status === 'ACCIDENT' && <>Relato: {order.accidentDescription}</>}
                {order.status === 'RESOLVED_ACCIDENT' && <>Resolução: {order.accidentResolutionDescription}</>}
              </p>
            </div>
          </div>
        )
      })()}

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
                <span className="detail-label">Licenças Requeridas</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {licenses.length > 0 ? (
                    licenses.map((lic) => (
                      <Badge key={lic.id} variant="secondary">{lic.name}</Badge>
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
              <Button variant="ghost" size="sm" icon={<MapIcon size={14} />} onClick={() => onViewRoute?.(routeId)}>
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
                    {route.driver.name} (@{route.driver.username})
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Veículo da Frota</span>
                  <span className="detail-value detail-value-mono" style={{ fontSize: '0.8125rem' }}>
                    {route.vehicle.plate}
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
        const activeDrivers = (drivers || []).filter((d) => d.isActive)
        const activeVehicles = (vehicles || []).filter((v) => v.isActive)

        const selectedVehicleObj = activeVehicles.find((v) => v.plate === loadVehicleId || v.id === loadVehicleId)
        const selectedDriverObj = activeDrivers.find((d) => d.username === loadDriverId)

        const requiredLicenses: string[] = order.licenses.map((l) => l.name)

        const isWeightExceeded = !!selectedVehicleObj && Number(order.weight) > Number(selectedVehicleObj.maxLoad)
        const isVolumeExceeded = !!selectedVehicleObj && Number(order.volume) > Number(selectedVehicleObj.internalVolume)

        const vehicleLicenses: string[] =
          selectedVehicleObj && 'licenses' in selectedVehicleObj && Array.isArray(selectedVehicleObj.licenses)
            ? selectedVehicleObj.licenses.map((lic) => lic.name)
            : []
        const hasVehicleLicenseData = !!selectedVehicleObj && 'licenses' in selectedVehicleObj
        const missingVehicleLicenses = hasVehicleLicenseData
          ? requiredLicenses.filter((lic) => !vehicleLicenses.includes(lic))
          : []
        const isVehicleMissingLicense = missingVehicleLicenses.length > 0

        const isStateMismatch =
          !!selectedVehicleObj &&
          !!selectedDriverObj &&
          selectedVehicleObj.transportState !== selectedDriverObj.transportState

        const hasCapacityError = isWeightExceeded || isVolumeExceeded
        const hasLicenseError = isVehicleMissingLicense

        const canConfirmLoad = Boolean(
          !loadingSuggestions &&
          loadDriverId &&
          loadVehicleId &&
          !hasCapacityError &&
          !hasLicenseError &&
          !isStateMismatch
        )

        const suggestedVehicleIds = suggestionsData ? Object.keys(suggestionsData.suggestions || {}) : []
        const firstSuggestedId = suggestedVehicleIds[0]
        const suggestedVehicle = firstSuggestedId && suggestionsData ? suggestionsData.vehicles[firstSuggestedId] : undefined
        const suggestedDriver = firstSuggestedId && suggestionsData ? suggestionsData.suggestions[firstSuggestedId] : undefined
        const hasSuggestion = Boolean(suggestedVehicle && suggestedDriver)

        return (
          <Modal
            isOpen={loadModalOpen}
            onClose={() => setLoadModalOpen(false)}
            title="Carregar Pedido em Veículo"
            description="Selecione o motorista e o veículo adequados para realizar a entrega desta carga."
            confirmText={hasSuggestion && !isManualEdit ? 'Aprovar Sugestão Automática' : 'Confirmar Carregamento'}
            confirmDisabled={!canConfirmLoad}
            onConfirm={() => {
              if (!canConfirmLoad) return
              onAction?.('load', order.id, { driverUsername: loadDriverId, vehiclePlate: loadVehicleId.toUpperCase() })
              setLoadModalOpen(false)
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

              {loadingSuggestions && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                }}>
                  Buscando sugestão automática de veículo e motorista compatíveis...
                </div>
              )}

              {!loadingSuggestions && suggestionsError && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  fontSize: '0.8125rem',
                  color: '#b45309',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}>
                  <strong>Não foi possível obter a sugestão automática</strong>
                  <span>{suggestionsError} Você pode selecionar o veículo e o motorista manualmente abaixo.</span>
                </div>
              )}

              {!loadingSuggestions && !suggestionsError && !hasSuggestion && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  fontSize: '0.8125rem',
                  color: '#b45309',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}>
                  <strong>Nenhum par compatível encontrado automaticamente</strong>
                  <span>
                    Não há veículo e motorista disponíveis que atendam simultaneamente à capacidade e às licenças exigidas. Você pode escolher manualmente abaixo.
                  </span>
                </div>
              )}

              {!loadingSuggestions && hasSuggestion && suggestedVehicle && suggestedDriver && !isManualEdit && (
                <div style={{
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(34, 197, 94, 0.45)',
                  backgroundColor: 'rgba(34, 197, 94, 0.06)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 600 }}>
                    <Sparkles size={16} />
                    <span>Sugestão Automática Compatível</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.75rem' }}>Veículo sugerido:</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>
                        {suggestedVehicle.plate} — {suggestedVehicle.model} ({suggestedVehicle.color})
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.75rem' }}>Motorista sugerido:</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>
                        {suggestedDriver.name} (@{suggestedDriver.username})
                      </strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      icon={<Check size={14} />}
                      disabled={!canConfirmLoad}
                      onClick={() => {
                        if (!canConfirmLoad) return
                        onAction?.('load', order.id, {
                          driverUsername: suggestedDriver.username,
                          vehiclePlate: suggestedVehicle.plate.toUpperCase(),
                        })
                        setLoadModalOpen(false)
                      }}
                    >
                      Aprovar Sugestão Automática
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Edit3 size={14} />}
                      onClick={() => setIsManualEdit(true)}
                    >
                      Editar Sugestão
                    </Button>
                  </div>
                </div>
              )}

              {!loadingSuggestions && isManualEdit && (
                <>
                  {hasSuggestion && suggestedVehicle && suggestedDriver && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      <span>Editando seleção manualmente.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLoadVehicleId(suggestedVehicle.plate)
                          setLoadDriverId(suggestedDriver.username)
                          setIsManualEdit(false)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.75rem',
                        }}
                      >
                        Voltar para sugestão automática
                      </button>
                    </div>
                  )}

                  <div className="ui-form-group">
                    <label className="ui-label" style={{ fontWeight: 600 }}>1. Veículo de Transporte *</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs transition-colors outline-none hover:border-slate-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={loadVehicleId}
                      onChange={(e) => {
                        const nextVehicle = e.target.value
                        setLoadVehicleId(nextVehicle)
                        setLoadDriverId('')
                      }}
                    >
                      <option value="">Selecione um veículo com capacidade suficiente...</option>
                      {activeVehicles.map((v) => {
                        const isUnavailable = v.transportState === 'ON_ROUTE' || v.transportState === 'WAITING_DRIVER_DISPATCH'
                        const isAssembling = v.transportState === 'WAITING_OPERATOR_AUTHORIZATION'
                        const isUnderWeight = Number(order.weight) > Number(v.maxLoad)
                        const isUnderVolume = Number(order.volume) > Number(v.internalVolume)
                        const capacityWarning = (isUnderWeight || isUnderVolume) ? ' ⚠️ [Capacidade Insuficiente]' : ''
                        const stateLabel = isUnavailable
                          ? ' (Indisponível)'
                          : isAssembling
                            ? ' (Em Montagem de Rota)'
                            : ' (Disponível)'
                        return (
                          <option key={v.plate} value={v.plate} disabled={isUnavailable}>
                            {v.plate} - {v.model} (Carga: {v.maxLoad}kg | Vol: {v.internalVolume}m³){stateLabel}{capacityWarning}
                          </option>
                        )
                      })}
                    </select>
                  </div>

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

                  <div
                    className="ui-form-group"
                    style={{
                      opacity: loadVehicleId ? 1 : 0.5,
                      transition: 'opacity 0.2s ease',
                      cursor: loadVehicleId ? 'default' : 'not-allowed',
                    }}
                  >
                    <label
                      className="ui-label"
                      style={{
                        fontWeight: 600,
                        color: loadVehicleId ? 'inherit' : 'var(--color-text-muted)',
                        cursor: loadVehicleId ? 'default' : 'not-allowed',
                      }}
                    >
                      2. Motorista Responsável *
                    </label>
                    <select
                      disabled={!loadVehicleId}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs transition-colors outline-none hover:border-slate-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                      value={loadDriverId}
                      onChange={(e) => setLoadDriverId(e.target.value)}
                    >
                      <option value="">
                        {loadVehicleId ? 'Selecione um motorista...' : 'Bloqueado: selecione primeiro um veículo acima...'}
                      </option>
                      {activeDrivers.map((d) => {
                        const isBusy = d.transportState === 'ON_ROUTE' || d.transportState === 'WAITING_DRIVER_DISPATCH'
                        const isDifferentState = !!selectedVehicleObj && d.transportState !== selectedVehicleObj.transportState
                        const isDifferentRoute =
                          !!selectedVehicleObj &&
                          d.transportState === 'WAITING_OPERATOR_AUTHORIZATION' &&
                          d.route.vehicle.plate !== selectedVehicleObj.plate
                        const isDisabled = isBusy || isDifferentState || isDifferentRoute

                        const statusLabel =
                          d.transportState === 'FREE'
                            ? ' (Disponível)'
                            : d.transportState === 'WAITING_OPERATOR_AUTHORIZATION'
                              ? ` (Em Montagem de Rota - ${d.route.vehicle.plate})`
                              : ' (Indisponível)'

                        return (
                          <option key={d.username} value={d.username} disabled={isDisabled}>
                            {d.name} (@{d.username}){statusLabel}
                          </option>
                        )
                      })}
                    </select>
                    {!loadVehicleId ? (
                      <p style={{ marginTop: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        Escolha um veículo acima para liberar a seleção do motorista.
                      </p>
                    ) : null}
                  </div>
                </>
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
          onAction?.('report-accident', order.id, { accident: accidentReason })
          setAccidentModalOpen(false)
        }}
      >
        <div className="ui-form-group">
          <label className="ui-label">Detalhes da Ocorrência</label>
          <textarea className="ui-textarea" rows={3} placeholder="Ex: Acidente na rodovia..." value={accidentReason} onChange={(e) => setAccidentReason(e.target.value)} />
        </div>
      </Modal>

      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolver Acidente"
        description="Descreva como a ocorrência foi resolvida."
        confirmText="Confirmar Resolução"
        onConfirm={() => {
          onAction?.('resolve-accident', order.id, { description: resolutionText })
          setResolveModalOpen(false)
        }}
      >
        <div className="ui-form-group">
          <label className="ui-label">Descrição da Resolução</label>
          <textarea className="ui-textarea" rows={3} value={resolutionText} onChange={(e) => setResolutionText(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}