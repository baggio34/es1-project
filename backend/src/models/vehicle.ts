import Type, { type Static } from 'typebox'
import { TransportationStatusSchema } from './driver.ts'

export const VehicleSchema = Type.Intersect([
  TransportationStatusSchema,
  Type.Object({
    // A placa é o identificador do veículo.
    plate: Type.String({ minLength: 7, maxLength: 7 }),
    model: Type.String({ minLength: 3 }),
    color: Type.String({ minLength: 3 }),

    // Volume interno em metros cúbicos.
    internalVolume: Type.Number({ minimum: 0 }),

    // Carga máxima em kilogramas.
    maxLoad: Type.Number({ minimum: 0 }),

    // Licenças necessárias para dirigir o veículo.
    licenses: Type.Array(Type.String()),
    condition: Type.Union([ Type.Literal('active'), Type.Literal('deactivated'), ]),

    registeredOn: Type.String({ format: 'date-time' }),
    registeredBy: Type.String(),
  })
])
export type Vehicle = Static<typeof VehicleSchema>
