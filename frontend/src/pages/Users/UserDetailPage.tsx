import React from 'react'
import type { User } from '../../models/user.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { ArrowLeft, Pencil, User as UserIcon, ShieldCheck, Map, Truck } from 'lucide-react'
import { getUserRoleBadge } from '../../utils/formatters.tsx'

export interface UserDetailPageProps {
  user: User
  driverStatus?: string
  driverRouteId?: string
  onBack: () => void
  onEdit: (id: string) => void
  onViewRoute?: (routeId: string) => void
}

export const UserDetailPage: React.FC<UserDetailPageProps> = ({
  user,
  driverStatus,
  driverRouteId,
  onBack,
  onEdit,
  onViewRoute,
}) => {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Voltar à Lista
          </Button>
          <div>
            <h1 className="page-title">{user.name}</h1>
            <p className="page-description">@{user.username}</p>
          </div>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<Pencil size={16} />} onClick={() => onEdit(user.id)}>
            Editar Cadastro
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserIcon size={18} color="var(--color-primary)" />
              <CardTitle>Dados do Perfil</CardTitle>
            </div>
            {getUserRoleBadge(user.role)}
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Nome Completo</span>
                <span className="detail-value">{user.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nome de Usuário</span>
                <span className="detail-value detail-value-mono">@{user.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nível de Acesso</span>
                <span className="detail-value">{user.role}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status da Conta</span>
                <span className="detail-value" style={{
                  color: user.condition === 'active' ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                  fontWeight: 600
                }}>
                  {user.condition === 'active' ? 'Ativo no Sistema' : 'Acesso Desativado'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.role === 'Driver' && (
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} color="var(--color-primary)" />
                <CardTitle>Informações Operacionais</CardTitle>
              </div>
              {driverRouteId && (
                <Button variant="ghost" size="sm" icon={<Map size={14} />} onClick={() => onViewRoute?.(driverRouteId)}>
                  Ver Rota Atual
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Status do Motorista</span>
                  <span className="detail-value">{driverStatus || 'Desconhecido'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Rota Associada</span>
                  {driverRouteId ? (
                    <span className="detail-value detail-value-mono">{driverRouteId}</span>
                  ) : (
                    <span className="detail-value" style={{ color: 'var(--color-text-muted)' }}>Nenhuma rota em andamento</span>
                  )}
                </div>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Licenças Cadastradas</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {user.licenses && user.licenses.length > 0 ? (
                      user.licenses.map(lic => (
                        <span key={lic} style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'var(--color-bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {lic}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Nenhuma licença vinculada</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
