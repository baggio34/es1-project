import React, { useState } from 'react'
import { cancellableOrderStatuses, type OrderPreview } from '../../../../sdk/src/models/order.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Plus, Search, Eye, Trash2, RefreshCw } from 'lucide-react'
import { getOrderStatusBadge } from '../../utils/formatters.tsx'

export interface OrderListPageProps {
  orders: OrderPreview[]
  onViewDetails: (id: number) => void
  onEdit: (id: number) => void
  onCreate: () => void
  onDelete: (id: number, reason: string) => void
  onReload: () => void
}

export const OrderListPage: React.FC<OrderListPageProps> = ({
  orders,
  onViewDetails,
  onCreate,
  onDelete,
  onReload,
}) => {
  const { user } = useAuth()

  const canCreate = ['ADMIN', 'MANAGER', 'CLERK'].includes(user?.role ?? '')
  const canManageStatus = ['ADMIN', 'MANAGER'].includes(user?.role ?? '')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [orderToDelete, setOrderToDelete] = useState<OrderPreview | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [showReasonError, setShowReasonError] = useState(false)

  const closeCancelModal = () => {
    setOrderToDelete(null)
    setCancelReason('')
    setShowReasonError(false)
  }

  const safeOrders = Array.isArray(orders) ? orders : []
  const filteredOrders = safeOrders.filter((order) => {
    const query = searchTerm.toLowerCase()
    const matchesSearch =
      order.clientName.toLowerCase().includes(query) ||
      order.destination.toLowerCase().includes(query) ||
      order.clientRegistration.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Pedidos</h1>
          <p className="page-description">
            Acompanhe o ciclo de vida dos pedidos, desde a aprovação até a entrega ao destino final.
          </p>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={onReload}>
            Recarregar
          </Button>
          {canCreate && (
            <Button icon={<Plus size={16} />} onClick={onCreate}>
              Novo Pedido
            </Button>
          )}
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <Input
            className="pl-10"
            placeholder="Buscar por cliente, CPF/CNPJ ou destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
              { value: 'WAITING_APPROVAL', label: 'Pendente Aprovação' },
              { value: 'WAITING_PAYMENT', label: 'Aguardando Pagamento' },
              { value: 'IN_PREPARATION', label: 'Em Preparação' },
              { value: 'LOADED', label: 'Carregado' },
              { value: 'WAITING_DISPATCH', label: 'Aguardando Despacho' },
              { value: 'ON_ROUTE', label: 'Em Rota' },
              { value: 'ARRIVED', label: 'Entregue' },
              { value: 'REJECTED', label: 'Rejeitado' },
              { value: 'ACCIDENT', label: 'Acidente' },
              { value: 'RESOLVED_ACCIDENT', label: 'Acidente Resolvido' },
              { value: 'CANCELLED', label: 'Cancelado' },
            ]}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Código</TableHead>
            <TableHead className="min-w-[170px]">Cliente Solicitante</TableHead>
            <TableHead className="min-w-[190px]">Destino</TableHead>
            <TableHead className="min-w-[140px]">Peso / Volume</TableHead>
            <TableHead className="min-w-[150px]">Status</TableHead>
            <TableHead className="w-[120px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum pedido localizado com os filtros informados.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    #{order.id}
                  </span>
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>{order.clientName}</TableCell>
                <TableCell style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.destination}>
                  {order.destination}
                </TableCell>
                <TableCell style={{ color: 'var(--color-text-secondary)' }}>
                  {order.weight} kg • {order.volume} m³
                </TableCell>
                <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" size="sm" icon={<Eye size={15} />} title="Ver Detalhes do Pedido" onClick={() => onViewDetails(order.id)} />
                    {canManageStatus && (cancellableOrderStatuses as readonly string[]).includes(order.status) && (
                      <Button variant="ghost" size="sm" icon={<Trash2 size={15} color="var(--color-danger-button)" />} title="Cancelar Pedido" onClick={() => setOrderToDelete(order)} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={!!orderToDelete}
        onClose={closeCancelModal}
        title="Cancelar Pedido"
        description="O pedido não será apagado: ele continua no histórico com o status Cancelado."
        confirmText="Confirmar Cancelamento"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!orderToDelete) return
          if (!cancelReason.trim()) {
            setShowReasonError(true)
            return
          }
          onDelete(orderToDelete.id, cancelReason.trim())
          closeCancelModal()
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Deseja realmente cancelar o pedido <strong>#{orderToDelete?.id}</strong> ({orderToDelete?.clientName})?
        </p>
        <div className="ui-form-group" style={{ marginTop: '1rem' }}>
          <label className="ui-label">Motivo do Cancelamento</label>
          <textarea className="ui-textarea" rows={3} placeholder="Ex: Solicitação do cliente, dados inconsistentes..." value={cancelReason} onChange={(e) => { setCancelReason(e.target.value); setShowReasonError(false) }} />
          {showReasonError && (
            <span className="text-xs font-medium text-red-600">Informe o motivo do cancelamento.</span>
          )}
        </div>
      </Modal>
    </div>
  )
}