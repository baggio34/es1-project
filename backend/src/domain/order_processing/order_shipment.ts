import { drivers, getDriver } from "@/domain/employee_registration/driver_registration.ts"
import { getOrder, orders, saveOrders } from "@/domain/order_processing/order_registration.ts"
import { getVehicle, vehicles } from "@/domain/vehicle_registration/vehicle_registration.ts"
import { type Result, Err, Ok } from "@/lib/result.ts"

export function loadOrder(id: string, driverId: string, vehicleId: string): Result<'ok', string> {
  return getOrder(id).then(
    order => getDriver(driverId).then(
      driver => getVehicle(vehicleId).then(
        vehicle => {
          if (order.status != 'inPreparation') return Err("Can only load orders in preparation")
          if (driver.status == 'onRoute' || vehicle.status == 'onRoute') return Err("To ship an order neither vehicle nor driver can be on route.")
          if (driver.status != vehicle.status) return Err("Can't ship order, driver and vehicle have diferent statuses")
          if (driver.status == 'waitingDispatch' && vehicle.status == 'waitingDispatch') {
            driver.orderIds.push(id)
            vehicle.orderIds.push(id)
            if (driver.vehicleId != vehicleId || vehicle.driverId != driverId) return Err(`Driver is already assigned to vehicle '${driver.vehicleId}'\nVehicle is already assigned to driver '${vehicle.driverId}'`)
          } else {
            drivers.set(driverId, { ...driver, status: 'waitingDispatch', vehicleId, orderIds: [id] })
            vehicles.set(vehicleId, { ...vehicle, status: 'waitingDispatch', driverId, orderIds: [id] })
          }
          orders.set(id, { ...order, status: 'waitingDispatch', vehicleId, driverId })
          saveOrders()
          return Ok('ok')
        })))
}

export function unloadOrder(id: string): Result<'ok', string> {
  return getOrder(id).then((order) => {
    if (order.status != 'waitingDispatch') return Err("Can only unload orders waiting for dispatch")
    const driver = drivers.get(order.driverId)!
    const vehicle = vehicles.get(order.vehicleId)!
    driver.status == 'waitingDispatch' && driver.orderIds.removeOne(id)
    vehicle.status == 'waitingDispatch' && vehicle.orderIds.removeOne(id)

    orders.set(id, { ...order, status: 'inPreparation' })
    saveOrders()
    return Ok('ok')
  })
}

export function shipOrder(id: string): Result<'ok', string> {
  return getOrder(id).then((order) => {
    if (order.status != 'waitingDispatch') return Err("Can only ship orders waiting for dispatch")
    drivers.get(order.driverId)!.status = 'onRoute'
    vehicles.get(order.vehicleId)!.status = 'onRoute'

    orders.set(id, { ...order, status: 'onRoute' })
    saveOrders()
    return Ok('ok')
  })
}

export function confirmArrival(id: string): Result<'ok', string> {
  return getOrder(id).then((order) => {
    if (order.status != 'onRoute') return Err("Can only confirm the arrival of orders that were on route")
    drivers.get(order.driverId)!.status = 'free'
    vehicles.get(order.vehicleId)!.status = 'free'

    orders.set(id, { ...order, status: 'arrived', arrivedOn: new Date(Date.now()).toISOString() })
    saveOrders()
    return Ok('ok')
  })
}
