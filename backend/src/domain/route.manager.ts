import { Err, Ok, type Result } from "@/lib/result.ts"
import { isDriver, isOperator } from "@/lib/user.utils.ts"
import assert from "assert"
import type { Order, PrismaClient, Route, User, Vehicle } from "@/generated/prisma/client.ts"
import { PrismaContext } from "@/services/database/prisma_context.ts"
import type { GetRouteSuggestionsReply } from "@/dtos/route.dto.ts"
import type { VehicleSignature } from "@/models/vehicle.ts"
import type { UserSignature } from "@/models/user.ts"
import type { RoutePreview, RouteWithOrders } from "@/models/route.ts"
import { serializeDates } from "@/lib/date.utils.ts"

type LoadOrderError =
  | 'orderNotInPreparation'
  | 'vehicleOrDriverOnRoute'
  | 'vehicleAndDriverInDifferentStatuses'
  | 'driverVehicleMissmatch'
  | 'vehicleOrDriverMissingLicense'

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

  public async get(id: string): Promise<RouteWithOrders | null> {
    const route = await this.prisma.route.findFirst({
      where: { id },
      include: {
        createdBy: { select: { username: true, name: true, id: true } },
        dispatchApprovedBy: { select: { username: true, name: true, id: true } },
        vehicle: { select: { id: true, color: true, model: true, plate: true } },
        driver: { select: { id: true, name: true, username: true } },
        orders: {
          select: {
            id: true,
            destination: true,
            clientName: true,
            clientRegistration: true,
            status: true,
            routeIndex: true,
          }
        }
      }
    })

    if (!route) return null
    return {
      ...serializeDates(route),
    } as RouteWithOrders
  }

  public async getInternal(id: string): Promise<Route | null> {
    return await this.prisma.route.findFirst({ where: { id } })
  }

  public async getAll(driverUsername?: string): Promise<RoutePreview[]> {
    return await this.prisma.route.findMany({
      where: driverUsername ? { driver: { username: driverUsername } } : undefined,
      select: {
        id: true,
        status: true,
        vehicle: { select: { id: true, color: true, model: true, plate: true } },
        driver: { select: { id: true, name: true, username: true } },
      }
    })
  }

  public async loadOrder(operator: User, order: Order, driver: User, vehicle: Vehicle): Promise<Result<string, LoadOrderError>> {
    assert(isOperator(operator) && isDriver(driver))
    assert(operator.isActive && driver.isActive && vehicle.isActive)

    if (order.status != 'IN_PREPARATION') return Err('orderNotInPreparation')
    if (driver.transportState == 'ON_ROUTE' || vehicle.transportState == 'ON_ROUTE') {
      return Err('vehicleOrDriverOnRoute')
    }
    if (driver.transportState != vehicle.transportState) return Err('vehicleAndDriverInDifferentStatuses')

    const missingLicenses = await this.prisma.orderToLicense.count({
      where: {
        OR: [
          {
            orderId: order.id,
            license: {
              drivers: { none: { driverId: driver.id } }
            }
          },
          {
            orderId: order.id,
            license: {
              vehicles: { none: { vehicleId: vehicle.id } }
            }
          },
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

    if (driver.transportState == 'WAITING_OPERATOR_AUTHORIZATION' && vehicle.transportState == 'WAITING_OPERATOR_AUTHORIZATION') {
      if (vehicle.routeId != driver.routeId || !driver.routeId) return Err('driverVehicleMissmatch')

      const existingRouteId = driver.routeId
      const routeId = await this.prisma.$transaction(async (tx) => {
        const orderIndexes = (await tx.order.findMany({
          where: { routeId: existingRouteId }
        })).map(o => o.routeIndex ?? -1)

        const routeIndex = orderIndexes.length > 0 ? Math.max(...orderIndexes) + 1 : 0

        await tx.order.update({
          where: { id: order.id },
          data: {
            routeId: existingRouteId,
            routeIndex,
            status: "LOADED",
            loadedById: operator.id,
            loadedOn: new Date(),
          }
        })

        return existingRouteId
      })

      return Ok(routeId)
    }

    const routeId = await this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          driverId: driver.id,
          vehicleId: vehicle.id,
          createdById: operator.id,
        }
      })

      await tx.user.update({
        where: { id: driver.id },
        data: {
          transportState: "WAITING_OPERATOR_AUTHORIZATION",
          routeId: route.id,
        }
      })

      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: {
          transportState: "WAITING_OPERATOR_AUTHORIZATION",
          routeId: route.id,
        }
      })

      await tx.order.update({
        where: { id: order.id },
        data: {
          routeId: route.id,
          routeIndex: 0,
          status: "LOADED",
          loadedById: operator.id,
          loadedOn: new Date(),
        }
      })

      return route.id
    })

    return Ok(routeId)
  }

  public async unloadOrder(order: Order): Promise<Result<"", "orderNotInLoadedStatus">> {
    if (order.status != 'LOADED' || !order.routeId) return Err('orderNotInLoadedStatus')
    const currentRouteId = order.routeId

    await this.prisma.$transaction(async (tx) => {
      const ordersInRoute = await tx.order.count({ where: { routeId: currentRouteId } })
      const route = await tx.route.findFirstOrThrow({ where: { id: currentRouteId } })

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "IN_PREPARATION",
          routeId: null,
          routeIndex: null,
        }
      })

      if (ordersInRoute == 1) {
        await tx.user.update({
          where: { id: route.driverId },
          data: {
            transportState: "FREE",
            routeId: null,
          }
        })
        await tx.vehicle.update({
          where: { id: route.vehicleId },
          data: {
            transportState: "FREE",
            routeId: null,
          }
        })
        await tx.route.delete({ where: { id: route.id } })
      }
    })

    return Ok('')
  }

  public async authorizeDispatch(operator: User, route: Route): Promise<Result<"", "routeNotWaitingOperator">> {
    assert(operator.isActive && isOperator(operator))
    if (route.status != 'WAITING_OPERATOR_AUTHORIZATION') return Err('routeNotWaitingOperator')

    await this.prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { routeId: route.id },
        data: { status: "WAITING_DISPATCH" }
      })

      await tx.user.update({
        where: { id: route.driverId },
        data: { transportState: "WAITING_DRIVER_DISPATCH" }
      })

      await tx.vehicle.update({
        where: { id: route.vehicleId },
        data: { transportState: "WAITING_DRIVER_DISPATCH" }
      })

      await tx.route.update({
        where: { id: route.id },
        data: {
          status: "WAITING_DRIVER_DISPATCH",
          dispatchApprovedById: operator.id,
          dispatchApprovedOn: new Date(),
        }
      })
    })

    return Ok('')
  }

  public async unauthorizeDispatch(route: Route): Promise<Result<'', 'routeNotAuthorizedForDispatch'>> {
    if (route.status != 'WAITING_DRIVER_DISPATCH') return Err('routeNotAuthorizedForDispatch')

    await this.prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { routeId: route.id },
        data: { status: "LOADED" }
      })

      await tx.user.update({
        where: { id: route.driverId },
        data: { transportState: "WAITING_OPERATOR_AUTHORIZATION" }
      })

      await tx.vehicle.update({
        where: { id: route.vehicleId },
        data: { transportState: "WAITING_OPERATOR_AUTHORIZATION" }
      })

      await tx.route.update({
        where: { id: route.id },
        data: {
          status: "WAITING_OPERATOR_AUTHORIZATION",
          dispatchApprovedById: null,
          dispatchApprovedOn: null,
        }
      })
    })

    return Ok('')
  }

  public async confirmDispatch(driver: User, route: Route): Promise<Result<"", "notAuthorized" | "driverNotAuthorized">> {
    if (driver.id != route.driverId) return Err('notAuthorized')
    if (route.status != 'WAITING_DRIVER_DISPATCH') return Err('driverNotAuthorized')

    await this.prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { routeId: route.id },
        data: { status: "ON_ROUTE" }
      })

      await tx.user.update({
        where: { id: route.driverId },
        data: { transportState: "ON_ROUTE" }
      })

      await tx.vehicle.update({
        where: { id: route.vehicleId },
        data: { transportState: "ON_ROUTE" }
      })

      await tx.route.update({
        where: { id: route.id },
        data: {
          status: "ON_COURSE",
          routeStartedOn: new Date(),
        }
      })
    })

    return Ok('')
  }

  private hasLicenses(driverLs: Licenses, vehicleLs: Licenses, orderLs: Licenses): boolean {
    const driverSet = new Set(driverLs.map(l => l.licenseId))
    const vehicleSet = new Set(vehicleLs.map(l => l.licenseId))

    for (const { licenseId } of orderLs) {
      if (!vehicleSet.has(licenseId) || !driverSet.has(licenseId)) {
        return false
      }
    }

    for (const { licenseId } of vehicleLs) {
      if (!driverSet.has(licenseId)) return false
    }

    return true
  }

  public async routeSuggestions(order: Order): Promise<Result<GetRouteSuggestionsReply, 'orderNotInPreparation'>> {
    if (order.status != "IN_PREPARATION") return Err('orderNotInPreparation')

    const orderLicenses = await this.prisma.orderToLicense.findMany({
      where: { orderId: order.id },
      select: { licenseId: true },
    })

    const freeDrivers = await this.prisma.user.findMany({
      where: { transportState: "FREE", isActive: true, role: "DRIVER" },
      include: { licenses: { select: { licenseId: true } } },
    })

    const freeVehicles = await this.prisma.vehicle.findMany({
      where: {
        transportState: "FREE",
        isActive: true,
        maxLoad: { gte: order.weight },
        internalVolume: { gte: order.volume },
      },
      include: { licenses: { select: { licenseId: true } } },
    })

    const existingRoutes = await this.prisma.route.findMany({
      where: {
        status: "WAITING_OPERATOR_AUTHORIZATION",
        vehicle: {
          isActive: true,
          maxLoad: { gte: order.weight },
          internalVolume: { gte: order.volume },
        },
        driver: {
          isActive: true,
        },
      },
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
        suggestions.set(r.vehicleId, {
          id: r.driver.id,
          name: r.driver.name,
          username: r.driver.username,
        })
        vehicles.set(r.vehicleId, {
          id: r.vehicle.id,
          model: r.vehicle.model,
          color: r.vehicle.color,
          plate: r.vehicle.plate,
        })
      }
    })

    freeDrivers.forEach(driver => {
      freeVehicles.forEach(vehicle => {
        if (this.hasLicenses(driver.licenses, vehicle.licenses, orderLicenses)) {
          suggestions.set(vehicle.id, {
            id: driver.id,
            name: driver.name,
            username: driver.username,
          })
          vehicles.set(vehicle.id, {
            id: vehicle.id,
            model: vehicle.model,
            color: vehicle.color,
            plate: vehicle.plate,
          })
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