import React from 'react'
import type { Driver } from '../../models/driver.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { ArrowLeft, Pencil, User, Truck, Package } from 'lucide-react'
import { formatReg, getDriverStatusBadge } from '../../utils/formatters.tsx'

export interface DriverDetailPageProps {
  driver: Driver
  onBack: () => void
  onEdit: (id: string) => void
}

export const DriverDetailPage: React.FC<DriverDetailPageProps> = ({
  driver,
  onBack,
  onEdit,
}) => {
  const hasVehicle = 'vehicleId' in driver && driver.vehicleId
  const orderIds = 'orderIds' in driver ? driver.orderIds : []

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Voltar à Lista
          </Button>
          <div>
            <h1 className="page-title">{driver.name}</h1>
            <p className="page-description">Identificador: {driver.id}</p>
          </div>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<Pencil size={16} />} onClick={() => onEdit(driver.id)}>
            Editar Cadastro
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--color-primary)" />
              <CardTitle>Dados Pessoais</CardTitle>
            </div>
            {getDriverStatusBadge(driver.status)}
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Nome Completo</span>
                <span className="detail-value">{driver.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">CPF</span>
                <span className="detail-value detail-value-mono">{formatReg(driver.cpf)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status Operacional</span>
                <span className="detail-value">{getDriverStatusBadge(driver.status)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Código UUID</span>
                <span className="detail-value detail-value-mono" style={{ fontSize: '0.8125rem' }}>
                  {driver.id}
                </span>
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
          </CardHeader>
          <CardContent>
            {hasVehicle ? (
              <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Veículo Designado</span>
                  <span className="detail-value detail-value-mono">
                    {driver.vehicleId}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo de Carga</span>
                  <span className="detail-value">Transporte Rodoviário</span>
                </div>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Total de Pedidos em Trânsito</span>
                  <span className="detail-value" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {orderIds.length} remessa(s) despachada(s)
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p>Nenhum veículo vinculado atualmente.</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  O motorista está com status <strong>Disponível</strong> para novas rotas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="var(--color-primary)" />
            <CardTitle>Pedidos Vinculados ao Motorista</CardTitle>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {orderIds.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Nenhum pedido associado a este motorista no momento.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificador do Pedido (UUID)</TableHead>
                  <TableHead>Status da Carga</TableHead>
                  <TableHead>Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderIds.map((orderId) => (
                  <TableRow key={orderId}>
                    <TableCell className="detail-value-mono">{orderId}</TableCell>
                    <TableCell>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {driver.status === 'onRoute' ? 'Em Transporte' : 'Aguardando Despacho'}
                      </span>
                    </TableCell>
                    <TableCell>Padrão Corporativo</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
