import type { License } from "@/models/license.ts"
import type { Order, OrderPreview } from "@/models/order.ts"

export type GetOrdersReply = OrderPreview[]

export type GetOrderReply = Order

export type CreateOrderRequest = {
  description: string
  destination: string
  clientName: string
  clientRegistration: string
  weight: number
  volume: number
  licenses: License[]
}

export type RejectOrderRequest = {
  reason: string
}

export type ReportOrderAccidentRequest = {
  accident: string
}

export type ResolveOrderAccidentRequest = {
  description: string
}

export type CancelOrderRequest = {
  reason: string
}

export type LoadOrderRequest = {
  driverId: string
  vehicleId: string
}
