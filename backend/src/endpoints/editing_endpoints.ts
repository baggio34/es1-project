import { editDriver } from "@/domain/employee_registration/driver_registration.ts";
import { editOrder } from "@/domain/order_processing/order_registration.ts";
import { editVehicle } from "@/domain/vehicle_registration/vehicle_registration.ts";
import { DriverEditingSchema, type DriverEditingPayload } from "@/endpoints/dtos/driver_dtos.ts";
import { OrderEditingSchema, type OrderEditingPayload } from "@/endpoints/dtos/order_dtos.ts";
import { VehicleEditingSchema, type VehicleEditingPayload } from "@/endpoints/dtos/vehicle_dtos.ts";
import { type FastifyInstance, type FastifySchema } from "fastify";
import Type from "typebox";

const EditingSchema = <T>(payloadSchema: T): FastifySchema => ({
  body: payloadSchema,
  response: {
    200: Type.Literal('edited'),
    400: Type.Object({
      error: Type.String()
    })
  }
})

const entities = [
  { path: "orders", schema: OrderEditingSchema, editFunc: (id: string, payload: any) => editOrder(id, payload as OrderEditingPayload) },
  { path: "vehicles", schema: VehicleEditingSchema, editFunc: (id: string, payload: any) => editVehicle(id, payload as VehicleEditingPayload) },
  { path: "drivers", schema: DriverEditingSchema, editFunc: (id: string, payload: any) => editDriver(id, payload as DriverEditingPayload) },
] as const

export default function editingRouter(app: FastifyInstance) {
  for (const { path, schema, editFunc } of entities) {
    app.put<{ Params: { id: string } }>(
      `/${path}/:id`,
      { schema: EditingSchema(schema) },
      (request, reply) => {
        const payload = request.body
        const { id } = request.params

        const result = editFunc(id, payload)
        if (result.isOk) reply.status(200).send('edited')
        else reply.status(400).send({ error: result.err })
      }
    )
  }
}
