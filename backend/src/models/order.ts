import Type, { type Static } from "typebox"

export const OrderStatusSchema = Type.Union([
  Type.Object({ status: Type.Literal('pendingApproval') }),
  Type.Object({ status: Type.Literal('waitingPayment') }),
  Type.Object({ status: Type.Literal('inPreparation') }),
  Type.Object({
    status: Type.Literal('waitingDispatch'),
    driverId: Type.String({ format: 'uuid' }),
    vehicleId: Type.String({ format: 'uuid' }),
  }),
  Type.Object({
    status: Type.Literal('onRoute'),
    driverId: Type.String({ format: 'uuid' }),
    vehicleId: Type.String({ format: 'uuid' }),
  }),
  Type.Object({
    status: Type.Literal('arrived'),
    driverId: Type.String({ format: 'uuid' }),
    vehicleId: Type.String({ format: 'uuid' }),
    arrivedOn: Type.String({ format: 'date-time' })
  }),
  Type.Object({
    status: Type.Literal('rejected'),
    reason: Type.String({ minLength: 1 }),
  }),
  Type.Object({
    status: Type.Literal('accident'),
    driverId: Type.String({ format: 'uuid' }),
    vehicleId: Type.String({ format: 'uuid' }),
    accidentMessage: Type.String({ minLength: 1 }),
    accidentTime: Type.String({ format: 'date-time' }),
  }),
  Type.Object({
    status: Type.Literal('resolvedAccident'),
    driverId: Type.String({ format: 'uuid' }),
    vehicleId: Type.String({ format: 'uuid' }),
    accidentMessage: Type.String({ minLength: 1 }),
    accidentTime: Type.String({ format: 'date-time' }),
    resolvedOn: Type.String({ format: 'date-time' }),
    resolutionMessage: Type.String({ minLength: 1 }),
  }),
])

export const OrderSchema = Type.Intersect([
  Type.Object({
    id: Type.String({ format: "uuid" }),
    registeredOn: Type.String({ format: "date-time" }),
    description: Type.String({ minLength: 1 }),
    clientName: Type.String({ minLength: 1 }),
    clientCpf: Type.String({ maxLength: 11, minLength: 11 }),
    destination: Type.String({ minLength: 1 }),
    value: Type.Number({ minimum: 0 }),
    weight: Type.Number({ minimum: 0 }),
    volume: Type.Number({ minimum: 0 }),
  }),
  OrderStatusSchema
])
export type Order = Static<typeof OrderSchema>
export type OrderStatus = Static<typeof OrderStatusSchema>
