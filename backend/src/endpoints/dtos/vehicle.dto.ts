import { VehicleSchema } from "@/models/vehicle.ts";
import Type, { type Static } from "typebox";

export const VehicleRegistrationSchema = Type.Omit(
  VehicleSchema,
  Type.Union([
    Type.Literal('status'),
    Type.Literal('condition'),
    Type.Literal('registeredOn'),
    Type.Literal('registeredBy'),
  ])
)
export type VehicleRegistrationPayload = Static<typeof VehicleRegistrationSchema>

export const VehiclePatchSchema = Type.Omit(
  VehicleSchema,
  Type.Union([
    Type.Literal('status'),
    Type.Literal('plate'),
    Type.Literal('registeredOn'),
    Type.Literal('registeredBy'),
  ])
)
export type VehiclePatchPayload = Static<typeof VehiclePatchSchema>

const VehicleGetSchema = Type.Object({
  vehicle: VehicleSchema,
  registeredBy: Type.Object({ name: Type.String(), username: Type.String() })
})
export type VehicleGetReply = Static<typeof VehicleGetSchema>
