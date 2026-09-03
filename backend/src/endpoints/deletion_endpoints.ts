import { deleteDriver } from "@/domain/employee_registration/driver_registration.ts";
import { deleteVehicle } from "@/domain/vehicle_registration/vehicle_registration.ts";
import { type FastifyInstance, type FastifySchema } from "fastify";
import Type from "typebox";
import { deleteOrder } from "@/domain/order_processing/order_registration.ts";

const DeletionSchema: FastifySchema = {
  params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
  response: {
    200: Type.Literal('deleted'),
    400: Type.Object({
      error: Type.String()
    })
  }
}

const entities = [
  { path: "orders", deleteFunc: deleteOrder },
  { path: "drivers", deleteFunc: deleteDriver },
  { path: "vehicles", deleteFunc: deleteVehicle },
] as const

export default function deletionRouter(app: FastifyInstance) {
  for (const { path, deleteFunc } of entities) {
    app.delete<{ Params: { id: string } }>(
      `/${path}/:id`, { schema: DeletionSchema },
      (request, reply) => {
        const { id } = request.params

        const result = deleteFunc(id)
        if (result.isOk) reply.status(200).send('deleted')
        else reply.status(400).send({ error: result.err })
      }
    )
  }
}