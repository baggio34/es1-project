import { routeManager } from "@/domain/route.manager.ts";
import { userManager } from "@/domain/user.manager.ts";
import { vehicleManager } from "@/domain/vehicle.manager.ts";
import type { OrderGetReply } from "@/endpoints/dtos/order.dto.ts";
import type { Order } from "@/models/order.ts";

/**
 * Retorna todos as informações associadas a um pedido.
 */
export function getOrderInfo(order: Order): OrderGetReply {
  const users = new Set<string>()
  const route = 'routeId' in order ? routeManager.get(order.routeId)! : undefined
  const vehicle = route ? vehicleManager.get(route.vehicleId)! : undefined

  if ('approvedBy' in order) users.add(order.approvedBy)
  if ('rejectedBy' in order) users.add(order.rejectedBy)
  if ('paymentConfirmedBy' in order) users.add(order.paymentConfirmedBy)
  if ('loadedBy' in order) users.add(order.loadedBy)
  if ('resolvedBy' in order) users.add(order.resolvedBy)
  if ('cancelledBy' in order) users.add(order.cancelledBy)
  if (route && 'dispatchApprovedBy' in route) users.add(route.dispatchApprovedBy)
  users.add(order.createdBy)
  
  const info = {
    order,
    users: Object.fromEntries(users.values().map(u => [u, userManager.get(u)!.name]))
  }
  return route && vehicle ? { ...info, route, vehicle } : info
}
