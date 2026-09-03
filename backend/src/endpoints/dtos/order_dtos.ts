import { OrderSchema } from "@/models/order.ts";
import Type, { type Static } from "typebox";

export const OrderCreationSchema = Type.Omit(
  OrderSchema,
  Type.Union([
    Type.Literal('id'),
    Type.Literal('status'),
    Type.Literal('registeredOn'),
  ])
)
export type OrderCreationPayload = Static<typeof OrderCreationSchema>

export const OrderRetrievalSchema = OrderSchema
export type OrderRetrievalResponse = Static<typeof OrderRetrievalSchema>