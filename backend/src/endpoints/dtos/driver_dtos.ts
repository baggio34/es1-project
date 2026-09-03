import { DriverSchema } from "@/models/driver.ts";
import Type, { type Static } from "typebox";

export const DriverCreationSchema = Type.Omit(
  DriverSchema,
  Type.Union([Type.Literal('id'), Type.Literal('status')])
)
export type DriverCreationPayload = Static<typeof DriverCreationSchema>


export const DriverRetrievalSchema = DriverSchema
export type DriverRetrievalResponse = Static<typeof DriverRetrievalSchema>