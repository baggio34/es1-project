import type { UserSignature } from "./user.ts"

export type LicenseDetailed = {
  id: string
  name: string
  createdBy: UserSignature
}

export type LicensePreview = {
  id: string
  name: string
}
