export type OrderStatus =
  | 'pendingApproval'
  | 'waitingPayment'
  | 'inPreparation'
  | 'waitingDispatch'
  | 'onRoute'
  | 'arrived'
  | 'rejected'
  | 'accident'
  | 'resolvedAccident'

export interface OrderBase {
  id: string
  registeredOn: string
  registeredBy: string
  description: string
  clientName: string
  clientRegistration: string // CPF ou CNPJ
  destination: string
  weight: number // kg
  volume: number // m³
  requiredLicenses: string[]
}

export interface OrderPendingApproval extends OrderBase {
  status: 'pendingApproval'
}

export interface OrderWaitingPayment extends OrderBase {
  status: 'waitingPayment'
  approvedOn?: string
  approvedBy?: string
}

export interface OrderInPreparation extends OrderBase {
  status: 'inPreparation'
  approvedOn?: string
  approvedBy?: string
  paymentConfirmedOn?: string
  paymentConfirmedBy?: string
}

export interface OrderWaitingDispatch extends OrderBase {
  status: 'waitingDispatch'
  driverId: string
  vehicleId: string
  approvedOn?: string
  approvedBy?: string
  paymentConfirmedOn?: string
  paymentConfirmedBy?: string
  loadedOn?: string
  loadedBy?: string
}

export interface OrderOnRoute extends OrderBase {
  status: 'onRoute'
  driverId: string
  vehicleId: string
  approvedOn?: string
  approvedBy?: string
  paymentConfirmedOn?: string
  paymentConfirmedBy?: string
  loadedOn?: string
  loadedBy?: string
  routeId?: string
}

export interface OrderArrived extends OrderBase {
  status: 'arrived'
  driverId: string
  vehicleId: string
  approvedOn?: string
  approvedBy?: string
  paymentConfirmedOn?: string
  paymentConfirmedBy?: string
  loadedOn?: string
  loadedBy?: string
  routeId?: string
  arrivedOn: string
}

export interface OrderRejected extends OrderBase {
  status: 'rejected'
  reason: string
  rejectedOn?: string
  rejectedBy?: string
}

export interface OrderAccident extends OrderBase {
  status: 'accident'
  driverId: string
  vehicleId: string
  approvedOn?: string
  approvedBy?: string
  paymentConfirmedOn?: string
  paymentConfirmedBy?: string
  loadedOn?: string
  loadedBy?: string
  routeId?: string
  accidentMessage: string
  accidentTime: string
}

export interface OrderResolvedAccident extends OrderBase {
  status: 'resolvedAccident'
  driverId: string
  vehicleId: string
  approvedOn?: string
  approvedBy?: string
  paymentConfirmedOn?: string
  paymentConfirmedBy?: string
  loadedOn?: string
  loadedBy?: string
  routeId?: string
  accidentMessage: string
  accidentTime: string
  resolvedOn: string
  resolutionMessage: string
}

export type Order =
  | OrderPendingApproval
  | OrderWaitingPayment
  | OrderInPreparation
  | OrderWaitingDispatch
  | OrderOnRoute
  | OrderArrived
  | OrderRejected
  | OrderAccident
  | OrderResolvedAccident

export type OrderFormData = {
  description: string
  clientName: string
  clientRegistration: string
  destination: string
  weight: number
  volume: number
  requiredLicenses: string[]
  status: OrderStatus
}
