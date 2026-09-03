import type { OrderCreationPayload } from "@/endpoints/dtos/order_dtos.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import type { Order } from "@/models/order.ts";

export const orders = new Map<string, Order>

export function createOrder(payload: OrderCreationPayload): Result<'created', string> {
  const id = crypto.randomUUID()
  orders.set(id, {
    id,
    registeredOn: new Date(Date.now()).toISOString(),
    status: 'pendingApproval',
    ...payload
  })
  return Ok('created')
}

export function deleteOrder(id: string): Result<'deleted', string> {
  const order = orders.get(id)
  if (!order) return Err(`Order of id '${id}' does not exist.`)
  if (order.status != 'pendingApproval') return Err(`Can't delete order past approval. Current status: ${order.status}`)
  orders.delete(id)
  return Ok('deleted')
}

export function getOrder(id: string): Result<Order, string> {
  const order = orders.get(id)
  return !order ? Err(`Order of id '${id}' does not exist.`) : Ok(order)
}

export function getOrders(): Record<string, Order> {
  return Object.fromEntries(orders.entries())
}