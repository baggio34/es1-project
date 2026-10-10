import Type, { type Static } from "typebox"

export const LoginSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 24 }),
  password: Type.String({ minLength: 8 }),
})
export type LoginPayload = Static<typeof LoginSchema>

export const LoginReplySchema = Type.Object({
  token: Type.String({ format: 'uuid' }),
  name: Type.String(),
  username: Type.String(),
  role: Type.Union([ Type.Literal('clerk'), Type.Literal('manager'), Type.Literal('admin'), Type.Literal('driver'), Type.Literal('operator') ]),
})
export type LoginReply = Static<typeof LoginReplySchema>
