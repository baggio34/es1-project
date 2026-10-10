import { OrderSchema } from "@/models/order.ts"
import { RouteSchema } from "@/models/route.ts"
import Type, { type Static } from "typebox"

export const OrdersGetAllSchema = Type.Array(Type.Object({
  order: OrderSchema,
  driver: Type.Optional(Type.Object({ name: Type.String(), username: Type.String() })),
  vehicle: Type.Optional(Type.Object({ plate: Type.String(), model: Type.String() })),
}))
export type OrdersGetAllReply = Static<typeof OrdersGetAllSchema>

export const OrderGetSchema = Type.Object({
  order: OrderSchema,
  route: Type.Optional(RouteSchema),
  vehicle: Type.Optional(Type.Object({ plate: Type.String(), model: Type.String() })),
  users: Type.Record(Type.String(), Type.String()),
})
export type OrderGetReply = Static<typeof OrderGetSchema>

export const OrderCreationSchema = Type.Omit(OrderSchema, Type.Union([
  Type.Literal('id'),
  Type.Literal('createdBy'),
  Type.Literal('createdOn'),
  Type.Literal('status'),
]))
export type OrderCreationPayload = Static<typeof OrderCreationSchema>

export const OrderRejectionSchema = Type.Object({
  reason: Type.String()
})
export type OrderRejectionPayload = Static<typeof OrderRejectionSchema>

export const OrderCancellationSchema = Type.Object({
  reason: Type.String()
})
export type OrderCancellationPayload = Static<typeof OrderCancellationSchema>

export const OrderLoadingSchema = Type.Object({
  driverId: Type.String(),
  vehicleId: Type.String(),
})
export type OrderLoadingPayload = Static<typeof OrderLoadingSchema>
