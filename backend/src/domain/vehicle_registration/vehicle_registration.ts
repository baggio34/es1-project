import type { VehicleCreationPayload } from "@/endpoints/dtos/vehicle_dtos.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import type { Vehicle } from "@/models/vehicle.ts";

export const vehicles = new Map<string, Vehicle>

export function createVehicle(payload: VehicleCreationPayload): Result<'created', string> {
  const id = crypto.randomUUID()
  vehicles.set(id, { id, status: 'free', ...payload })
  return Ok('created')
}

export function deleteVehicle(id: string): Result<'deleted', string> {
  const vehicle = vehicles.get(id)
  if (!vehicle) return Err(`Vehicle of id '${id}' does not exist.`)
  if (vehicle.status != 'free') return Err(`Can't delete vehicle '${vehicle.model}', it is on route.`)
  vehicles.delete(id)
  return Ok('deleted')
}

export function getVehicle(id: string): Result<Vehicle, string> {
  const vehicle = vehicles.get(id)
  return !vehicle ? Err(`Vehicle of id '${id}' does not exist.`) : Ok(vehicle)
}

export function getVehicles(): Record<string, Vehicle> {
  return Object.fromEntries(vehicles.entries())
}