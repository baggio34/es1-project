import type { FastifyInstance } from "fastify";
import Type from "typebox";
import { UserPatchSchema, UserRegistrationSchema, type UserGetReply, type UserPatchPayload, type UserRegistrationPayload } from "./dtos/user.dto.ts";
import { authenticate } from "@/services/authentication/auth.ts";
import type { UUID } from "node:crypto";
import { requireTokenSchema, payloadRequireTokenSchema, postSchema } from "@/lib/endpoint.utils.ts";
import { userManager } from "@/domain/user.manager.ts";
import { LoginReplySchema, LoginSchema, type LoginPayload, type LoginReply } from "./dtos/auth.dto.ts";
import { isManager, obfuscateCpf } from "@/lib/user.utils.ts";
import { UserSchema, type User } from "@/models/user.ts";

export default function userRouter(app: FastifyInstance) {
  app.post<{ Body: UserRegistrationPayload, Headers: { token: UUID } }>(
    "/users/register", {
    schema: payloadRequireTokenSchema(UserRegistrationSchema, Type.String())
  }, (req, res) => {
    const data = req.body
    const user = authenticate(req.headers.token)

    if (user.isErr) {
      res.status(401).send("invalid session")
      return
    }

    const result = userManager.register(user.ok.username, data)
    if (result.isErr) {
      if (result.err == 'notAuthorized') res.status(401).send("not authorized")
      else res.status(400).send("username already taken")
      return
    }

    res.status(200).send("registered")
  })

  app.patch<{ Body: UserPatchPayload, Headers: { token: UUID }, Params: { username: string } }>(
    "/users/:username", {
    schema: payloadRequireTokenSchema(UserPatchSchema, Type.String())
  }, (req, res) => {
    const data = req.body
    const token = req.headers.token
    const username = req.params.username

    const requester = authenticate(token)
    if (requester.isErr) {
      res.status(401).send("not authorized")
      return
    } 

    const result = userManager.patch(requester.ok.username, username, data)
    if (result.isErr) {
      if (result.err == 'notAuthorized') res.status(401).send("not authorized")
      else res.status(400).send("no such user")
      return
    }

    res.status(200).send("patched")
  })

  app.get<{ Headers: { token: UUID }, Reply: string | UserGetReply, Params: { username: string } }>(
    "/users/:username", {
    schema: requireTokenSchema(UserSchema)
  }, (req, res) => {
    const token = req.headers.token
    const username = req.params.username

    const requester = authenticate(token)
    if (requester.isErr) {
      res.status(401).send("not authorized")
      return
    } 

    const user = userManager.get(username)
    if (!user) {
      res.status(400).send("no such user")
      return
    }

    res.status(200).send({
      registeredBy: userManager.get(user.registeredBy)!,
      user: {
        ...user,
        cpf: isManager(requester.ok) ? user.cpf : obfuscateCpf(user.cpf)
      },
    })
  })

  app.get<{ Headers: { token: UUID }, Reply: string | User[] }>(
    "/users", {
    schema: requireTokenSchema(Type.Array(UserSchema))
  }, (req, res) => {
    const token = req.headers.token

    const requester = authenticate(token)
    if (requester.isErr || !isManager(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const users = userManager.getAll()
    res.status(200).send(users)
  })

  app.post<{ Body: LoginPayload, Reply: LoginReply | string }>(
    "/users/login", {
    schema: postSchema(LoginSchema, LoginReplySchema)
  }, (req, res) => {
    const data = req.body
    const result = userManager.login(data)

    if (result.isErr) {
      res.status(400).send("invalid credentials")
      return
    }

    res.status(200).send(result.ok)
  })
}
