import type { CreateVehicleRequest, UpdateVehicleRequest } from "@/dtos/vehicle.dto.ts"
import type { PrismaClient, User, Vehicle } from "@/generated/prisma/client.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import { isManager } from "@/lib/user.utils.ts";
import { PrismaContext } from "@/services/database/prisma_context.ts";
import assert from "assert";

/**
 * Gerencia os veículos do sistema.
 */
export class VehicleManager {
  private static instance: VehicleManager | null
  private prisma: PrismaClient
  
  private constructor() {
    this.prisma = PrismaContext.getClient()
  }

  public static getInstance(): VehicleManager {
    if (!this.instance) {
      this.instance = new VehicleManager()
    }
    return this.instance
  }

  /**
   * Retorna um veículo dado sua placa.
   */
  public async get(plate: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findFirst({
      where: { plate }
    })
  }
  /**
   * Retorna um veículo dado sua placa somente se ele estiver ativo.
   */
  public async getActive(plate: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findFirst({
      where: { plate, isActive: true }
    })
  }

  /**
   * Retorna todos os veículos.
   */
  public async getAll(): Promise<Vehicle[]> {
    return await this.prisma.vehicle.findMany()
  }

  /**
   * Adiciona um novo veículo.
   * @param requesterId nome de usuário do gerente ou admin.
   */
  public async create(creator: User, data: CreateVehicleRequest): Promise<Result<'', 'plateTaken'>> {
    assert(creator.isActive && isManager(creator))

    try {
      await this.prisma.vehicle.create({
        data: {
          ...data,
          licenses: {
            createMany: {
              data: data.licenseIds.map(l => ({ licenseId: l }))
            }
          },
          createdBy: {
            connect: { id: creator.id }
          },
        }
      })
    } catch (e) {
      return Err('plateTaken')
    }
    return Ok('')
  }

  /**
   * Altera os dados de um veículo por pedido de `requesterId`.
   * @param requesterId nome de usuário do gerente ou admin.
   */
  public async update(requester: User, plate: string, data: UpdateVehicleRequest): Promise<Result<'', 'noSuchVehicle' | 'badRequest' | 'plateTaken'>> {
    assert(isManager(requester))
     
    // Checar se o veículo existe
    const vehicle = await this.prisma.vehicle.findFirst({ where: { plate } })
    if (!vehicle) return Err('noSuchVehicle')

    // Checar se o novo nome de usuário está live
    if (data.plate && await this.prisma.vehicle.findFirst({ where: { plate: data.plate }})) {
      return Err('plateTaken')
    }

    try {
      await this.prisma.vehicle.update({
        where: { plate },
        data: {
          ...data,
          licenses: data.licenseIds
            ? {
                createMany: {
                  skipDuplicates: true,
                  data: data.licenseIds.map(l => ({ licenseId: l }))
                }
              }
            : undefined
        }
      })

      // Remover licensas antigas
      if (data.licenseIds) {
        await this.prisma.vehicleToLicense.deleteMany({
          where: { vehicleId: vehicle.id, licenseId: { notIn: data.licenseIds } }
        })
      }
    } catch (e) {
      return Err('badRequest')
    }

    return Ok('')
  }
}
