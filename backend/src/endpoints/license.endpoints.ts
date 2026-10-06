import type { FastifyInstance } from "fastify";
import Type from "typebox";
import { authenticate } from "@/services/authentication/auth.ts";
import type { UUID } from "node:crypto";
import { requireTokenSchema, payloadRequireTokenSchema } from "@/lib/endpoint.utils.ts";
import { isManager } from "@/lib/user.utils.ts";
import { LicenseCreationSchema, LicenseGetSchema, type LicenseCreationPayload } from "./dtos/license.dto.ts";
import { licenseManager } from "@/domain/license.manager.ts";

export default function licenseRouter(app: FastifyInstance) {
  app.post<{ Body: LicenseCreationPayload, Headers: { token: UUID } }>(
    "/licenses", {
    schema: payloadRequireTokenSchema(LicenseCreationSchema, Type.String())
  }, (req, res) => {
    const data = req.body
    const user = authenticate(req.headers.token)

    if (user.isErr || !isManager(user.ok)) {
      res.status(401).send("not authorized")
      return
    }

    const result = licenseManager.add(data.name)
    if (result.isErr) {
      res.status(400).send("this license already exists")
      return
    }
    res.status(200).send(result.ok)
  })

  app.get<{ Headers: { token: UUID } }>(
    "/licenses", {
    schema: requireTokenSchema(LicenseGetSchema)
  }, (req, res) => {
    const user = authenticate(req.headers.token)

    if (user.isErr) {
      res.status(401).send("invalid session")
      return
    }

    const licenses = licenseManager.getAll()
    res.status(200).send(licenses)
  })

  app.delete<{ Headers: { token: UUID }, Reply: string, Params: { slug: string } }>(
    "/licenses/:slug", {
    schema: requireTokenSchema(Type.String())
  }, (req, res) => {
    const token = req.headers.token
    const slug = req.params.slug

    const user = authenticate(token)
    if (user.isErr || !isManager(user.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = licenseManager.delete(slug)
    if (result.isErr) {
      res.status(400).send("no such license")
      return
    }

    res.status(200).send("deleted")
  })
}
