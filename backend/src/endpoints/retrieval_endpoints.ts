import { type FastifyInstance, type FastifySchema } from "fastify";
import Type from "typebox";
import { getOrder, getOrders } from "@/domain/order_processing/order_registration.ts";
import { DriverRetrievalSchema } from "@/endpoints/dtos/driver_dtos.ts";
import { VehicleRetrievalSchema } from "@/endpoints/dtos/vehicle_dtos.ts";
import { getVehicle, getVehicles } from '@/domain/vehicle_registration/vehicle_registration.ts';
import { getDriver, getDrivers } from '@/domain/employee_registration/driver_registration.ts';
import { OrderRetrievalSchema } from "@/endpoints/dtos/order_dtos.ts";

const RetrievalSchema = <T>(responseSchema: T): FastifySchema => ({
  response: {
    200: responseSchema,
    400: Type.Object({
      error: Type.String()
    })
  }
})

const entities = [
  { path: "orders", getAll: getOrders, getOne: getOrder, schema: OrderRetrievalSchema },
  { path: "vehicles", getAll: getVehicles, getOne: getVehicle, schema: VehicleRetrievalSchema },
  { path: "drivers", getAll: getDrivers, getOne: getDriver, schema: DriverRetrievalSchema },
] as const

export default function retrievalRouter(app: FastifyInstance) {
  for (const { path, getAll, getOne, schema } of entities) {
    app.get<{ Params: { id: string } }>(
      `/${path}/:id`, {
      schema: {
        ...RetrievalSchema(schema),
        params: Type.Object({ id: Type.String({ format: 'uuid' }) })
      }
    },
      (request, reply) => {
        const { id } = request.params

        const result = getOne(id)
        if (result.isOk) reply.status(200).send(result.ok)
        else reply.status(400).send({ error: result.err })
      }
    )

    app.get(
      `/${path}`, { schema: RetrievalSchema(Type.Record(Type.String({ format: 'uuid' }), schema)) },
      (_, reply) => reply.status(200).send(getAll())
    )
  }
}