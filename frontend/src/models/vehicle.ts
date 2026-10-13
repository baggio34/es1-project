export type VehicleStatus = 'free' | 'waitingDispatch' | 'onRoute'

export interface VehicleBase {
  id: string
  model: string
  plate: string
  color: string
  internalVolume: number
  maxLoad: number
  licenses: string[] // Corrigido de requiredLicenses para licenses (exigência do backend)
  registeredOn: string 
  registeredBy: string 
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

// --- DTOs (Comunicação com a API) ---

export type VehicleRegistrationPayload = Omit<
  VehicleBase, 
  'id' | 'registeredOn' | 'registeredBy'
>

// Alias adicionado para resolver o erro "has no exported member 'VehicleFormData'"
export type VehicleFormData = VehicleRegistrationPayload

export type VehiclePatchPayload = Partial<Omit<
  VehicleBase, 
  'id' | 'plate' | 'registeredOn' | 'registeredBy'
>>

export interface VehicleGetReply {
  vehicle: Vehicle
  registeredBy: {
    name: string
    username: string
  }
}