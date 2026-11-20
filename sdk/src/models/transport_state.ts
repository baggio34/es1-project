import type { RoutePreview } from "./route.ts"

export type TransportStateEnum =
  | 'FREE'
  | 'WAITING_OPERATOR_AUTHORIZATION'
  | 'WAITING_DRIVER_DISPATCH'
  | 'ON_ROUTE'

export type TransportState =
  | { state: 'FREE' }
  | { state: 'WAITING_OPERATOR_AUTHORIZATION', route: RoutePreview }
  | { state: 'WAITING_DRIVER_DISPATCH',        route: RoutePreview }
  | { state: 'ON_ROUTE',                       route: RoutePreview }
