import { Err, Ok, type Result } from "@/lib/result.ts"
import type { Order, OrderCreationPayload, CancellableOrderStatus } from "@/models/order.ts"
import { userManager } from "./user.manager.ts"
import { isClerk, isDriver, isManager, isOperator } from "@/lib/user.utils.ts"
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts"
import { routeManager } from "./route.manager.ts"
import { deliveriesLeft } from "@/lib/transport.utils.ts"
import assert from "assert"

class OrderManager {
  orders = new Map<number, Order>
  idCounter = 1 

  OrderManager() {
    const result = loadObjectFromFile<Record<number, Order>>('./data/orders.json')
    if (result.isOk) {
      this.orders = new Map<number, Order>(
        Object.entries(result.ok).map(([key, value]) => [Number(key), value])
      )
      // Atualiza o contador para o próximo id.
      for (const order of this.orders) {
        if (order[1].id > this.idCounter) {
          this.idCounter = order[1].id + 1
        }
      }
    } else {
      console.error(`Error loading orders: '${result.err}'\nStarting with new data.`)
    }
  }

  saveOrders(): Result<'saved', string> {
    const result = saveObjectToFile('./data/orders.json', Object.fromEntries(this.orders.entries()))
    if (result.isErr) {
      console.error(result.err)
      return result
    }
    return Ok('saved')
  }

  public get(id: number): Order | undefined {
    return this.orders.get(id)
  }

  public getAll(status?: string): Order[] {
    if (!status) return [...this.orders.values()]
    return this.orders.values()
      .filter(o => o.status == status)
      .toArray()
  }

  public create(clerkId: string, data: OrderCreationPayload): Result<number, 'noSuchClerk'> {
    const clerk = userManager.getActive(clerkId)
    if (!clerk || !isClerk(clerk)) return Err('noSuchClerk')

    const order: Order = {
      id: this.idCounter,
      createdOn: new Date().toISOString(),
      createdBy: clerkId,
      status: 'pendingApproval',
      ...data,
    }
    this.idCounter += 1

    this.orders.set(order.id, order)
    this.saveOrders()
    return Ok(order.id)
  }

  public updateStatus(id: number, data: CancellableOrderStatus): Result<'ok', 'noSuchOrder'>{
    const order = this.orders.get(id)
    if (!order) return Err('noSuchOrder')

    this.orders.set(id, {...order, ...data})
    this.saveOrders()
    return Ok('ok')
  }

  public cancel(managerId: string, orderId: number, reason: string): Result<'cancelled', 'noSuchOrder' | 'noSuchManager' | 'cantBeCancelled'> {
    const manager = userManager.getActive(managerId)
    if (!manager || !isManager(manager)) return Err('noSuchManager')

    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')
    if (order.status == 'arrived' || order.status == 'cancelled') return Err('cantBeCancelled')

    this.orders.set(orderId, {
      ...order,
      status: 'cancelled',
      previousStatus: {
        ...order
      },
      cancellationReason: reason,
      cancelledBy: managerId,
      cancelledOn: new Date().toISOString()
    })

    this.saveOrders()
    return Ok('cancelled')
  }

  public reject(operatorId: string, orderId: number, reason: string): Result<'rejected', 'noSuchOrder' | 'noSuchOperator' | 'cantBeRejected'> {
    const operator = userManager.getActive(operatorId)
    if (!operator || !isOperator(operator)) return Err('noSuchOperator')

    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')
    if (order.status != 'pendingApproval') return Err('cantBeRejected')

    this.orders.set(orderId, {
      ...order,
      status: 'rejected',
      reason,
      rejectedBy: operatorId,
      rejectedOn: new Date().toISOString()
    })

    this.saveOrders()
    return Ok('rejected')
  }

  public approve(operatorId: string, orderId: number): Result<'approved', 'noSuchOrder' | 'noSuchOperator' | 'cantBeApproved'> {
    const operator = userManager.getActive(operatorId)
    if (!operator || !isOperator(operator)) return Err('noSuchOperator')

    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')
    if (order.status != 'pendingApproval') return Err('cantBeApproved')

    this.orders.set(orderId, {
      ...order,
      status: 'waitingPayment',
      approvedBy: operatorId,
      approvedOn: new Date().toISOString()
    })

    this.saveOrders()
    return Ok('approved')
  }

  public confirmPayment(clerkId: string, orderId: number): Result<'confirmed', 'noSuchOrder' | 'noSuchClerk' | 'cantBeConfirmed'> {
    const clerk = userManager.getActive(clerkId)
    if (!clerk || !isClerk(clerk)) return Err('noSuchClerk')

    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')
    if (order.status != 'pendingApproval') return Err('cantBeConfirmed')

    this.orders.set(orderId, {
      ...order,
      status: 'waitingPayment',
      approvedBy: clerkId,
      approvedOn: new Date().toISOString()
    })

    this.saveOrders()
    return Ok('confirmed')
  }

  public reportAccident(driverId: string, orderId: number, description: string): Result<'reported', 'notAuthorized' | 'noSuchOrder' | 'noSuchDriver' | 'orderNotOnRoute'> {
    const driver = userManager.getActive(driverId)
    if (!driver || !isDriver(driver)) return Err('noSuchDriver')

    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')
    if (driver.status != 'onRoute' || order.status != 'onRoute') return Err('orderNotOnRoute')
    if (driver.routeId != order.routeId) return Err('notAuthorized')

    const route = routeManager.get(order.routeId)!
    assert(route.status == 'onCourse')
    
    if (deliveriesLeft(route) == 1) {
      routeManager.updateStatus(route.id, {
        ...route,
        status: 'completed',
        completedOn: new Date().toISOString(),
      })
    }

    this.updateStatus(orderId, {
      ...order,
      status: 'accident',
      accidentOn: new Date().toISOString(),
      accidentDescription: description,
    })

    this.saveOrders()
    return Ok('reported')
  }

  public resolveAccident(managerId: string, orderId: number, description: string): Result<'resolved', 'noSuchOrder' | 'noSuchManager' | 'noAccidentOccurred'> {
    const manager = userManager.getActive(managerId)
    if (!manager || !isManager(manager)) return Err('noSuchManager')

    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')
    if (order.status != 'accident') return Err('noAccidentOccurred')

    this.orders.set(orderId, {
      ...order,
      status: 'resolvedAccident',
      resolvedOn: new Date().toISOString(),
      resolutionDescription: description,
      resolvedBy: managerId
    })

    this.saveOrders()
    return Ok('resolved')
  }

  public confirmArrival(driverId: string, orderId: number): Result<'confirmed', 'notAuthorized' | 'noSuchOrder' | 'noSuchDriver' | 'orderNotOnRoute'> {
    const driver = userManager.getActive(driverId)
    if (!driver || !isDriver(driver)) return Err('noSuchDriver')

    const order = orderManager.get(orderId)
    if (!order) return Err('noSuchOrder')
    if (driver.status != 'onRoute' || order.status != 'onRoute') return Err('orderNotOnRoute')
    if (driver.routeId != order.routeId) return Err('notAuthorized')

    const route = routeManager.get(order.routeId)!
    assert(route.status == 'onCourse')
    
    if (deliveriesLeft(route) == 1) {
      routeManager.updateStatus(route.id, {
        ...route,
        status: 'completed',
        completedOn: new Date().toISOString(),
      })
    }

    this.updateStatus(orderId, {
      ...order,
      status: 'arrived',
      arrivedOn: new Date().toISOString(),
    })

    this.saveOrders()
    return Ok('confirmed')
  }
}

export const orderManager = new OrderManager()
