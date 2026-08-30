import { Err, Ok, type Result } from "../lib/result.ts"

export type CalculatorError = 'divisionByZero'

export const add = (a: number, b: number) => a + b
export const subtract = (a: number, b: number) => a - b
export const divide = (a: number, b: number): Result<number, CalculatorError> => {
    if (b == 0) return Err('divisionByZero')
    return Ok(a / b)
}
export const multiply = (a: number, b: number) => a * b
