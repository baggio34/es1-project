import type { RoutePreview } from "./route.ts"

export type TransportStateEnum =
  | 'FREE'
  | 'WAITING_OPERATOR_AUTHORIZATION'
  | 'WAITING_DRIVER_DISPATCH'
  | 'ON_ROUTE'

export type TransportState =
  | { transportState: 'FREE' }
  | { transportState: 'WAITING_OPERATOR_AUTHORIZATION', route: RoutePreview }
  | { transportState: 'WAITING_DRIVER_DISPATCH',        route: RoutePreview }
  | { transportState: 'ON_ROUTE',                       route: RoutePreview }
