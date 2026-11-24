import React, { useState, useEffect } from 'react'
import type { UserDetailed, UserPreview } from '../../../../sdk/src/models/user.ts'
import type { TransportStateEnum } from '../../../../sdk/src/models/transport_state.ts'
import { Button } from '../../components/ui/button.tsx'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.tsx'
import { ArrowLeft, Pencil, User as UserIcon, Map, Truck } from 'lucide-react'
import { getUserRoleBadge } from '../../utils/formatters.tsx'
import { userApi } from '../../api/userApi.ts'

export interface UserDetailPageProps {
  user: UserDetailed | UserPreview
  driverStatus?: string
  driverRouteId?: string
  onBack: () => void
  onEdit: (username: string) => void
  onViewRoute?: (routeId: string) => void
}

const TRANSPORT_STATE_LABELS: Record<TransportStateEnum, string> = {
  FREE: 'Disponível',
  WAITING_OPERATOR_AUTHORIZATION: 'Aguardando Autorização do Operador',
  WAITING_DRIVER_DISPATCH: 'Aguardando Despacho',
  ON_ROUTE: 'Em Rota',
}

export const UserDetailPage: React.FC<UserDetailPageProps> = ({
  user,
  driverStatus,
  driverRouteId,
  onBack,
  onEdit,
  onViewRoute,
}) => {
  const [detailedUser, setDetailedUser] = useState<UserDetailed | null>(
    'createdAt' in user ? user : null
  )

  useEffect(() => {
    if ('createdAt' in user) {
      setDetailedUser(user)
    } else {
      userApi
        .getByUsername(user.username)
        .then(setDetailedUser)
        .catch(console.error)
    }
  }, [user])

  const currentUser = detailedUser ?? user
  const driverDetails = detailedUser?.role === 'DRIVER' ? detailedUser : null

  const resolvedStatus = driverDetails
    ? TRANSPORT_STATE_LABELS[driverDetails.transportState]
    : driverStatus || 'Disponível'

  const resolvedRouteId =
    driverDetails && driverDetails.transportState !== 'FREE'
      ? driverDetails.route.id
      : driverRouteId

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Voltar à Lista
          </Button>
          <div>
            <h1 className="page-title">{currentUser.name}</h1>
            <p className="page-description">@{currentUser.username}</p>
          </div>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<Pencil size={16} />} onClick={() => onEdit(currentUser.username)}>
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
            {getUserRoleBadge(currentUser.role)}
          </CardHeader>
          <CardContent>
            <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Nome Completo</span>
                <span className="detail-value">{currentUser.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nome de Utilizador</span>
                <span className="detail-value detail-value-mono">@{currentUser.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nível de Acesso</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado da Conta</span>
                <span
                  className="detail-value"
                  style={{
                    color: currentUser.isActive ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                    fontWeight: 600,
                  }}
                >
                  {currentUser.isActive ? 'Ativo no Sistema' : 'Acesso Desativado'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentUser.role === 'DRIVER' && (
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} color="var(--color-primary)" />
                <CardTitle>Informações Operacionais</CardTitle>
              </div>
              {resolvedRouteId && (
                <Button variant="ghost" size="sm" icon={<Map size={16} />} onClick={() => onViewRoute?.(resolvedRouteId)}>
                  Ver Rota Atual
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="detail-item">
                  <span className="detail-label">Estado do Motorista</span>
                  <span className="detail-value">{resolvedStatus}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Rota Associada</span>
                  {resolvedRouteId ? (
                    <span className="detail-value detail-value-mono">{resolvedRouteId}</span>
                  ) : (
                    <span className="detail-value" style={{ color: 'var(--color-text-muted)' }}>Nenhuma rota em andamento</span>
                  )}
                </div>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Licenças Registadas</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {driverDetails?.licenses && driverDetails.licenses.length > 0 ? (
                      driverDetails.licenses.map((lic) => (
                        <span
                          key={lic.id}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--color-bg-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          {lic.name}
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