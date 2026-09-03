import { VehicleSchema } from "@/models/vehicle.ts";
import Type, { type Static } from "typebox";

export const VehicleCreationSchema = Type.Omit(
  VehicleSchema,
  Type.Union([Type.Literal('id'), Type.Literal('status')])
)
export type VehicleCreationPayload = Static<typeof VehicleCreationSchema>

export const VehicleRetrievalSchema = VehicleSchema
export type VehicleRetrievalResponse = Static<typeof VehicleSchema>