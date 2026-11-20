import type { UserDetailed } from "@/models/user.ts"

export type GetUserReply = UserDetailed

type CreateUserRole =
  | { role: 'MANAGER' }
  | { role: 'CLERK' }
  | { role: 'ADMIN' }
  | { role: 'OPERATOR' }
  | {
    role: 'DRIVER',
    licenseIds: string[]
  }

export type CreateUserRequest = {
  username: string
  name: string
  password: string
  cpf: string
} & CreateUserRole

export type UpdateUserRequest = {
  username: string | undefined
  name: string | undefined
  isActive: boolean | undefined
  password: string | undefined
  cpf: string | undefined
  licenseIds: string[] | undefined
}
