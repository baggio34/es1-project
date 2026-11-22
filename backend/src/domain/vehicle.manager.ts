import type { CreateVehicleRequest, UpdateVehicleRequest } from "@/dtos/vehicle.dto.ts"
import type { PrismaClient, User, Vehicle } from "@/generated/prisma/client.ts";
import { serializeDates } from "@/lib/date.utils.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import { isManager } from "@/lib/user.utils.ts";
import type { VehicleDetailed, VehiclePreview } from "@/models/vehicle.ts";
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
  public async get(plate: string): Promise<VehicleDetailed | null> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { plate },
      omit: { createdById: true, routeId: true },
      include: {
        licenses: {
          select: { license: { select: { id: true, name: true } } }
        },
        createdBy: {
          select: { username: true, name: true, id: true, }
        },
        route: {
          select: {
            id: true,
            vehicle: { select: { id: true, color: true, model: true, plate: true } },
            driver: { select: { id: true, name: true, username: true } },
            status: true,
          }
        }
      }
    })

    if (!vehicle) return null
    return {
      ...serializeDates(vehicle),
      licenses: vehicle.licenses.map(l => l.license),
    } as VehicleDetailed
  }

  public async getActive(plate: string): Promise<Vehicle | null> {
    return await this.prisma.vehicle.findFirst({
      where: { plate, isActive: true }
    })
  }

  /**
   * Retorna todos os veículos.
   */
  public async getAll(): Promise<VehiclePreview[]> {
    return await this.prisma.vehicle.findMany({
      select: {
        id: true,
        model: true,
        plate: true,
        transportState: true,
        color: true,
        internalVolume: true,
        maxLoad: true,
        isActive: true,
      }
    })
  }

  /**
   * Adiciona um novo veículo.
   * @param requesterId nome de usuário do gerente ou admin.
   */
  public async create(creator: User, { licenseIds, ...data }: CreateVehicleRequest): Promise<Result<'', 'plateTaken'>> {
    assert(creator.isActive && isManager(creator))

    try {
      await this.prisma.vehicle.create({
        data: {
          ...data,
          licenses: {
            createMany: {
              data: licenseIds.map(l => ({ licenseId: l }))
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
  public async update(requester: User, plate: string, { licenseIds, ...data }: UpdateVehicleRequest): Promise<Result<'', 'noSuchVehicle' | 'badRequest' | 'plateTaken'>> {
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
          licenses: licenseIds
            ? {
                createMany: {
                  skipDuplicates: true,
                  data: licenseIds.map(l => ({ licenseId: l }))
                }
              }
            : undefined
        }
      })

      // Remover licensas antigas
      if (licenseIds) {
        await this.prisma.vehicleToLicense.deleteMany({
          where: { vehicleId: vehicle.id, licenseId: { notIn: licenseIds } }
        })
      }
    } catch (e) {
      return Err('badRequest')
    }

    return Ok('')
  }
}
