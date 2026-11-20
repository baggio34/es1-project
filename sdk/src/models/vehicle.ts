import { type TransportState, type TransportStateEnum} from './transport_state.ts'
import type { License } from './license.ts'
import type { UserSignature } from './user.ts'

export type VehicleDetailed = {
  id: string
  plate: string
  model: string
  color: string
  internalVolume: number
  maxLoad: number
  isActive: boolean
  createdBy: UserSignature
  createdAt: string
  updatedAt: string
  licenses: License[]
} & TransportState

export type VehiclePreview = {
  id: string
  model: string
  plate: string
  status: TransportStateEnum
  color: string
  internalVolume: number
  maxLoad: number
  isActive: boolean
}

export type VehicleSignature = {
  id: string
  model: string
  color: string
  plate: string
}


