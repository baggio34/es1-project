import type { UserSignature } from "@/dtos/user.dto.ts"
import type { RoutePreview } from "./route.ts"
import type { License } from "./license.ts"
import type { VehiclePreview } from "./vehicle.ts"

export type OrderStatusEnum =
  | 'WAITING_APPROVAL'
  | 'REJECTED'
  | 'WAITING_PAYMENT'
  | 'IN_PREPARATION'
  | 'LOADED'
  | 'WAITING_DISPATCH'
  | 'ON_ROUTE'
  | 'ACCIDENT'
  | 'RESOLVED_ACCIDENT'
  | 'ARRIVED'
  | 'CANCELLED'

export type OrderStatusPreview =
  | {
      status: 'WAITING_APPROVAL' | 'REJECTED' | 'WAITING_PAYMENT' | 'CANCELLED'
    }
  | {
      status: 'IN_PREPARATION' | 'LOADED' | 'WAITING_DISPATCH' | 'ON_ROUTE' | 'ACCIDENT' | 'RESOLVED_ACCIDENT' | 'ARRIVED'
      driver: UserSignature,
      vehicle: VehiclePreview,
      routeIndex: number,
    }

type WaitingApproval = {}

type Rejected = {
  rejectedBy: UserSignature
  rejectedOn: string
  rejectionReason: string
}

type WaitingPayment = {
  approvedBy: UserSignature 
  approvedOn: string 
}

type InPreparation = WaitingPayment & {
  paymentConfirmedBy: UserSignature
  paymentConfirmedOn: string
}

type Loaded = InPreparation & {
  loadedBy: UserSignature
  loadedOn: string
  route: RoutePreview
  routeIndex: number
}

type WaitingDispatch = Loaded & { }

type OnRoute = WaitingDispatch & { }

type Arrived = OnRoute & {
  arrivedOn: string
}

type Accident = {
  accidentOn: string
  accidentDescription: string
}

type ResolvedAccident = {
  accidentResolvedBy: UserSignature
  accidentResolvedOn: string
  accidentResolutionDescription: string
}

type Cancelled = {
  cancelledBy: UserSignature
  cancelledOn: string
  cancellationReason: string
  statusBeforeCancellation: CancellableOrderStatus
}

type CancellableOrderStatus =
  | { status: "WAITING_APPROVAL" } & WaitingApproval
  | { status: "WAITING_PAYMENT" } & WaitingPayment
  | { status: "IN_PREPARATION" } & InPreparation
  | { status: "WAITING_DISPATCH" } & WaitingDispatch
  | { status: "ON_ROUTE" } & OnRoute

type NonCancellableOrderStatus =
  | { status: "REJECTED" } & Rejected
  | { status: "LOADED" } & Loaded // Descarregar antes de cancelar
  | { status: "ACCIDENT" } & Accident // Resolver o acidente
  | { status: "RESOLVED_ACCIDENT" } & ResolvedAccident
  | { status: "ARRIVED" } & Arrived
  | { status: "CANCELLED" } & Cancelled

export type OrderStatus = CancellableOrderStatus | NonCancellableOrderStatus

export type Order = {
  id: string
  description: string
  destination: string
  clientName: string
  clientRegistration: string
  weight: number
  volume: number
  createdBy: UserSignature
  createdAt: string
  updatedAt: string
  licenses: License[]
} & OrderStatus

export type OrderPreview = {
  id: string
  destination: string
  clientName: string
  clientRegistration: string
  weight: number
  volume: number
} & OrderStatusPreview
