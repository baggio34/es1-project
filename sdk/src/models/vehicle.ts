import type { UserSignature } from '@/dtos/user.dto.ts'
import { type TransportState, type TransportStateEnum} from './transport_state.ts'
import type { License } from './license.ts'

export type Vehicle = {
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
}


