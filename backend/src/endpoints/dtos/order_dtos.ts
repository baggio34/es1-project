import { OrderSchema } from "@/models/order.ts";
import Type, { type Static } from "typebox";

export const OrderCreationSchema = Type.Omit(
  OrderSchema,
  Type.Union([
    Type.Literal('id'),
    // Type.Literal('status'), TODO: Máquina de estados do pedido
    Type.Literal('registeredOn'),
  ])
)
export type OrderCreationPayload = Static<typeof OrderCreationSchema>

export const OrderRetrievalSchema = OrderSchema
export type OrderRetrievalResponse = Static<typeof OrderRetrievalSchema>

export const OrderEditingSchema = Type.Partial(OrderCreationSchema)
export type OrderEditingPayload = Static<typeof OrderEditingSchema>
