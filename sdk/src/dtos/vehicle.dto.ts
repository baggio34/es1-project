import type { VehicleDetailed, VehiclePreview } from "@/models/vehicle.ts"

export type CreateVehicleRequest = {
  plate: string
  model: string
  color: string
  internalVolume: number
  maxLoad: number
  licenseIds: string[]
}

export type UpdateVehicleRequest = {
  plate: string | undefined
  model: string | undefined
  color: string | undefined
  isActive: boolean | undefined
  internalVolume: number | undefined
  maxLoad: number | undefined
  licenseIds: string[] | undefined
}

export type GetVehicleReply = VehicleDetailed

export type GetVehiclesReply = VehiclePreview[]
