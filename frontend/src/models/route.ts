import type { Order } from './order'

export type RouteStatus = 'waitingDispatch' | 'onCourse' | 'completed' | 'waitingOperatorOrder'

export interface Route {
  id: string
  driverId: string
  vehicleId: string
  orderIds: string[]
  status: RouteStatus
}

// --- DTOs (Comunicação com a API) ---

export type RoutesGetAllReply = Array<{
  route: Route
  driver: { name: string; username: string }
  vehicle: { plate: string; model: string }
}>

export interface RouteGetReply {
  route: Route
  orders: Order[]
  vehicle: { plate: string; model: string }
  driver: { name: string; username: string }
  dispatchApprovedBy?: { name: string; username: string }
}

export interface DriverRoutesGetReply {
  active?: RouteGetReply
  others: RoutesGetAllReply
}