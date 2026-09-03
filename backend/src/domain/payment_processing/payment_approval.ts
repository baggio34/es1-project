import { getOrder, orders } from "@/domain/order_processing/order_registration.ts"
import { Err, Ok, type Result } from "@/lib/result.ts"

export function confirmPaymentOfOrder(id: string): Result<'ok', string> {
  return getOrder(id).then((order) => {
    if (order.status != 'waitingPayment') return Err("Can only approve payment of orders with a payment due.")
    orders.set(id, { ...order, status: 'inPreparation' })
    return Ok('ok')
  })
}
