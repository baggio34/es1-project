import type { Route } from './route'

export type OrderStatus =
  | 'pendingApproval' | 'waitingPayment' | 'rejected'
  | 'inPreparation' | 'loaded' | 'waitingDispatch'
  | 'onRoute' | 'arrived' | 'accident' | 'resolvedAccident'
  | 'cancelled'

export interface OrderBase {
  id: number
  createdOn: string
  createdBy: string
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
  approvedBy?: string
  rejectedOn?: string
  rejectedBy?: string
  reason?: string
  paymentConfirmedOn?: string
  paymentConfirmedBy?: string
  loadedBy?: string
  loadedAt?: string
  routeId?: string
  arrivedOn?: string
  accidentOn?: string
  accidentDescription?: string
  resolvedOn?: string
  resolvedBy?: string
  resolutionDescription?: string
  previousStatus?: { status: OrderStatus }
  cancelledBy?: string
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