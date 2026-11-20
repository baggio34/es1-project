import type { UserSignature } from "./user.ts"

export type License = {
  id: string
  name: string
  registeredBy: UserSignature
}
