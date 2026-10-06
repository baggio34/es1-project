import type { FastifyInstance } from "fastify";
import Type from "typebox";
import { type UserGetReply } from "./dtos/user.dto.ts";
import { authenticate } from "@/services/authentication/auth.ts";
import type { UUID } from "node:crypto";
import { requireTokenSchema } from "@/lib/endpoint.utils.ts";
import { userManager } from "@/domain/user.manager.ts";
import { isDriver, isOperator } from "@/lib/user.utils.ts";
import { UserSchema } from "@/models/user.ts";
import { routeManager } from "@/domain/route.manager.ts";
import { vehicleManager } from "@/domain/vehicle.manager.ts";
import { RoutesGetAllSchema, type DriverRoutesGetReply } from "./dtos/route.dto.ts";
import { getRouteInfo } from "@/lib/route.utils.ts";

export default function driverRouter(app: FastifyInstance) {
  app.get<{ Headers: { token: UUID }, Reply: string | DriverRoutesGetReply, Params: { username: string } }>(
    "/drivers/:username/routes", {
    schema: requireTokenSchema(RoutesGetAllSchema)
  }, (req, res) => {
    const token = req.headers.token

    const driver = authenticate(token)
    if (driver.isErr || !isDriver(driver.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const others = routeManager.getAll()
      .filter(route => route.driverId == driver.ok.username && route.status == 'completed')
      .map(route => ({
        route,
        vehicle: vehicleManager.get(route.vehicleId)!,
        driver: userManager.get(route.driverId)!,
      }))
    res.status(200).send(
      'routeId' in driver.ok
      ? ({
          active: getRouteInfo(routeManager.get(driver.ok.routeId)!),
          others,
        })
      : ({ others })
    )
  })

  app.get<{ Headers: { token: UUID }, Reply: string | UserGetReply[] }>(
    "/drivers", {
    schema: requireTokenSchema(Type.Array(UserSchema))
  }, (req, res) => {
    const token = req.headers.token

    const requester = authenticate(token)
    if (requester.isErr || !isOperator(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const users = userManager.getAll().filter(u => u.condition == 'active' && u.role == 'driver')
    res.status(200).send(users)
  })
}
