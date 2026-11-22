export interface LicenseCreationPayload {
  name: string
}

export interface LicenseItem {
  name: string
  slug: string
}

export type LicenseGetReply = LicenseItem[]