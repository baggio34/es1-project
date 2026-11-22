import type { OrderDetailed, OrderPreview } from "@/models/order.ts"

export type GetOrdersReply = OrderPreview[]

export type GetOrderReply = OrderDetailed

export type CreateOrderRequest = {
  description: string
  destination: string
  clientName: string
  clientRegistration: string
  weight: number
  volume: number
  licenseIds: string[]
}

export type UpdateOrderRequest = {
  description: string | undefined
  destination: string | undefined
  clientName: string | undefined
  clientRegistration: string | undefined
  weight: number | undefined
  volume: number | undefined
  licenseIds: string[] | undefined
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
  driverUsername: string
  vehiclePlate: string
}

export type SwapOrderIndex = {
  swappedId: number
}
