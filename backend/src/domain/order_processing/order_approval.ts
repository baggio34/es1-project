import { getOrder, orders, saveOrders } from "@/domain/order_processing/order_registration.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";

export function approveOrder(id: string): Result<'ok', string> {
  return getOrder(id).then((order) => {
    if (order.status != 'pendingApproval') return Err("Can only approve orders waiting for approval")
    orders.set(id, { ...order, status: 'waitingPayment' })
    saveOrders()
    return Ok('ok')
  })
}

export function rejectOrder(id: string, reason: string): Result<'ok', string> {
  return getOrder(id).then((order) => {
    if (order.status != 'pendingApproval') return Err("Can only decline orders waiting for approval")
    orders.set(id, { ...order, status: 'rejected', reason })
    saveOrders()
    return Ok('ok')
  })
}
