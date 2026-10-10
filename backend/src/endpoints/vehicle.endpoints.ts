import type { FastifyInstance } from "fastify";
import Type from "typebox";
import { authenticate } from "@/services/authentication/auth.ts";
import type { UUID } from "node:crypto";
import { requireTokenSchema, payloadRequireTokenSchema } from "@/lib/endpoint.utils.ts";
import { isOperator } from "@/lib/user.utils.ts";
import { VehiclePatchSchema, VehicleRegistrationSchema, type VehicleGetReply, type VehiclePatchPayload, type VehicleRegistrationPayload } from "./dtos/vehicle.dto.ts";
import { vehicleManager } from "@/domain/vehicle.manager.ts";
import { VehicleSchema, type Vehicle } from "@/models/vehicle.ts";
import { userManager } from "@/domain/user.manager.ts";

export default function vehicleRouter(app: FastifyInstance) {
  app.post<{ Body: VehicleRegistrationPayload, Headers: { token: UUID } }>(
    "/vehicles", {
    schema: payloadRequireTokenSchema(VehicleRegistrationSchema, Type.String())
  }, (req, res) => {
    const data = req.body
    const user = authenticate(req.headers.token)

    if (user.isErr) {
      res.status(401).send("invalid session")
      return
    }

    const result = vehicleManager.register(user.ok.username, data)
    if (result.isErr) {
      if (result.err == 'notAuthorized') res.status(401).send("not authorized")
      else res.status(400).send("plate already registered")
      return
    }

    res.status(200).send("registered")
  })

  app.patch<{ Body: VehiclePatchPayload, Headers: { token: UUID }, Params: { plate: string } }>(
    "/vehicles/:plate", {
    schema: payloadRequireTokenSchema(VehiclePatchSchema, Type.String())
  }, (req, res) => {
    const data = req.body
    const token = req.headers.token
    const plate = req.params.plate

    const requester = authenticate(token)
    if (requester.isErr) {
      res.status(401).send("not authorized")
      return
    } 

    const result = vehicleManager.patch(requester.ok.username, plate, data)
    if (result.isErr) {
      if (result.err == 'notAuthorized') res.status(401).send("not authorized")
      else res.status(400).send("no such vehicle")
      return
    }

    res.status(200).send("patched")
  })

  app.get<{ Headers: { token: UUID }, Reply: string | VehicleGetReply, Params: { plate: string } }>(
    "/vehicles/:plate", {
    schema: requireTokenSchema(VehicleSchema)
  }, (req, res) => {
    const token = req.headers.token
    const plate = req.params.plate

    const requester = authenticate(token)
    if (requester.isErr) {
      res.status(401).send("not authorized")
      return
    } 

    const vehicle = vehicleManager.get(plate)
    if (!vehicle) {
      res.status(400).send("no such vehicle")
      return
    }

    res.status(200).send({
      vehicle,
      registeredBy: userManager.get(vehicle.registeredBy)!,
    })
  })

  app.get<{ Headers: { token: UUID }, Reply: string | Vehicle[] }>(
    "/vehicles", {
    schema: requireTokenSchema(Type.Array(VehicleSchema))
  }, (req, res) => {
    const token = req.headers.token

    const requester = authenticate(token)
    if (requester.isErr || !isOperator(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const vehicles = vehicleManager.getAll().filter(v => v.condition == 'active')
    res.status(200).send(vehicles)
  })
}
