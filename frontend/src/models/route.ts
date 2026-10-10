export type RouteStatus = 'waitingDispatch' | 'onCourse' | 'completed' | 'waitingOperatorOrder'

export interface Route {
  id: string
  driverId: string
  vehicleId: string
  orderIds: string[]
  status: RouteStatus
}
