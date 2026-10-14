import type { FastifyInstance } from "fastify";
import Type from "typebox";
import { authenticate } from "@/services/authentication/auth.ts";
import type { UUID } from "node:crypto";
import { requireTokenSchema, payloadRequireTokenSchema } from "@/lib/endpoint.utils.ts";
import { userManager } from "@/domain/user.manager.ts";
import { isClerk, isDriver, isManager, isOperator } from "@/lib/user.utils.ts";
import type { OrderCreationPayload } from "@/models/order.ts";
import { OrderCancellationSchema, OrderCreationSchema, OrderGetSchema, OrderLoadingSchema, OrderRejectionSchema, OrdersGetAllSchema, type OrderCancellationPayload, type OrderGetReply, type OrderLoadingPayload, type OrderRejectionPayload, type OrdersGetAllReply } from "./dtos/order.dto.ts";
import { orderManager } from "@/domain/order.manager.ts";
import { getOrderInfo } from "@/lib/order.utils.ts";
import { routeManager } from "@/domain/route.manager.ts";
import { vehicleManager } from "@/domain/vehicle.manager.ts";

const idParams = Type.Object({ id: Type.Integer() })

export default function orderRouter(app: FastifyInstance) {
  app.post<{ Body: OrderCreationPayload, Headers: { token: UUID } }>(
    "/orders", {
    schema: payloadRequireTokenSchema(OrderCreationSchema, Type.Integer())
  }, (req, res) => {
    const data = req.body
    const user = authenticate(req.headers.token)

    if (user.isErr || !isClerk(user.ok)) {
      res.status(401).send("not authorized")
      return
    }

    const result = orderManager.create(user.ok.username, data)
    if (result.isErr) {
      res.status(401).send("not authorized")
      return
    }

    res.status(200).send(result.ok)
  })

  app.patch<{ Headers: { token: UUID }, Body: any, Reply: string, Params: { id: number } }>(
    "/orders/:id", {
    schema: { ...payloadRequireTokenSchema(Type.Object({}, { additionalProperties: true }), Type.String()), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr || (!isClerk(requester.ok) && !isManager(requester.ok))) {
      res.status(401).send("not authorized")
      return
    }

    const result = orderManager.patch(id, req.body)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }

    res.status(200).send("order updated")
  })

  app.get<{ Headers: { token: UUID }, Reply: string | OrderGetReply, Params: { id: number } }>(
    "/orders/:id", {
    schema: { ...requireTokenSchema(OrderGetSchema), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr) {
      res.status(401).send("not authorized")
      return
    } 

    const order = orderManager.get(id)
    if (!order) {
      res.status(400).send("no such order")
      return
    }

    const orderInfo = getOrderInfo(order)
    res.status(200).send(orderInfo)
  })

  app.get<{ Headers: { token: UUID }, Reply: string | OrdersGetAllReply }>(
    "/orders", {
    schema: requireTokenSchema(OrdersGetAllSchema)
  }, (req, res) => {
    const token = req.headers.token

    const requester = authenticate(token)
    if (requester.isErr) {
      res.status(401).send("not authorized")
      return
    }

    const user = requester.ok
    const orders = orderManager.getAll()
      .filter(order => !isDriver(user) || ('routeId' in user && 'routeId' in order && order.routeId == user.routeId))
      .map(order => {
        const route = 'routeId' in order ? routeManager.get(order.routeId)! : undefined
        if (!route) return { order }
        return {
          order,
          vehicle: vehicleManager.get(route.vehicleId)!,
          driver: userManager.get(route.driverId)!,
        }
      })
    res.status(200).send(orders)
  })

  app.post<{ Headers: { token: UUID }, Body: OrderRejectionPayload, Reply: string, Params: { id: number } }>(
    "/orders/:id/reject", {
    schema: { ...payloadRequireTokenSchema(OrderRejectionSchema, Type.String()), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr || !isOperator(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = orderManager.reject(requester.ok.username, id, req.body.reason)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }

    res.status(200).send("order rejected")
  })

  app.post<{ Headers: { token: UUID }, Body: OrderCancellationPayload, Reply: string, Params: { id: number } }>(
    "/orders/:id/cancel", {
    schema: { ...payloadRequireTokenSchema(OrderCancellationSchema, Type.String()), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr || !isManager(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = orderManager.cancel(requester.ok.username, id, req.body.reason)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }

    res.status(200).send("order cancelled")
  })

  app.post<{ Headers: { token: UUID }, Reply: string, Params: { id: number } }>(
    "/orders/:id/approve", {
    schema: { ...requireTokenSchema(Type.String()), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr || !isOperator(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = orderManager.approve(requester.ok.username, id)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }

    res.status(200).send("order approved")
  })

  app.post<{ Headers: { token: UUID }, Reply: string, Params: { id: number } }>(
    "/orders/:id/confirm-payment", {
    schema: { ...requireTokenSchema(Type.String()), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const requester = authenticate(token)
    if (requester.isErr || !isClerk(requester.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = orderManager.confirmPayment(requester.ok.username, id)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }

    res.status(200).send("payment of order confirmed")
  })

  app.post<{ Headers: { token: UUID }, Reply: string, Params: { id: number } }>(
    "/orders/:id/confirm-arrival", {
    schema: { ...requireTokenSchema(Type.String()), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const driver = authenticate(token)
    if (driver.isErr || !isDriver(driver.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = orderManager.confirmArrival(driver.ok.username, id)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }

    res.status(200).send("order arrival confirmed")
  })

  app.post<{ Headers: { token: UUID }, Body: OrderLoadingPayload, Reply: string, Params: { id: number } }>(
    "/orders/:id/load", {
    schema: { ...payloadRequireTokenSchema(OrderLoadingSchema, Type.String()), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const operator = authenticate(token)
    if (operator.isErr || !isOperator(operator.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const { driverId, vehicleId } = req.body
    const result = routeManager.loadOrder(operator.ok.username, id, driverId, vehicleId)
    if (result.isErr) {
      let errorMessage: string = result.err
      if (result.err === 'vehicleCapacityExceeded') {
        errorMessage = 'A capacidade de carga (peso) do veículo é inferior ao necessário para este pedido.'
      } else if (result.err === 'vehicleVolumeExceeded') {
        errorMessage = 'O volume interno do veículo é inferior ao necessário para este pedido.'
      } else if (result.err === 'vehicleOrDriverMissingLicense') {
        errorMessage = 'O veículo ou o motorista não possui todas as licenças exigidas por este pedido.'
      } else if (result.err === 'vehicleOrDriverOnRoute') {
        errorMessage = 'O veículo ou o motorista já está em rota.'
      } else if (result.err === 'driverVehicleMissmatch') {
        errorMessage = 'O motorista já está associado a outro veículo nesta rota.'
      }
      res.status(400).send(errorMessage)
      return
    }

    res.status(200).send("order loaded")
  })

  app.post<{ Headers: { token: UUID }, Reply: string, Params: { id: number } }>(
    "/orders/:id/unload", {
    schema: { ...requireTokenSchema(Type.String()), params: idParams }
  }, (req, res) => {
    const token = req.headers.token
    const id = req.params.id

    const operator = authenticate(token)
    if (operator.isErr || !isDriver(operator.ok)) {
      res.status(401).send("not authorized")
      return
    } 

    const result = routeManager.unloadOrder(id)
    if (result.isErr) {
      res.status(400).send(result.err)
      return
    }

    res.status(200).send("order unloaded")
  })
}