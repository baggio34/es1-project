import { Err, Ok, type Result } from "@/lib/result.ts"
import { isDriver, isOperator } from "@/lib/user.utils.ts"
import assert from "assert"
import type { Order, PrismaClient, Route, User, Vehicle } from "@/generated/prisma/client.ts"
import { PrismaContext } from "@/services/database/prisma_context.ts"
import type { GetRouteSuggestionsReply } from "@/dtos/route.dto.ts"
import type { VehicleSignature } from "@/models/vehicle.ts"
import type { UserSignature } from "@/models/user.ts"

type LoadOrderError =
  | 'orderNotInPreparation'
  | 'vehicleOrDriverOnRoute'
  | 'vehicleAndDriverInDifferentStatuses'
  | 'driverVehicleMissmatch'
  | 'vehicleOrDriverMissingLicense'

/**
 * Gerencia as rotas do sistema.
 */
export class RouteManager {
  private static instance: RouteManager | null
  private prisma: PrismaClient
  
  private constructor() {
    this.prisma = PrismaContext.getClient()
  }

  public static getInstance(): RouteManager {
    if (!this.instance) {
      this.instance = new RouteManager()
    }
    return this.instance
  }

  /**
   * Retorna uma rota dado seu `id`.
   */
  public async get(id: string): Promise<Route | null> {
    return await this.prisma.route.findFirst({ where: { id } })
  }

  /**
   * Retorna todas as rotas.
   */
  public async getAll(): Promise<Route[]> {
    return await this.prisma.route.findMany()
  }

  /**
   * Atribui um pedido a um motorista e um veículo.
   * @returns O Id da rota a qual o pedido é atribuido.
   */
  public async loadOrder(operator: User, order: Order, driver: User, vehicle: Vehicle): Promise<Result<string, LoadOrderError>> {
    assert(isOperator(operator) && isDriver(driver))
    assert(operator.isActive && driver.isActive && vehicle.isActive)
    
    // Precisam estar em estados válidos.
    if (order.status != 'IN_PREPARATION') return Err('orderNotInPreparation')
    if (driver.transportState == 'ON_ROUTE' || vehicle.transportState == 'ON_ROUTE') {
      return Err('vehicleOrDriverOnRoute')
    }
    if (driver.transportState != vehicle.transportState) return Err('vehicleAndDriverInDifferentStatuses')

    // Precisam ter as licenças necessárias.
    const missingLicenses = await this.prisma.orderToLicense.count({
      where: {
        OR: [
          // Licença que o pedido requer, mas o motorista não tem
          {
            orderId: order.id,
            license: {
              drivers: { none: { driverId: driver.id} }
            }
          },

          // Licença que o pedido requer, mas o veículo não tem
          {
            orderId: order.id,
            license: {
              vehicles: { none: { vehicleId: vehicle.id} }
            }
          },

          // Licença que o veículo requer, mas o motorista não tem
          {
            orderId: order.id,
            license: {
              vehicles: {
                some: {
                  vehicleId: vehicle.id,
                  license: {
                    drivers: { none: { driverId: driver.id } }
                  }
                }
              }
            }
          }
        ]
      }
    })
    if (missingLicenses != 0) return Err('vehicleOrDriverMissingLicense')

    var routeIndex = 0
    var routeId: string

    // Pode atribuir a um motorista e veículo livres ou já ocupados.
    if (driver.transportState == 'WAITING_OPERATOR_AUTHORIZATION' && vehicle.transportState == 'WAITING_OPERATOR_AUTHORIZATION') {
      if (vehicle.routeId != driver.routeId) return Err('driverVehicleMissmatch')

      const orderIndexes = (await this.prisma.order.findMany({
        where: { routeId: driver.routeId }
      })).map(o => o.routeIndex!)

      routeIndex = Math.max(...orderIndexes) + 1
      routeId = driver.routeId!

    } else {
      // Caso ambos estejam livres deve criar uma nova rota.
      const route = await this.prisma.route.create({
        data: {
          driverId: driver.id,
          vehicleId: vehicle.id,
          createdById: operator.id,
          orders: {
            connect: { id: order.id }
          }
        }
      })
      routeId = route.id

      await this.prisma.user.update({
        where: { id: driver.id },
        data: {
          transportState: "WAITING_OPERATOR_AUTHORIZATION",
          routeId,
        }
      })
      await this.prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          transportState: "WAITING_OPERATOR_AUTHORIZATION",
          routeId,
        }
      })
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        routeId: driver.routeId!,
        routeIndex,
        status: "LOADED",
        loadedById: operator.id,
        loadedOn: new Date(),
      }
    })

    return Ok(routeId)
  }

  /**
   * Desatribui um pedido de sua respectiva rota.
   */
  public async unloadOrder(order: Order): Promise<Result<"", "orderNotInLoadedStatus">> {
    if (order.status != 'LOADED') return Err('orderNotInLoadedStatus')
    const ordersInRoute = await this.prisma.order.count({ where: { routeId: order.routeId! } })
    const route = (await this.get(order.routeId!))!

    // Se for o único pedido da rota, deve deletar a rota e liberar o motorista e veículo.
    if (ordersInRoute == 1) {
      await this.prisma.user.update({
        where: { id: route.driverId },
        data: {
          transportState: "FREE",
          routeId: null,
        }
      })
      await this.prisma.vehicle.update({
        where: { id: route.vehicleId },
        data: {
          transportState: "FREE",
          routeId: null,
        }
      })
      await this.prisma.route.delete({ where: { id: route.id }})

    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "IN_PREPARATION",
        routeId: null,
      }
    })

    return Ok('')
  }

  /**
   * Marca a rota como autorizada para dispachar.
   */
  public async authorizeDispatch(operator: User, route: Route): Promise<Result<"", "routeNotWaitingOperator">> {
    assert(operator.isActive && isOperator(operator))
    if (route.status != 'WAITING_OPERATOR_AUTHORIZATION') return Err('routeNotWaitingOperator')

    await this.prisma.order.updateMany({
      where: { routeId: route.id },
      data: { status: "WAITING_DISPATCH" }
    })

    await this.prisma.user.update({
      where: { id: route.driverId },
      data: { transportState: "WAITING_DRIVER_DISPATCH" }
    })

    await this.prisma.vehicle.update({
      where: { id: route.vehicleId },
      data: { transportState: "WAITING_DRIVER_DISPATCH" }
    })

    await this.prisma.route.update({
      where: { id: route.id },
      data: {
        status: "WAITING_DRIVER_DISPATCH",
        dispatchApprovedById: operator.id,
        dispatchApprovedOn: new Date(),
      }
    })

    return Ok('')
  }

  /**
   * Desmarca a rota como autorizada para dispachar.
   */
  public async unauthorizeDispatch(route: Route): Promise<Result<'', 'routeNotAuthorizedForDispatch'>> {
    if (route.status != 'WAITING_DRIVER_DISPATCH') return Err('routeNotAuthorizedForDispatch')

    await this.prisma.order.updateMany({
      where: { routeId: route.id },
      data: { status: "LOADED" }
    })

    await this.prisma.user.update({
      where: { id: route.driverId },
      data: { transportState: "WAITING_OPERATOR_AUTHORIZATION" }
    })

    await this.prisma.vehicle.update({
      where: { id: route.vehicleId },
      data: { transportState: "WAITING_OPERATOR_AUTHORIZATION" }
    })

    await this.prisma.route.update({
      where: { id: route.id },
      data: {
        status: "WAITING_OPERATOR_AUTHORIZATION",
        dispatchApprovedById: null,
        dispatchApprovedOn: null,
      }
    })

    return Ok('')
  }

  /**
   * Confirma que o motorista começou o trajeto.
   */
  public async confirmDispatch(route: Route): Promise<Result<"", "driverNotAuthorized">> {
    if (route.status != 'WAITING_DRIVER_DISPATCH') return Err('driverNotAuthorized')

    await this.prisma.order.updateMany({
      where: { routeId: route.id },
      data: { status: "ON_ROUTE" }
    })

    await this.prisma.user.update({
      where: { id: route.driverId },
      data: { transportState: "ON_ROUTE" }
    })

    await this.prisma.vehicle.update({
      where: { id: route.vehicleId },
      data: { transportState: "ON_ROUTE" }
    })

    await this.prisma.route.update({
      where: { id: route.id },
      data: {
        status: "ON_COURSE",
        routeStartedOn: new Date(),
      }
    })

    return Ok('')
  }

  private hasLicenses(driverLs: Licenses, vehicleLs: Licenses, orderLs: Licenses): boolean {
    for (const license of orderLs) {
      if (!vehicleLs.includes(license) || !driverLs.includes(license)) {
        return false
      }
    }

    for (const license of vehicleLs) {
      if (!driverLs.includes(license)) return false
    }

    return true
  }

  /*
   * Retorna as possíveis combinações de motorista e veículo.
   */
  public async routeSuggestions(order: Order): Promise<Result<GetRouteSuggestionsReply, 'orderNotInPreparation'>> {
    if (order.status != "IN_PREPARATION") return Err('orderNotInPreparation')

    const orderLicenses = await this.prisma.orderToLicense.findMany({
      where: { orderId: order.id },
      select: { licenseId: true },
    })

    const freeDrivers = await this.prisma.user.findMany({
      where: { transportState: "FREE" },
      include: { licenses: { select: { licenseId: true } } },
    })

    const freeVehicles = await this.prisma.vehicle.findMany({
      where: { transportState: "FREE" },
      include: { licenses: { select: { licenseId: true } } },
    })

    const existingRoutes = await this.prisma.route.findMany({
      where: { status: "WAITING_OPERATOR_AUTHORIZATION" },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            username: true,
            licenses: { select: { licenseId: true } }
          }
        },
        vehicle: {
          select: {
            id: true,
            model: true,
            color: true,
            plate: true,
            licenses: { select: { licenseId: true } }
          }
        },
      }
    })

    const suggestions = new Map<string, UserSignature>()
    const vehicles = new Map<string, VehicleSignature>()

    existingRoutes.forEach(r => {
      if (this.hasLicenses(r.driver.licenses, r.vehicle.licenses, orderLicenses)) {
        suggestions.set(r.vehicleId, r.driver)
        vehicles.set(r.vehicleId, r.vehicle)
      }
    })

    freeDrivers.forEach(driver => {
      freeVehicles.forEach(vehicle => {
        if (this.hasLicenses(driver.licenses, vehicle.licenses, orderLicenses)) {
          suggestions.set(vehicle.id, driver)
          vehicles.set(vehicle.id, vehicle)
        }
      })
    })

    return Ok({
      suggestions: Object.fromEntries(suggestions.entries()),
      vehicles: Object.fromEntries(vehicles.entries()),
    })
  }
}

type Licenses = { licenseId: string }[]
