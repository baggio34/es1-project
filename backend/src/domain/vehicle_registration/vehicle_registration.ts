import type { VehicleCreationPayload, VehicleEditingPayload } from "@/endpoints/dtos/vehicle_dtos.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import type { Vehicle } from "@/models/vehicle.ts";
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts";

export const vehicles = loadVehicles()

function loadVehicles(): Map<string, Vehicle> {
  const result = loadObjectFromFile<Record<string, Vehicle>>('./data/vehicles.json')
  if (result.isErr) {
    console.error(`Error loading vehicles: '${result.err}'\nStarting with new data.`)
    return new Map()
  }
  return new Map(Object.entries(result.ok))
}

export function saveVehicles(): Result<'saved', string> {
  const result = saveObjectToFile('./data/vehicles.json', Object.fromEntries(vehicles.entries()))
  if (result.isErr) {
    console.error(result.err)
    return result
  }
  return Ok('saved')
}


export function createVehicle(payload: VehicleCreationPayload): Result<'created', string> {
  const id = crypto.randomUUID()
  vehicles.set(id, { id, ...payload })
  saveVehicles()
  return Ok('created')
}

export function deleteVehicle(id: string): Result<'deleted', string> {
  const vehicle = vehicles.get(id)
  if (!vehicle) return Err(`Vehicle of id '${id}' does not exist.`)
  // if (vehicle.status != 'free') return Err(`Can't delete vehicle '${vehicle.model}', it is on route.`)
  vehicles.delete(id)
  saveVehicles()
  return Ok('deleted')
}

export function getVehicle(id: string): Result<Vehicle, string> {
  const vehicle = vehicles.get(id)
  return !vehicle ? Err(`Vehicle of id '${id}' does not exist.`) : Ok(vehicle)
}

export function getVehicles(): Record<string, Vehicle> {
  return Object.fromEntries(vehicles.entries())
}

export function editVehicle(id: string, payload: VehicleEditingPayload): Result<'edited', string> {
  const vehicle = vehicles.get(id)
  if (!vehicle) return Err(`Vehicle of id '${id}' does not exist.`)
  vehicles.set(id, { ...vehicle, ...payload })
  saveVehicles()
  return Ok('edited')
}
