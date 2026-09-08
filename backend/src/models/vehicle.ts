import Type, { type Static } from 'typebox'

// Será usado futuramente na máquina de estados do pedido.
// const VehicleStatusSchema = Type.Union([
//   Type.Object({ status: Type.Literal("free") }),
//   Type.Object({
//     status: Type.Literal("waitingDispatch"),
//     driverId: Type.String({ format: 'uuid' }),
//     orderIds: Type.Array(Type.String()),
//   }),
//   Type.Object({
//     status: Type.Literal("onRoute"),
//     driverId: Type.String({ format: 'uuid' }),
//     orderIds: Type.Array(Type.String()),
//   }),
// ])

const LegacyVehicleStatusSchema = Type.Union([
  Type.Object({ status: Type.Literal("free") }),
  Type.Object({ status: Type.Literal("waitingDispatch"), }),
  Type.Object({ status: Type.Literal("onRoute"), }),
])

export const VehicleSchema = Type.Intersect([
  LegacyVehicleStatusSchema,
  Type.Object({
    id: Type.String({ format: "uuid" }),
    model: Type.String({ minLength: 1 }),
    plate: Type.String({ minLength: 7, maxLength: 7 }),
    color: Type.String({ minLength: 1 }),
    internalVolume: Type.Number({ minimum: 0 }),
    maxLoad: Type.Number({ minimum: 0 }),
  })
])
export type Vehicle = Static<typeof VehicleSchema>
