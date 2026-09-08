import { VehicleSchema } from "@/models/vehicle.ts";
import Type, { type Static } from "typebox";

export const VehicleCreationSchema = Type.Omit(
  VehicleSchema,
  Type.Union([
    Type.Literal('id'),
    // Type.Literal('status'), TODO: Máquina de estados do pedido.
  ])
)
export type VehicleCreationPayload = Static<typeof VehicleCreationSchema>

export const VehicleRetrievalSchema = VehicleSchema
export type VehicleRetrievalResponse = Static<typeof VehicleSchema>

export const VehicleEditingSchema = Type.Partial(VehicleCreationSchema)
export type VehicleEditingPayload = Static<typeof VehicleEditingSchema>
