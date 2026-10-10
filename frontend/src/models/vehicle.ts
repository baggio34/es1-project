export type VehicleStatus = 'free' | 'waitingDispatch' | 'onRoute'

export interface VehicleBase {
  id: string
  model: string
  plate: string
  color: string
  internalVolume: number // m³
  maxLoad: number        // kg
  requiredLicenses: string[] // licenças requeridas para operar o veículo
}

export interface VehicleFree extends VehicleBase {
  status: 'free'
}

export interface VehicleBusy extends VehicleBase {
  status: 'waitingDispatch' | 'onRoute'
  driverId: string
  driverName?: string
  orderIds: string[]
}

export type Vehicle = VehicleFree | VehicleBusy

export type VehicleFormData = {
  model: string
  plate: string
  color: string
  internalVolume: number
  maxLoad: number
  requiredLicenses: string[]
  status: VehicleStatus
  driverId?: string
}
