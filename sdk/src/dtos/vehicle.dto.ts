import type { Vehicle } from "@/models/vehicle.ts"
import type { UserSignature } from "./user.dto.ts"

export type CreateVehicleRequest = {
  plate: string
  model: string
  color: string
  internalVolume: number
  maxLoad: number
}

export type UpdateVehicleRequest = {
  plate: string | null
  model: string | null
  color: string | null
  internalVolume: number | null
  maxLoad: number | null
}

export type GetVehicleReply = Vehicle & {
  createdBy: UserSignature
} 
