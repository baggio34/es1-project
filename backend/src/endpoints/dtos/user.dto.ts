import { UserSchema } from "@/models/user.ts";
import Type, { type Static } from "typebox";

// Ao registrar o cargo de motorista, também é necessário informar as licenças.
const RoleRegistrationSchema = Type.Union([
  Type.Object({ role: Type.Literal('admin') }),
  Type.Object({ role: Type.Literal('manager') }),
  Type.Object({ role: Type.Literal('operator') }),
  Type.Object({ role: Type.Literal('clerk') }),
  Type.Object({
    role: Type.Literal('driver'),
    licenses: Type.Array(Type.String())
  }),
])
export type Role = Static<typeof RoleRegistrationSchema>

export const UserRegistrationSchema = Type.Intersect([
  Type.Object({
    password: Type.String({ minLength: 8 }),
    name: Type.String({ minLength: 3 }),
    cpf: Type.String({ minLength: 11, maxLength: 11 }),
    username: Type.String({ minLength: 3, maxLength: 24 }),
  }),
  RoleRegistrationSchema
])
export type UserRegistrationPayload = Static<typeof UserRegistrationSchema>

export const UserPatchSchema = Type.Partial(Type.Intersect([
  Type.Pick(UserSchema, Type.Union([
    Type.Literal('condition'),
    Type.Literal('name'),
  ])),
  Type.Object({
    password: Type.String({ minLength: 8 }),
  })
]))
export type UserPatchPayload = Static<typeof UserPatchSchema>

const UserGetSchema = Type.Object({
  user: UserSchema,
  registeredBy: Type.Object({ name: Type.String(), username: Type.String() })
})
export type UserGetReply = Static<typeof UserGetSchema>
