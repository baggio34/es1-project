import type { OrderCreationPayload, OrderEditingPayload } from "@/endpoints/dtos/order_dtos.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import type { Order } from "@/models/order.ts";
import { saveVehicles } from "../vehicle_registration/vehicle_registration.ts";
import { saveDrivers } from "../employee_registration/driver_registration.ts";
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts";

export const orders = loadOrders()

function loadOrders(): Map<string, Order> {
  const result = loadObjectFromFile<Record<string, Order>>('./data/orders.json')
  if (result.isErr) {
    console.error(`Error loading orders: '${result.err}'\nStarting with new data.`)
    return new Map()
  }
  return new Map(Object.entries(result.ok))
}

export function saveOrders(): Result<'saved', string> {
  const result = saveObjectToFile('./data/orders.json', Object.fromEntries(orders.entries()))
  if (result.isErr) {
    console.error(result.err)
    return result
  }
  saveVehicles()
  saveDrivers()
  return Ok('saved')
}

export function createOrder(payload: OrderCreationPayload): Result<'created', string> {
  const id = crypto.randomUUID()
  if (payload.clientRegistration.length != 11 && payload.clientRegistration.length != 14) {
    return Err("Error: registration must be CPF (11 digits) or CNPJ (14 digits)")
  }
  orders.set(id, {
    id,
    registeredOn: new Date(Date.now()).toISOString(),
    ...payload,
    status: 'pendingApproval',
  })
  saveOrders()
  return Ok('created')
}

export function deleteOrder(id: string): Result<'deleted', string> {
  const order = orders.get(id)
  if (!order) return Err(`Order of id '${id}' does not exist.`)
  // if (order.status != 'pendingApproval') return Err(`Can't delete order past approval. Current status: ${order.status}`)
  orders.delete(id)
  saveOrders()
  return Ok('deleted')
}

export function getOrder(id: string): Result<Order, string> {
  const order = orders.get(id)
  return !order ? Err(`Order of id '${id}' does not exist.`) : Ok(order)
}

export function getOrders(): Record<string, Order> {
  return Object.fromEntries(orders.entries())
}

export function editOrder(id: string, payload: OrderEditingPayload): Result<'edited', string> {
  const order = orders.get(id)
  if (!order) return Err(`Order of id '${id}' does not exist.`)

  const regLength = payload.clientRegistration?.length
  if (regLength && regLength != 11 && regLength != 14) {
    return Err("Error: registration must be CPF (11 digits) or CNPJ (14 digits)")
  }

  orders.set(id, { ...order, ...payload })
  saveOrders()
  return Ok('edited')
}
