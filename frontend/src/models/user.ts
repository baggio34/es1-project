export type UserRole = 'clerk' | 'admin' | 'manager' | 'driver' | 'operator'
export type UserCondition = 'active' | 'deactivated'

export interface UserBase {
  id: string
  name: string
  username: string
  cpf: string // Adicionado pois é retornado e usado no registro
  role: UserRole
  condition: UserCondition
}

export interface UserDriver extends UserBase {
  role: 'driver'
  licenses: string[]
}

export type User = UserBase | UserDriver

// --- DTOs (Comunicação com a API) ---

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginReply {
  token: string
  name: string
  username: string
  role: UserRole
}

export interface UserRegistrationPayload {
  name: string
  username: string
  cpf: string
  password?: string
  role: UserRole
  licenses?: string[] // Exigido caso a role seja 'driver'
}

export interface UserPatchPayload {
  name?: string
  condition?: UserCondition
  password?: string
}

export interface UserGetReply {
  user: User
  registeredBy: {
    name: string
    username: string
  }
}