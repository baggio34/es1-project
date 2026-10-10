import Type, { type Static } from "typebox";

export const RouteStatusSchema = Type.Union([
  Type.Object({
    status: Type.Literal('waitingOperatorOrder'),
  }),
  Type.Object({
    status: Type.Literal('readyToDispatch'),
    dispatchApprovedOn: Type.String({ format: 'date-time' }),
    dispatchApprovedBy: Type.String(),
  }),
  Type.Object({
    status: Type.Literal('onCourse'),
    dispatchApprovedOn: Type.String({ format: 'date-time' }),
    dispatchApprovedBy: Type.String(),
    dispatchedOn: Type.String({ format: 'date-time' }),
  }),
  Type.Object({
    status: Type.Literal('completed'),
    dispatchApprovedOn: Type.String({ format: 'date-time' }),
    dispatchApprovedBy: Type.String(),
    dispatchedOn: Type.String({ format: 'date-time' }),
    completedOn: Type.String({ format: 'date-time' }),
  }),
])
export type RouteStatus = Static<typeof RouteStatusSchema>

export const RouteSchema = Type.Intersect([
  RouteStatusSchema,
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    driverId: Type.String(),
    vehicleId: Type.String(),
    orders: Type.Array(Type.Integer({ minimum: 1 })),
    createdOn: Type.String({ format: 'date-time' })
  })
])
export type Route = Static<typeof RouteSchema>
