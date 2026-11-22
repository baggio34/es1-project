import type { LicenseDetailed } from "@/models/license.ts"

export type CreateLicenseRequest = {
  name: string
}

export type UpdateLicenseRequest = {
  name: string
}

export type GetLicensesReply = LicenseDetailed[]
