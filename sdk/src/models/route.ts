import type { OrderPreview } from "./order.ts"
import type { UserSignature } from "./user.ts"
import type { VehicleSignature } from "./vehicle.ts"

export type RouteStatusEnum =
  | "WAITING_OPERATOR_AUTHORIZATION"
  | "WAITING_DRIVER_DISPATCH"
  | "ON_COURSE"
  | "COMPLETED"

type WaitingOperatorAuthorization = { }

type WaitingDriverDispatch = {
  dispatchApprovedOn: string
  dispatchApprovedBy: UserSignature
}

type OnCourse = {
  routeStartedOn: string
} & WaitingDriverDispatch

type Completed = {
  routeCompletedOn: string
} & OnCourse

export type RouteStatus =
  | { status: "WAITING_OPERATOR_AUTHORIZATION" } & WaitingOperatorAuthorization
  | { status: "WAITING_DRIVER_DISPATCH" } & WaitingDriverDispatch
  | { status: "ON_COURSE" } & OnCourse
  | { status: "COMPLETED" } & Completed

export type Route = {
  id: string
  driver: UserSignature
  vehicle: VehicleSignature
  createdBy: UserSignature
  createdAt: string
  updatedAt: string
  orders: OrderPreview[]
} & RouteStatus

export type RoutePreview = {
  driver: UserSignature
  vehicle: VehicleSignature
  status: RouteStatusEnum
}

