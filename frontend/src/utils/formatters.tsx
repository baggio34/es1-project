import React from 'react'
import type { DriverStatus } from '../models/driver.ts'
import type { VehicleStatus } from '../models/vehicle.ts'
import type { OrderStatus } from '../models/order.ts'
import { Badge } from '../components/ui/badge.tsx'

export const formatReg = (reg: string): string => {
  if (reg.length == 11) {
    return `${reg.slice(0, 3)}.${reg.slice(3, 6)}.${reg.slice(6, 9)}-${reg.slice(9)}`
  }
  if (reg.length == 14) {
    return `${reg.slice(0, 2)}.${reg.slice(2, 5)}.${reg.slice(5, 8)}/${reg.slice(8, 12)}-${reg.slice(12)}`
  }
  return reg
}

export const formatCurrency = (val: number): string => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const getDriverStatusBadge = (status: DriverStatus): React.ReactElement => {
  switch (status) {
    case 'free':
      return <Badge variant="success">Disponível</Badge>
    case 'waitingDispatch':
      return <Badge variant="warning">Aguardando Despacho</Badge>
    case 'onRoute':
      return <Badge variant="primary">Em Rota</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export const getVehicleStatusBadge = (status: VehicleStatus): React.ReactElement => {
  switch (status) {
    case 'free':
      return <Badge variant="success">Disponível</Badge>
    case 'waitingDispatch':
      return <Badge variant="warning">Aguardando Despacho</Badge>
    case 'onRoute':
      return <Badge variant="primary">Em Rota</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export const getOrderStatusBadge = (status: OrderStatus): React.ReactElement => {
  switch (status) {
    case 'pendingApproval':
      return <Badge variant="warning">Pendente de Aprovação</Badge>
    case 'waitingPayment':
      return <Badge variant="secondary">Aguardando Pagamento</Badge>
    case 'inPreparation':
      return <Badge variant="secondary">Em Preparação</Badge>
    case 'waitingDispatch':
      return <Badge variant="primary">Aguardando Despacho</Badge>
    case 'onRoute':
      return <Badge variant="primary">Em Rota</Badge>
    case 'arrived':
      return <Badge variant="success">Entregue</Badge>
    case 'rejected':
      return <Badge variant="danger">Rejeitado</Badge>
    case 'accident':
      return <Badge variant="danger">Acidente Reportado</Badge>
    case 'resolvedAccident':
      return <Badge variant="success">Acidente Resolvido</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
