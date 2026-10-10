import Type, { type Static } from "typebox";

export const LicenseCreationSchema = Type.Object({
  name: Type.String()
})
export type LicenseCreationPayload = Static<typeof LicenseCreationSchema>

export const LicenseGetSchema = Type.Array(Type.Object({
  name: Type.String(),
  slug: Type.String(),
}))
export type LicenseGetReply = Static<typeof LicenseGetSchema>
