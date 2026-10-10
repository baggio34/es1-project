import type { FastifyInstance } from "fastify";
import { authenticate } from "@/services/authentication/auth.ts";
import type { UUID } from "node:crypto";
import { requireTokenSchema } from "@/lib/endpoint.utils.ts";
import { userManager } from "@/domain/user.manager.ts";
import { isDriver, isOperator } from "@/lib/user.utils.ts";
import { OrderGetSchema } from "./dtos/order.dto.ts";
import { routeManager } from "@/domain/route.manager.ts";
import { vehicleManager } from "@/domain/vehicle.manager.ts";
import { getRouteInfo } from "@/lib/route.utils.ts";
import { RoutesGetAllSchema, type RouteGetReply, type RoutesGetAllReply } from "./dtos/route.dto.ts";
import Type from "typebox";

export default function routeRouter(app: FastifyInstance) {
  app.get<{ Headers: { token: UUID }, Reply: string | RouteGetReply, Params: { id: UUID } }>(
    "/routes/:uuid", {
    schema: requireTokenSchema(OrderGetSchema)
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr) {
      res.status(401).send("not authorized")
      return
    } 

    const route = routeManager.get(id)
    if (!route) {
      res.status(400).send("no such route")
      return
    }

    const routeInfo = getRouteInfo(route)
    res.status(200).send(routeInfo)
  })

  app.get<{ Headers: { token: UUID }, Reply: string | RoutesGetAllReply }>(
    "/routes", {
    schema: requireTokenSchema(RoutesGetAllSchema)
  }, (req, res) => {
    const token = req.headers.token

    const requester = authenticate(token)
    if (requester.isErr || isDriver(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const routes = routeManager.getAll().map(route => ({
      route,
      vehicle: vehicleManager.get(route.vehicleId)!,
      driver: userManager.get(route.driverId)!,
    }))
    res.status(200).send(routes)
  })

  app.post<{ Headers: { token: UUID }, Reply: string, Params: { id: UUID } }>(
    "/routes/:uuid/authorize-dispatch", {
    schema: requireTokenSchema(Type.String())
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr || !isOperator(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = routeManager.authorizeDispatch(requester.ok.username, id)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }
    res.status(200).send("route authorized for dispatch")
  })

  app.post<{ Headers: { token: UUID }, Reply: string, Params: { id: UUID } }>(
    "/routes/:uuid/unauthorize-dispatch", {
    schema: requireTokenSchema(Type.String())
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr || !isOperator(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = routeManager.unauthorizeDispatch(requester.ok.username, id)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }
    res.status(200).send("route unauthorized for dispatch")
  })

  app.post<{ Headers: { token: UUID }, Reply: string, Params: { id: UUID } }>(
    "/routes/:uuid/confirm-dispatch", {
    schema: requireTokenSchema(Type.String())
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr || !isDriver(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const route = routeManager.get(id)
    if (!route || route.driverId != requester.ok.username) {
      res.status(400).send("bad request: no such route or not driver of that route")
      return
    }

    const result = routeManager.confirmDispatch(route.driverId)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }
    res.status(200).send("dispatch confirmed")
  })
}
