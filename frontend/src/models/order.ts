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
  description: string
  clientName: string
  clientCpf: string
  destination: string
  value: number
  weight: number // kg
  volume: number // m³
}

export interface OrderPendingApproval extends OrderBase {
  status: 'pendingApproval'
}

export interface OrderWaitingPayment extends OrderBase {
  status: 'waitingPayment'
}

export interface OrderInPreparation extends OrderBase {
  status: 'inPreparation'
}

export interface OrderWaitingDispatch extends OrderBase {
  status: 'waitingDispatch'
  driverId: string
  vehicleId: string
}

export interface OrderOnRoute extends OrderBase {
  status: 'onRoute'
  driverId: string
  vehicleId: string
}

export interface OrderArrived extends OrderBase {
  status: 'arrived'
  driverId: string
  vehicleId: string
  arrivedOn: string
}

export interface OrderRejected extends OrderBase {
  status: 'rejected'
  reason: string
}

export interface OrderAccident extends OrderBase {
  status: 'accident'
  driverId: string
  vehicleId: string
  accidentMessage: string
  accidentTime: string
}

export interface OrderResolvedAccident extends OrderBase {
  status: 'resolvedAccident'
  driverId: string
  vehicleId: string
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
  clientCpf: string
  destination: string
  value: number
  weight: number
  volume: number
  status?: OrderStatus
}
