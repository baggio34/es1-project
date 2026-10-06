import Type, { type Static } from "typebox";
import { DriverRoleSchema } from "./driver.ts";

export const RoleSchema = Type.Union([
  Type.Object({ role: Type.Literal('admin') }),
  Type.Object({ role: Type.Literal('manager') }),
  Type.Object({ role: Type.Literal('operator') }),
  Type.Object({ role: Type.Literal('clerk') }),
  DriverRoleSchema,
])

export const UserSchema = Type.Intersect([
  Type.Object({
    condition: Type.Union([
      Type.Literal('active'),
      Type.Literal('deactivated')
    ]),
    name: Type.String({ minLength: 3 }),
    cpf: Type.String({ minLength: 11, maxLength: 11 }),
    username: Type.String({ minLength: 3, maxLength: 24 }),
    registeredOn: Type.String({ format: 'date-time' }),
    registeredBy: Type.String(),
  }),
  RoleSchema
])

export type User = Static<typeof UserSchema> & { passwordHash: string }
