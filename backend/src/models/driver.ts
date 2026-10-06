import Type, { type Static } from 'typebox'

export const TransportationStatusSchema = Type.Union([
  Type.Object({
    status: Type.Literal('free')
  }),
  Type.Object({
    status: Type.Union([
      Type.Literal('waitingOperatorOrder'),
      Type.Literal('readyToDispatch'),
      Type.Literal('onRoute'),
    ]),
    routeId: Type.String(),
  }),
])
export type TransportationStatus = Static<typeof TransportationStatusSchema>

export const DriverRoleSchema = Type.Intersect([
  Type.Object({
    role: Type.Literal('driver'),
    licenses: Type.Array(Type.String())
  }),
  TransportationStatusSchema,
])
