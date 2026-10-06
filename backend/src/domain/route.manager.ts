import { Err, Ok, type Result } from "@/lib/result.ts"
import type { Route, RouteStatus } from "@/models/route.ts"
import { userManager } from "./user.manager.ts"
import { vehicleManager } from "./vehicle.manager.ts"
import { isDriver, isOperator } from "@/lib/user.utils.ts"
import { orderManager } from "./order.manager.ts"
import assert from "assert"
import { canDeliver } from "@/lib/transport.utils.ts"
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts"

type LoadOrderError =
  | 'noSuchOrder'
  | 'noSuchDriver'
  | 'noSuchOperator'
  | 'noSuchVehicle'
  | 'orderNotInPreparation'
  | 'vehicleOrDriverOnRoute'
  | 'vehicleAndDriverInDifferentStatus'
  | 'driverVehicleMissmatch'
  | 'vehicleOrDriverMissingLicense'

class RouteManager {
  routes = new Map<string, Route>()
  
  RouteManager() {
    const result = loadObjectFromFile<Record<string, Route>>('./data/routes.json')
    if (result.isOk) {
      this.routes = new Map(Object.entries(result.ok))
    } else {
      console.error(`Error loading routes: '${result.err}'\nStarting with new data.`)
    }
  }

  saveRoutes(): Result<'saved', string> {
    const result = saveObjectToFile('./data/routes.json', Object.fromEntries(this.routes.entries()))
    if (result.isErr) {
      console.error(result.err)
      return result
    }
    return Ok('saved')
  }

  /**
   * Retorna uma rota dado seu `id`.
   */
  public get(id: string): Route | undefined {
    return this.routes.get(id)
  }

  /**
   * Retorna todas as rotas. Também permite filtrar pelo `status`.
   */
  public getAll(status?: string): Route[] {
    if (!status) return [...this.routes.values()]
    return this.routes.values()
      .filter(v => v.status == status)
      .toArray()
  }

  /**
   * Atribui um pedido a um motorista e um veículo.
   * @returns O Id da rota a qual o pedido é atribuido.
   */
  public loadOrder(operatorId: string, orderId: number, driverId: string, vehicleId: string): Result<string, LoadOrderError> {
    const operator = userManager.getActive(operatorId)
    if (!operator) return Err('noSuchOperator')

    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')

    const driver = userManager.getActive(driverId)
    if (!driver || !isDriver(driver)) return Err('noSuchDriver')

    const vehicle = vehicleManager.getActive(vehicleId)
    if (!vehicle) return Err('noSuchVehicle')
    
    let routeId: string = crypto.randomUUID() // Por padrão o id da rota será um novo valor.

    // Precisam estar em estados válidos.
    if (order.status != 'inPreparation') return Err('orderNotInPreparation')
    if (driver.status == 'onRoute' || vehicle.status == 'onRoute') return Err('vehicleOrDriverOnRoute')
    if (driver.status != vehicle.status) return Err('vehicleAndDriverInDifferentStatus')

    // Precisam ter as licenças necessárias.
    if (!canDeliver(order, driver, vehicle)) return Err('vehicleOrDriverMissingLicense')

    // Pode atribuir a um motorista e veículo livres ou já ocupados.
    if (driver.status == 'waitingOperatorOrder' && vehicle.status == 'waitingOperatorOrder') {
      const route = this.get(driver.routeId)!
      routeId = route.id
      if (route.vehicleId != vehicleId) return Err('driverVehicleMissmatch')
      route.orders.push(orderId)
    } else {
      // Caso ambos estejam livres deve criar uma nova rota.
      const route: Route = {
        id: routeId,
        createdOn: new Date().toISOString(),
        status: 'waitingOperatorOrder',
        driverId,
        vehicleId,
        orders: [orderId],
      }
      userManager.updateDriverStatus(driverId, { status: 'waitingOperatorOrder', routeId: route.id })
      vehicleManager.updateStatus(vehicleId, { status: 'waitingOperatorOrder', routeId: route.id })
    }

    orderManager.updateStatus(orderId, {
      ...order,
      status: 'loaded' as const,
      routeId,
      loadedAt: new Date().toISOString(),
      loadedBy: operatorId,
    })
    this.saveRoutes()
    return Ok(routeId)
  }

  /**
   * Desatribui um pedido de sua respectiva rota.
   */
  public unloadOrder(orderId: number): Result<'unloaded', 'orderNotInLoadedStatus' | 'noSuchOrder'> {
    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')

    if (order.status != 'loaded') return Err('orderNotInLoadedStatus')
    const route = this.get(order.routeId)!

    // Se for o único pedido da rota, deve deletar a rota e liberar o motorista e veículo.
    if (route.orders.length == 1) {
      userManager.updateDriverStatus(route.driverId, { status: 'free' })
      vehicleManager.updateStatus(route.vehicleId, { status: 'free' })
      this.routes.delete(route.id)
    }
    orderManager.updateStatus(orderId, {...order, status: 'inPreparation'})

    this.saveRoutes()
    return Ok('unloaded')
  }

  /**
   * Marca a rota como autorizada para dispachar.
   */
  public authorizeDispatch(operatorId: string, routeId: string): Result<'authorized', 'noSuchOperator' | 'noSuchRoute' | 'routeNotWaitingOperator'> {
    const route = this.get(routeId)
    if (!route) return Err('noSuchRoute')
    if (route.status != 'waitingOperatorOrder') return Err('routeNotWaitingOperator')

    const operator = userManager.getActive(operatorId)
    if (!operator || !isOperator(operator)) return Err('noSuchOperator')

    for (const orderId of route.orders) {
      const order = orderManager.get(orderId)!
      if (order.status != 'loaded') continue

      orderManager.updateStatus(orderId, { ...order, status: 'waitingDispatch', routeId })
    }

    vehicleManager.updateStatus(route.vehicleId, { status: 'readyToDispatch', routeId })
    userManager.updateDriverStatus(route.driverId, { status: 'readyToDispatch', routeId })
    this.routes.set(route.id, {
      ...route,
      status: 'readyToDispatch',
      dispatchApprovedBy: operatorId,
      dispatchApprovedOn: new Date().toISOString()
    })

    this.saveRoutes()
    return Ok('authorized')
  }

  /**
   * Desmarca a rota como autorizada para dispachar.
   */
  public unauthorizeDispatch(operatorId: string, routeId: string): Result<'unauthorized', 'noSuchOperator' | 'noSuchRoute' | 'routeNotYetAuthorized'> {
    const route = this.get(routeId)
    if (!route) return Err('noSuchRoute')
    if (route.status != 'readyToDispatch') return Err('routeNotYetAuthorized')

    const operator = userManager.getActive(operatorId)
    if (!operator || !isOperator(operator)) return Err('noSuchOperator')

    for (const orderId of route.orders) {
      const order = orderManager.get(orderId)!
      if (order.status != 'waitingDispatch') continue

      orderManager.updateStatus(orderId, { ...order, status: 'loaded' })
    }

    vehicleManager.updateStatus(route.vehicleId, { status: 'waitingOperatorOrder', routeId })
    userManager.updateDriverStatus(route.driverId, { status: 'waitingOperatorOrder', routeId })
    this.routes.set(route.id, {
      ...route,
      status: 'waitingOperatorOrder',
    })

    this.saveRoutes()
    return Ok('unauthorized')
  }

  /**
   * Confirma que o motorista começou o trajeto.
   */
  public confirmDispatch(driverId: string): Result<'confirmed', 'noSuchDriver' | 'driverNotAuthorized'> {
    const driver = userManager.getActive(driverId)
    if (!driver || !isDriver(driver)) return Err('noSuchDriver')

    if (driver.status != 'readyToDispatch') return Err('driverNotAuthorized')
    const route = this.get(driver.routeId)!

    for (const orderId of route.orders) {
      const order = orderManager.get(orderId)!
      if (order.status != 'waitingDispatch') continue

      orderManager.updateStatus(orderId, { ...order, status: 'onRoute' })
    }

    userManager.updateDriverStatus(route.driverId, { status: 'onRoute', routeId: route.id })
    vehicleManager.updateStatus(route.vehicleId, { status: 'onRoute', routeId: route.id })

    assert(route.status == 'readyToDispatch')
    this.routes.set(route.id, {
      ...route,
      status: 'onCourse',
      dispatchedOn: new Date().toISOString()
    })
    
    this.saveRoutes()
    return Ok('confirmed')
  }

  public updateStatus(id: string, data: RouteStatus): Result<'ok', 'noSuchRoute'> {
    const route = this.routes.get(id)
    if (!route) return Err('noSuchRoute')
    this.routes.set(id, {...route, ...data})
    this.saveRoutes()
    return Ok('ok')
  }
}

export const routeManager = new RouteManager()
