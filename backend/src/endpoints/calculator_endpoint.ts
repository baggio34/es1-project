import { type FastifyInstance } from "fastify";
import { type CalculatorInput, type CalculatorOutput, CalculatorInputSchema, CalculatorOutputSchema } from "../models/calculator_schema.ts";
import { add, subtract, multiply, divide } from '../domain/calculator_logic.ts'

const CalculatorSchema = {
  body: CalculatorInputSchema,
  response: {
    200: CalculatorOutputSchema,
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
}

interface IReply {
  200: CalculatorOutput,
  400: { error: string }
}

const operations = [
  { name: 'add', canError: false, operation: add },
  { name: 'subtract', canError: false, operation: subtract },
  { name: 'multiply', canError: false, operation: multiply },
  { name: 'divide', canError: true, operation: divide },
] as const

export default function calculatorRouter(app: FastifyInstance) {
  for (const { name, canError, operation } of operations) {
    app.post<{ Body: CalculatorInput, Reply: IReply }>(
      `/calculator/${name}`,
      { schema: CalculatorSchema },
      (request, reply) => {
        const { a, b } = request.body

        if (canError) {
          const result = operation(a, b)
          if (result.isErr) reply.status(400).send({ error: result.err })
          else reply.status(200).send({ result: result.ok })

        } else {
          reply.status(200).send({ result: operation(a, b) })
        }
      }
    )
  }
}