import type { DriverCreationPayload } from "@/endpoints/dtos/driver_dtos.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import type { Driver } from "@/models/driver.ts";

export const drivers = new Map<string, Driver>

export function createDriver(payload: DriverCreationPayload): Result<'created', string> {
  const id = crypto.randomUUID()
  drivers.set(id, { status: 'free', id, ...payload })
  return Ok('created')
}

export function deleteDriver(id: string): Result<'deleted', string> {
  const driver = drivers.get(id)
  if (!driver) return Err(`Driver of id '${id}' does not exist.`)
  if (driver.status != 'free') return Err(`Can't delete driver '${driver.name}', he is on route.`)
  drivers.delete(id)
  return Ok('deleted')
}

export function getDriver(id: string): Result<Driver, string> {
  const driver = drivers.get(id)
  return !driver ? Err(`Driver of id '${id}' does not exist.`) : Ok(driver)
}

export function getDrivers(): Record<string, Driver> {
  return Object.fromEntries(drivers.entries())
}
