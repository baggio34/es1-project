import type { Route, RoutePreview } from "@/models/route.ts"
import type { UserSignature } from "@/models/user.ts"
import type { VehicleSignature } from "@/models/vehicle.ts"

export type GetRoutesReply = RoutePreview[]

export type GetRouteReply = Route[]

export type GetDriverRoutesReply = RoutePreview[]

export type GetRouteSuggestionsReply = {
  vehicles: Record<string, VehicleSignature>
  suggestions: Record<string, UserSignature>
}
