import React from 'react'

import type { TransportStateEnum } from '../../../sdk/src/models/transport_state.ts'
import type { OrderStatusEnum } from '../../../sdk/src/models/order.ts'
import type { RouteStatusEnum } from '../../../sdk/src/models/route.ts'
import type { RoleEnum } from '../../../sdk/src/models/user.ts'
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

export const maskCpfCnpj = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export const formatCurrency = (val: number): string => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function getDriverStatusBadge(status: TransportStateEnum) {
  switch (status) {
    case 'FREE':
      return <Badge variant="success">Disponível</Badge>
    case 'WAITING_OPERATOR_AUTHORIZATION':
      return <Badge variant="warning">Em Montagem de Rota</Badge>
    case 'WAITING_DRIVER_DISPATCH':
      return <Badge variant="warning">Aguardando Despacho</Badge>
    case 'ON_ROUTE':
      return <Badge variant="primary">Em Rota</Badge>
  }
}

export function getVehicleStatusBadge(status: TransportStateEnum) {
  switch (status) {
    case 'FREE':
      return <Badge variant="success">Disponível</Badge>
    case 'WAITING_OPERATOR_AUTHORIZATION':
      return <Badge variant="warning">Aguardando Autorização</Badge>
    case 'WAITING_DRIVER_DISPATCH':
      return <Badge variant="warning">Aguardando Despacho</Badge>
    case 'ON_ROUTE':
      return <Badge variant="primary">Em Rota</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export const getOrderStatusBadge = (status: OrderStatusEnum): React.ReactElement => {
  switch (status) {
    case 'WAITING_APPROVAL':
      return <Badge variant="warning">Pendente de Aprovação</Badge>
    case 'WAITING_PAYMENT':
      return <Badge variant="secondary">Aguardando Pagamento</Badge>
    case 'IN_PREPARATION':
      return <Badge variant="secondary">Em Preparação</Badge>
    case 'LOADED':
      return <Badge variant="primary">Carregado</Badge>
    case 'WAITING_DISPATCH':
      return <Badge variant="primary">Aguardando Despacho</Badge>
    case 'ON_ROUTE':
      return <Badge variant="primary">Em Rota</Badge>
    case 'ARRIVED':
      return <Badge variant="success">Entregue</Badge>
    case 'REJECTED':
      return <Badge variant="danger">Rejeitado</Badge>
    case 'ACCIDENT':
      return <Badge variant="danger">Acidente Reportado</Badge>
    case 'RESOLVED_ACCIDENT':
      return <Badge variant="success">Acidente Resolvido</Badge>
    case 'CANCELLED':
      return <Badge variant="danger">Cancelado</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function getRouteStatusBadge(status: RouteStatusEnum) {
  switch (status) {
    case 'WAITING_OPERATOR_AUTHORIZATION':
      return <Badge variant="warning">Em Montagem</Badge>
    case 'WAITING_DRIVER_DISPATCH':
      return <Badge variant="secondary">Aguardando Despacho</Badge>
    case 'ON_COURSE':
      return <Badge variant="primary">Em Curso</Badge>
    case 'COMPLETED':
      return <Badge variant="success">Concluída</Badge>
  }
}

export const getUserRoleBadge = (role: RoleEnum): React.ReactElement => {
  switch (role) {
    case 'ADMIN':
      return <Badge variant="danger">Administrador</Badge>
    case 'MANAGER':
      return <Badge variant="primary">Gerente</Badge>
    case 'OPERATOR':
      return <Badge variant="success">Operador</Badge>
    case 'CLERK':
      return <Badge variant="warning">Atendente</Badge>
    case 'DRIVER':
      return <Badge variant="secondary">Motorista</Badge>
    default:
      return <Badge variant="secondary">{role}</Badge>
  }
}
