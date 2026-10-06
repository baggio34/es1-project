import type { Order } from "@/models/order.ts";
import type { User } from "@/models/user.ts";
import type { Vehicle } from "@/models/vehicle.ts";
import { isDriver } from "./user.utils.ts";
import assert from "assert";
import type { Route } from "@/models/route.ts";
import { orderManager } from "@/domain/order.manager.ts";

export function canDeliver(order: Order, driver: User, vehicle: Vehicle): boolean {
  if (!isDriver(driver)) return false

  // Tanto o veículo quanto o motorista precisam possuir todas as licensas
  // especificadas no pedido.
  return order.licenses.every(
    license => vehicle.licenses.includes(license) && driver.licenses.includes(license)
  )
}

export function deliveriesLeft(route: Route): number {
  assert(route.status == 'onCourse')
  return route.orders.reduce((acc, id, _i) => {
    if (orderManager.get(id)?.status == 'onRoute') {
      return acc + 1
    }
    return acc
  }, 0)
}
