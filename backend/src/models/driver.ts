import Type, { type Static } from 'typebox'

// Será usado futuramente para a máquina de estados do pedido
// const DriverStatusSchema = Type.Union([
//   Type.Object({ status: Type.Literal("free") }),
//   Type.Object({
//     status: Type.Literal("waitingDispatch"),
//     vehicleId: Type.String({ format: 'uuid' }),
//     orderIds: Type.Array(Type.String()),
//   }),
//   Type.Object({
//     status: Type.Literal("onRoute"),
//     vehicleId: Type.String({ format: 'uuid' }),
//     orderIds: Type.Array(Type.String()),
//   }),
// ])
// 
const LegacyDriverStatusSchema = Type.Union([
  Type.Object({ status: Type.Literal("free") }),
  Type.Object({ status: Type.Literal("waitingDispatch"), }),
  Type.Object({ status: Type.Literal("onRoute"), }),
])

export const DriverSchema = Type.Intersect([
  LegacyDriverStatusSchema,
  Type.Object({
    id: Type.String({ format: "uuid" }),
    name: Type.String({ minLength: 1 }),
    cpf: Type.String({ maxLength: 11, minLength: 11 }),
  })
])
export type Driver = Static<typeof DriverSchema>
