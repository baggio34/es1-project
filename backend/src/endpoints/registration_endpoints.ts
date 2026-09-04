import { createDriver } from "@/domain/employee_registration/driver_registration.ts";
import { createOrder } from "@/domain/order_processing/order_registration.ts";
import { createVehicle } from "@/domain/vehicle_registration/vehicle_registration.ts";
import { DriverCreationSchema } from "@/endpoints/dtos/driver_dtos.ts";
import { OrderCreationSchema } from "@/endpoints/dtos/order_dtos.ts";
import { VehicleCreationSchema, type VehicleCreationPayload } from "@/endpoints/dtos/vehicle_dtos.ts";
import { type FastifyInstance, type FastifySchema } from "fastify";
import Type from "typebox";
import { type OrderCreationPayload } from '@/endpoints/dtos/order_dtos.ts';
import { type DriverCreationPayload } from '@/endpoints/dtos/driver_dtos.ts';

const RegistrationSchema = <T>(payloadSchema: T): FastifySchema => ({
  body: payloadSchema,
  response: {
    201: Type.Literal('created'),
    400: Type.Object({
      error: Type.String()
    })
  }
})

const entities = [
  { path: "orders", schema: OrderCreationSchema, createFunc: (payload: any) => createOrder(payload as OrderCreationPayload) },
  { path: "vehicles", schema: VehicleCreationSchema, createFunc: (payload: any) => createVehicle(payload as VehicleCreationPayload) },
  { path: "drivers", schema: DriverCreationSchema, createFunc: (payload: any) => createDriver(payload as DriverCreationPayload) },
] as const

export default function registrationRouter(app: FastifyInstance) {
  for (const { path, schema, createFunc } of entities) {
    app.post(
      `/${path}`,
      { schema: RegistrationSchema(schema) },
      (request, reply) => {
        const payload = request.body

        const result = createFunc(payload)
        if (result.isOk) reply.status(201).send('created')
        else reply.status(400).send({ error: result.err })
      }
    )
  }
}