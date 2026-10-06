import type { VehiclePatchPayload, VehicleRegistrationPayload } from "@/endpoints/dtos/vehicle.dto.ts";
import type { Vehicle } from "@/models/vehicle.ts";
import { userManager } from "@/domain/user.manager.ts";
import { isManager } from "@/lib/user.utils.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import type { TransportationStatus } from "@/models/driver.ts";
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts";

class VehicleManager {
  vehicles = new Map<string, Vehicle>

  VehicleManager() {
    const result = loadObjectFromFile<Record<number, Vehicle>>('./data/vehicles.json')
    if (result.isOk) {
      this.vehicles = new Map(Object.entries(result.ok))
    } else {
      console.error(`Error loading vehicles: '${result.err}'\nStarting with new data.`)
    }
  }

  saveVehicles(): Result<'saved', string> {
    const result = saveObjectToFile('./data/vehicles.json', Object.fromEntries(this.vehicles.entries()))
    if (result.isErr) {
      console.error(result.err)
      return result
    }
    return Ok('saved')
  }

  /**
   * Retorna um veículo dado sua placa.
   */
  public get(plate: string): Vehicle | undefined {
    return this.vehicles.get(plate)
  }

  /**
   * Retorna um veículo dado sua placa somente se ele estiver ativo.
   */
  public getActive(plate: string): Vehicle | undefined {
    const vehicle = this.vehicles.get(plate)
    if (vehicle?.condition == 'active') return vehicle
    return undefined
  }

  /**
   * Retorna todos os veículos. Também permite filtrar pelo `status`.
   */
  public getAll(status?: string): Vehicle[] {
    if (!status) return [...this.vehicles.values()]
    return this.vehicles.values()
      .filter(v => v.status == status)
      .toArray()
  }

  /**
   * Adiciona um novo veículo.
   * @param requesterId nome de usuário do gerente ou admin.
   */
  public register(requesterId: string, data: VehicleRegistrationPayload): Result<'created', 'plateAlreadyRegistered' | 'notAuthorized'> {
    const requester = userManager.get(requesterId)
    if (!requester || !isManager(requester)) return Err('notAuthorized')

    if (this.vehicles.has(data.plate)) return Err('plateAlreadyRegistered')
    
    this.vehicles.set(data.plate, {
      ...data,
      condition: 'active' as const,
      status: 'free' as const,
      registeredOn: new Date().toISOString(),
      registeredBy: requesterId,
    })

    this.saveVehicles()
    return Ok('created')
  }

  /**
   * Altera os dados de um veículo por pedido de `requesterId`.
   * @param requesterId nome de usuário do gerente ou admin.
   */
  public patch(requesterId: string, plate: string, data: VehiclePatchPayload): Result<'edited', 'noSuchVehicle' | 'notAuthorized'> {
    const requester = userManager.get(requesterId)
    if (!requester || !isManager(requester)) return Err('notAuthorized')

    const vehicle = this.get(plate)
    if (!vehicle) return Err('noSuchVehicle')

    this.vehicles.set(plate, { ...vehicle, ...data })
    this.saveVehicles()
    return Ok('edited')
  }

  /**
   * Permite atualizar o status de um motorista.
   * Não deve ser acessível para fora do programa.
   */
  public updateStatus(plate: string, data: TransportationStatus): Result<'ok', 'noSuchVehicle'> {
    const vehicle = this.vehicles.get(plate)
    if (!vehicle) return Err('noSuchVehicle')

    this.vehicles.set(plate, { ...vehicle, ...data })
    this.saveVehicles()
    return Ok('ok')
  }
}

export const vehicleManager = new VehicleManager()
