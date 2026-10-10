export type UserRole = 'Clerk' | 'Admin' | 'Manager' | 'Driver'
export type UserCondition = 'active' | 'deactivated'

export interface UserBase {
  id: string
  name: string
  username: string
  role: UserRole
  condition: UserCondition
}

export interface UserDriver extends UserBase {
  role: 'Driver'
  licenses: string[]
}

export type User = UserBase | UserDriver

export interface UserFormData {
  name: string
  username: string
  password?: string
  role: UserRole
  licenses?: string[]
}
