import { orderManager } from "@/domain/order.manager.ts";
import { userManager } from "@/domain/user.manager.ts";
import { vehicleManager } from "@/domain/vehicle.manager.ts";
import type { RouteGetReply } from "@/endpoints/dtos/route.dto.ts";
import type { Route } from "@/models/route.ts";

export function getRouteInfo(route: Route): RouteGetReply {
  const info = {
    route,
    vehicle: vehicleManager.get(route.vehicleId)!,
    driver: userManager.get(route.driverId)!,
    orders: route.orders.map(id => orderManager.get(id)!)
  }
  const dispatchApprovedBy = 'dispatchApprovedBy' in route ? userManager.get(route.dispatchApprovedBy)! : undefined
  return dispatchApprovedBy ? { ...info, dispatchApprovedBy } : info
}
