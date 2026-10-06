import { OrderSchema } from "@/models/order.ts";
import { RouteSchema } from "@/models/route.ts";
import Type, { type Static } from "typebox";

export const RoutesGetAllSchema = Type.Array(Type.Object({
  route: RouteSchema,
  driver: Type.Object({ name: Type.String(), username: Type.String() }),
  vehicle: Type.Object({ plate: Type.String(), model: Type.String() }),
}))
export type RoutesGetAllReply = Static<typeof RoutesGetAllSchema>

export const RouteGetSchema = Type.Object({
  route: RouteSchema,
  orders: Type.Array(OrderSchema),
  vehicle: Type.Object({ plate: Type.String(), model: Type.String() }),
  driver: Type.Object({ name: Type.String(), username: Type.String() }),
  // Retorna o nome do usuário que aprovou o dispache, se houver.
  dispatchApprovedBy: Type.Optional(Type.Object({ name: Type.String(), username: Type.String() })),
})
export type RouteGetReply = Static<typeof RouteGetSchema>

export const DriverRoutesGetSchema = Type.Object({
  active: Type.Optional(RouteGetSchema),
  others: RoutesGetAllSchema,
})
export type DriverRoutesGetReply = Static<typeof DriverRoutesGetSchema>
