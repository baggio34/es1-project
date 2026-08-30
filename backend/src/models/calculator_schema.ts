import Type from "typebox"
import type { Static } from "typebox"

export const CalculatorInputSchema = Type.Object({
    a: Type.Number(),
    b: Type.Number(),
})
export type CalculatorInput = Static<typeof CalculatorInputSchema>

export const CalculatorOutputSchema = Type.Object({
    result: Type.Number(),
})
export type CalculatorOutput = Static<typeof CalculatorOutputSchema>
