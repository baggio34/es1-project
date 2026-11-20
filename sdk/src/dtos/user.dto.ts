import type { User, Role } from "@/models/user.ts"

// Representa uma autoria de ação
export type UserSignature = {
  id: string,
  username: string,
  name: string,
} 

export type GetUserReply = User

export type CreateUserRequest = {
  username: string
  name: string
  password: string
  cpf: string
} & Role

export type UpdateUserRequest = {
  username: string | null
  name: string | null
  isActive: boolean | null
  password: string | null
  cpf: string | null
}
