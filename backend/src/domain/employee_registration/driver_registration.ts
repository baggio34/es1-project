import type { DriverCreationPayload, DriverEditingPayload } from "@/endpoints/dtos/driver_dtos.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import type { Driver } from "@/models/driver.ts";
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts";

export const drivers = loadDrivers()

function loadDrivers(): Map<string, Driver> {
  const result = loadObjectFromFile<Record<string, Driver>>('./data/drivers.json')
  if (result.isErr) {
    console.error(`Error loading drivers: '${result.err}'\nStarting with new data.`)
    return new Map()
  }
  return new Map(Object.entries(result.ok))
}

export function saveDrivers(): Result<'saved', string> {
  const result = saveObjectToFile('./data/drivers.json', Object.fromEntries(drivers.entries()))
  if (result.isErr) {
    console.error(result.err)
    return result
  }
  return Ok('saved')
}

export function createDriver(payload: DriverCreationPayload): Result<'created', string> {
  const id = crypto.randomUUID()
  drivers.set(id, { id, ...payload })
  saveDrivers()
  return Ok('created')
}

export function deleteDriver(id: string): Result<'deleted', string> {
  const driver = drivers.get(id)
  if (!driver) return Err(`Driver of id '${id}' does not exist.`)
  // if (driver.status != 'free') return Err(`Can't delete driver '${driver.name}', he is on route.`)
  drivers.delete(id)
  saveDrivers()
  return Ok('deleted')
}

export function getDriver(id: string): Result<Driver, string> {
  const driver = drivers.get(id)
  return !driver ? Err(`Driver of id '${id}' does not exist.`) : Ok(driver)
}

export function getDrivers(): Record<string, Driver> {
  return Object.fromEntries(drivers.entries())
}

export function editDriver(id: string, payload: DriverEditingPayload): Result<'edited', string> {
  const driver = drivers.get(id)
  if (!driver) return Err(`Driver of id '${id}' does not exist.`)
  drivers.set(id, { ...driver, ...payload })
  saveDrivers()
  return Ok('edited')
}
