import React from 'react'
import type { Vehicle } from '../../models/vehicle.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { ArrowLeft, Pencil, Truck, Box, Shield, Map } from 'lucide-react'
import { getVehicleStatusBadge } from '../../utils/formatters.tsx'
import { useAuth } from '../../contexts/AuthContext.tsx'

export interface VehicleDetailPageProps {
  vehicle: Vehicle
  routes?: any[]
  drivers?: any[]
  onBack: () => void
  onEdit: (id: string) => void
  onViewRoute?: (routeId: string) => void
}

export const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({
  vehicle,
  routes,
  drivers,
  onBack,
  onEdit,
  onViewRoute,
}) => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  // Cruzamento de dados blindado (Ignora se estiver livre ou se a rota já foi concluída)
  const activeRoute = vehicle.status !== 'free' ? routes?.find(r => r.id === (vehicle as any).routeId && r.status !== 'completed') : undefined
  const driver = drivers?.find(d => d.username === activeRoute?.driverId)
  
  const hasDriver = !!driver
  const driverName = driver?.name
  const orderIds = activeRoute?.orders || activeRoute?.orderIds || []
  const routeId = activeRoute?.id
  const requiredLicenses = (vehicle as any).licenses || []

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Voltar à Lista
          </Button>
          <div>
            <h1 className="page-title">{vehicle.model}</h1>
            <p className="page-description">
              Placa:{' '}
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                {vehicle.plate.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
        <div className="page-actions">
          {canEdit && (
            <Button variant="outline" icon={<Pencil size={16} />} onClick={() => onEdit(vehicle.plate)}>
              Editar Ficha Técnica
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--color-primary)" />
              <CardTitle>Especificações Técnicas</CardTitle>
            </div>
            {getVehicleStatusBadge(vehicle.status)}
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Modelo</span>
                <span className="detail-value">{vehicle.model}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Placa Mercosul</span>
                <span className="detail-value detail-value-mono">{vehicle.plate.toUpperCase()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Cor</span>
                <span className="detail-value">{vehicle.color}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Carga Máxima Suportada</span>
                <span className="detail-value" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {vehicle.maxLoad.toLocaleString('pt-BR')} kg
                </span>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Volume Interno Útil</span>
                <span className="detail-value" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {vehicle.internalVolume} m³
                </span>
              </div>
              {requiredLicenses.length > 0 && (
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Licenças Requeridas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {requiredLicenses.map((lic: string) => (
                      <Badge key={lic} variant="secondary">{lic}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--color-primary)" />
              <CardTitle>Operação e Alocação</CardTitle>
            </div>
            {routeId && (
              <Button variant="ghost" size="sm" icon={<Map size={14} />} onClick={() => onViewRoute?.(routeId)}>
                Ver Rota Atual
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {hasDriver ? (
              <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Motorista Alocado</span>
                  <span className="detail-value">
                    {driverName || 'Nome indisponível'}
                  </span>
                  <span className="detail-value detail-value-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    @{driver?.username}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status da Frota</span>
                  <span className="detail-value">{getVehicleStatusBadge(vehicle.status)}</span>
                </div>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Capacidade Ocupada</span>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-full)', marginTop: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ width: '65%', height: '100%', backgroundColor: 'var(--color-primary)' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', display: 'inline-block' }}>
                    Aproximadamente 65% da capacidade de peso alocada.
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p>Nenhum motorista alocado no momento.</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  Veículo disponível no pátio logístico para novos carregamentos.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Box size={18} color="var(--color-primary)" />
            <CardTitle>Cargas Transportadas por Este Veículo</CardTitle>
          </div>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {orderIds.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Nenhuma carga embarcada neste veículo atualmente.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código do Pedido</TableHead>
                  <TableHead>Status do Carregamento</TableHead>
                  <TableHead>Destino</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderIds.map((orderId: string | number) => (
                  <TableRow key={orderId}>
                    <TableCell className="detail-value-mono">#{orderId}</TableCell>
                    <TableCell>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {vehicle.status === 'onRoute' ? 'Em Deslocamento' : 'Carregado no Pátio'}
                      </span>
                    </TableCell>
                    <TableCell>Rota Logística Sudeste</TableCell>
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