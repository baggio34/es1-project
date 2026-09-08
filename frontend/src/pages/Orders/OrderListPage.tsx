import React, { useState } from 'react'
import type { Order } from '../../models/order.ts'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Input } from '../../components/ui/input.tsx'
import { NativeSelect as Select } from '../../components/ui/select.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, getOrderStatusBadge } from '../../utils/formatters.tsx'

export interface OrderListPageProps {
  orders: Order[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export const OrderListPage: React.FC<OrderListPageProps> = ({
  orders,
  onViewDetails,
  onEdit,
  onCreate,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  
  const safeOrders = Array.isArray(orders) ? orders : []
  const filteredOrders = safeOrders.filter((order) => {
    const query = searchTerm.toLowerCase()
    const matchesSearch =
      order.description.toLowerCase().includes(query) ||
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
          <Button icon={<Plus size={16} />} onClick={onCreate}>
            Novo Pedido
          </Button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <Input
            className="pl-10"
            placeholder="Buscar por cliente, descrição ou destino..."
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
              { value: 'pendingApproval', label: 'Pendente Aprovação' },
              { value: 'waitingPayment', label: 'Aguardando Pagamento' },
              { value: 'inPreparation', label: 'Em Preparação' },
              { value: 'waitingDispatch', label: 'Aguardando Despacho' },
              { value: 'onRoute', label: 'Em Rota' },
              { value: 'arrived', label: 'Entregue' },
              { value: 'rejected', label: 'Rejeitado' },
            ]}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Código</TableHead>
            <TableHead className="min-w-[200px]">Descrição da Carga</TableHead>
            <TableHead className="min-w-[160px]">Cliente Solicitante</TableHead>
            <TableHead className="min-w-[180px]">Destino</TableHead>
            <TableHead className="min-w-[120px]">Valor Total</TableHead>
            <TableHead className="min-w-[130px]">Peso / Volume</TableHead>
            <TableHead className="min-w-[140px]">Status</TableHead>
            <TableHead className="w-[110px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum pedido localizado com os filtros informados.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}
                  >
                    #{order.id.slice(0, 8)}
                  </span>
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>{order.description}</TableCell>
                <TableCell>{order.clientName}</TableCell>
                <TableCell style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.destination}>
                  {order.destination}
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>{formatCurrency(order.value)}</TableCell>
                <TableCell style={{ color: 'var(--color-text-secondary)' }}>
                  {order.weight} kg • {order.volume} m³
                </TableCell>
                <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye size={15} />}
                      title="Ver Detalhes do Pedido"
                      onClick={() => onViewDetails(order.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Pencil size={15} />}
                      title="Editar Pedido"
                      onClick={() => onEdit(order.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={15} color="var(--color-danger-button)" />}
                      title="Excluir Pedido"
                      onClick={() => setOrderToDelete(order)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        title="Confirmar Cancelamento / Exclusão de Pedido"
        description="Esta ação removerá o pedido dos registros do sistema."
        confirmText="Excluir Pedido"
        confirmVariant="destructive"
        onConfirm={() => {
          if (orderToDelete) {
            onDelete(orderToDelete.id)
            setOrderToDelete(null)
          }
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Deseja realmente excluir o pedido{' '}
          <strong>#{orderToDelete?.id.slice(0, 8)}</strong> ({orderToDelete?.description})?
        </p>
      </Modal>
    </div>
  )
}
