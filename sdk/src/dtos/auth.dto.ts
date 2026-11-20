import type { RoleEnum } from "@/models/user.ts"

export type LoginRequest = {
  username: string
  password: string
}

export type LoginReply = {
  token: string
  name: string
  username: string
  role: RoleEnum
}
