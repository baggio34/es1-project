import { DriverSchema } from "@/models/driver.ts";
import Type, { type Static } from "typebox";

export const DriverCreationSchema = Type.Omit(
  DriverSchema,
  Type.Union([
    Type.Literal('id'),
    // Type.Literal('status'), TODO: Máquina de estados do pedido.
  ])
)
export type DriverCreationPayload = Static<typeof DriverCreationSchema>

export const DriverRetrievalSchema = DriverSchema
export type DriverRetrievalResponse = Static<typeof DriverRetrievalSchema>

export const DriverEditingSchema = Type.Partial(DriverCreationSchema)
export type DriverEditingPayload = Static<typeof DriverEditingSchema>
