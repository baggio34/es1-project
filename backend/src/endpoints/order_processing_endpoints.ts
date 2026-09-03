import { approveOrder, rejectOrder } from "@/domain/order_processing/order_approval.ts";
import { confirmArrival, loadOrder, shipOrder, unloadOrder } from "@/domain/order_processing/order_shipment.ts";
import { confirmPaymentOfOrder } from "@/domain/payment_processing/payment_approval.ts";
import type { FastifyInstance, FastifySchema } from "fastify";
import Type from "typebox";

const ProcessingSchemaNoBody = {
  params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
  response: {
    200: Type.Literal('ok'),
    400: Type.Object({ error: Type.String() })
  }
}

const ProcessingSchema = <T>(payload: T): FastifySchema => ({
  ...ProcessingSchemaNoBody,
  body: payload,
})

const noPayloadActions = [
  { path: 'approve', func: approveOrder },
  { path: 'confirm-payment', func: confirmPaymentOfOrder },
  { path: 'ship', func: shipOrder },
  { path: 'unload', func: unloadOrder },
  { path: 'confirm-arrival', func: confirmArrival },
] as const

export default function orderProcessingRouter(app: FastifyInstance) {
  app.post<{ Body: { reason: string }, Params: { id: string } }>(
    "/orders/:id/reject", {
    schema: ProcessingSchema(
      Type.Object({
        reason: Type.String({ minLength: 1 })
      })
    )
  },
    (request, reply) => {
      const result = rejectOrder(request.params.id, request.body.reason)
      if (result.isErr) return reply.status(400).send({ error: result.err })
      return reply.status(200).send('ok')
    }
  )

  app.post<{ Body: { driverId: string, vehicleId: string }, Params: { id: string } }>(
    "/orders/:id/load", {
    schema: ProcessingSchema(
      Type.Object({
        driverId: Type.String({ format: 'uuid' }),
        vehicleId: Type.String({ format: 'uuid' })
      })
    )
  },
    (request, reply) => {
      const { driverId, vehicleId } = request.body
      const result = loadOrder(request.params.id, driverId, vehicleId)
      if (result.isErr) return reply.status(400).send({ error: result.err })
      return reply.status(200).send('ok')
    }
  )

  for (const { path, func } of noPayloadActions) {
    app.post<{ Params: { id: string } }>(
      `/orders/:id/${path}`, { schema: ProcessingSchemaNoBody },
      (request, reply) => {
        const result = func(request.params.id)
        if (result.isErr) return reply.status(400).send({ error: result.err })
        return reply.status(200).send('ok')
      }
    )
  }
}