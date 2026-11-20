import type { Route, RoutePreview } from "@/models/route.ts"
import type { UserSignature } from "./user.dto.ts"
import type { VehiclePreview } from "@/models/vehicle.ts"

export type GetRoutesReply = RoutePreview[]

export type GetRouteReply = Route[]

export type GetDriverRoutesReply = RoutePreview[]

export type GetDriverSuggestionsReply = {
  drivers: UserSignature
  suggestions: Record<string, VehiclePreview>
}
