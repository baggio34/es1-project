import Type, { type Static } from "typebox"

// Será usado futuramente para a máquina de estados do pedido.
// const OrderStatusSchema = Type.Union([
//   Type.Object({ status: Type.Literal('pendingApproval') }),
//   Type.Object({ status: Type.Literal('waitingPayment') }),
//   Type.Object({ status: Type.Literal('inPreparation') }),
//   Type.Object({
//     status: Type.Literal('waitingDispatch'),
//     driverId: Type.String({ format: 'uuid' }),
//     vehicleId: Type.String({ format: 'uuid' }),
//   }),
//   Type.Object({
//     status: Type.Literal('onRoute'),
//     driverId: Type.String({ format: 'uuid' }),
//     vehicleId: Type.String({ format: 'uuid' }),
//   }),
//   Type.Object({
//     status: Type.Literal('arrived'),
//     driverId: Type.String({ format: 'uuid' }),
//     vehicleId: Type.String({ format: 'uuid' }),
//     arrivedOn: Type.String({ format: 'date-time' })
//   }),
//   Type.Object({
//     status: Type.Literal('rejected'),
//     reason: Type.String({ minLength: 1 }),
//   }),
//   Type.Object({
//     status: Type.Literal('accident'),
//     driverId: Type.String({ format: 'uuid' }),
//     vehicleId: Type.String({ format: 'uuid' }),
//     accidentMessage: Type.String({ minLength: 1 }),
//     accidentTime: Type.String({ format: 'date-time' }),
//   }),
//   Type.Object({
//     status: Type.Literal('resolvedAccident'),
//     driverId: Type.String({ format: 'uuid' }),
//     vehicleId: Type.String({ format: 'uuid' }),
//     accidentMessage: Type.String({ minLength: 1 }),
//     accidentTime: Type.String({ format: 'date-time' }),
//     resolvedOn: Type.String({ format: 'date-time' }),
//     resolutionMessage: Type.String({ minLength: 1 }),
//   }),
// ])

const OrderLegacyStatusSchema = Type.Union([
  Type.Object({ status: Type.Literal('pendingApproval') }),
  Type.Object({ status: Type.Literal('waitingPayment') }),
  Type.Object({ status: Type.Literal('inPreparation') }),
  Type.Object({ status: Type.Literal('waitingDispatch'), }),
  Type.Object({ status: Type.Literal('onRoute'), }),
  Type.Object({ status: Type.Literal('arrived'), }),
  Type.Object({ status: Type.Literal('rejected'), }),
  Type.Object({ status: Type.Literal('accident'), }),
  Type.Object({ status: Type.Literal('resolvedAccident'), }),
])

export const OrderSchema = Type.Intersect([
  Type.Object({
    id: Type.String({ format: "uuid" }),
    registeredOn: Type.String({ format: "date-time" }),
    description: Type.String({ minLength: 1 }),
    clientName: Type.String({ minLength: 1 }),
    /// CPF ou CNPJ
    clientRegistration: Type.String({ minLength: 11, maxLength: 14 }),
    destination: Type.String({ minLength: 1 }),
    value: Type.Number({ minimum: 0 }),
    weight: Type.Number({ minimum: 0 }),
    volume: Type.Number({ minimum: 0 }),
  }),
  OrderLegacyStatusSchema
])
export type Order = Static<typeof OrderSchema>
