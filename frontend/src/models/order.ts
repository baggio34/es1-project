import type { Route } from './route'

export type OrderStatus =
  | 'pendingApproval' | 'waitingPayment' | 'rejected'
  | 'inPreparation' | 'loaded' | 'waitingDispatch'
  | 'onRoute' | 'arrived' | 'accident' | 'resolvedAccident'
  | 'cancelled'

export interface UserSignature {
  id: string
  username: string
  name: string
}

export interface OrderBase {
  id: number
  createdOn: string
  createdBy: string | UserSignature
  description: string
  clientName: string
  clientRegistration: string
  destination: string
  weight: number
  volume: number
  licenses: string[]
  value: number
  shipmentPrice: number
  status: OrderStatus
}

export interface Order extends OrderBase {
  approvedOn?: string
  approvedBy?: string | UserSignature
  rejectedOn?: string
  rejectedBy?: string | UserSignature
  reason?: string
  paymentConfirmedOn?: string
  paymentConfirmedBy?: string | UserSignature
  loadedBy?: string | UserSignature
  loadedAt?: string
  loadedOn?: string
  dispatchedOn?: string
  dispatchedBy?: string | UserSignature
  dispatchApprovedOn?: string
  dispatchApprovedBy?: string | UserSignature
  onRouteOn?: string
  onRouteBy?: string | UserSignature
  routeId?: string
  arrivedOn?: string
  arrivedBy?: string | UserSignature
  accidentOn?: string
  accidentDescription?: string
  resolvedOn?: string
  resolvedBy?: string | UserSignature
  resolutionDescription?: string
  previousStatus?: { status: OrderStatus }
  cancelledBy?: string | UserSignature
  cancelledOn?: string
  cancellationReason?: string
}

export type OrderCreationPayload = Omit<OrderBase, 'id' | 'createdBy' | 'createdOn' | 'status'>

export type OrderFormData = OrderCreationPayload & {
  status?: OrderStatus
  reason?: string
}

export interface OrderRejectionPayload { reason: string }
export interface OrderCancellationPayload { reason: string }
export interface OrderLoadingPayload { driverId: string; vehicleId: string }

export interface OrderGetReply {
  order: Order
  route?: Route
  vehicle?: { plate: string; model: string }
  users: Record<string, string>
}

export type OrdersGetAllReply = Array<{
  order: Order
  driver?: { name: string; username: string }
  vehicle?: { plate: string; model: string }
}>