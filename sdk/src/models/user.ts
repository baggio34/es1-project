import type { LicensePreview } from "./license.ts"
import type { TransportState } from "./transport_state.ts"

export type RoleEnum =
  | 'MANAGER'
  | 'DRIVER'
  | 'CLERK'
  | 'ADMIN'
  | 'OPERATOR'

export type Role =
  | { role: 'MANAGER' }
  | { role: 'CLERK' }
  | { role: 'ADMIN' }
  | { role: 'OPERATOR' }
  | ({
    role: 'DRIVER',
    licenses: LicensePreview[]
    } & TransportState)

export type UserDetailed = {
  id: string
  username: string
  name: string
  cpf: string
  isActive: boolean
  createdBy: UserSignature
  createdAt: string
  updatedAt: string
} & Role

export type UserPreview = {
  id: string
  username: string
  name: string
  cpf: string
  isActive: boolean
  role: RoleEnum
}

// Representa uma autoria de ação
export type UserSignature = {
  id: string,
  username: string,
  name: string,
} 

export type DriverPreview = {
  id: string
  username: string
  name: string
  cpf: string
  isActive: boolean
  role: 'DRIVER'
} & TransportState
