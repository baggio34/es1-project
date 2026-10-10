export type DriverStatus = 'free' | 'waitingDispatch' | 'onRoute'

export interface DriverBase {
  id: string
  name: string
  cpf: string
  username: string
  licenses: string[]
}

export interface DriverFree extends DriverBase {
  status: 'free'
}

export interface DriverBusy extends DriverBase {
  status: 'waitingDispatch' | 'onRoute'
  vehicleId: string
  orderIds: string[]
}

export type Driver = DriverFree | DriverBusy

export type DriverFormData = {
  name: string
  cpf: string
  username: string
  password?: string
  licenses: string[]
  status: DriverStatus
  vehicleId?: string
}
