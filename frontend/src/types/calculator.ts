export type OperationType = 'add' | 'subtract' | 'multiply' | 'divide'

export type OperationSymbol = '+' | '−' | '×' | '÷'

export interface OperationConfig {
  type: OperationType
  symbol: OperationSymbol
  label: string
  keyShortcut: string[]
}

export const OPERATIONS: Record<OperationType, OperationConfig> = {
  add: {
    type: 'add',
    symbol: '+',
    label: 'Somar',
    keyShortcut: ['+'],
  },
  subtract: {
    type: 'subtract',
    symbol: '−',
    label: 'Subtrair',
    keyShortcut: ['-'],
  },
  multiply: {
    type: 'multiply',
    symbol: '×',
    label: 'Multiplicar',
    keyShortcut: ['*', 'x', 'X'],
  },
  divide: {
    type: 'divide',
    symbol: '÷',
    label: 'Dividir',
    keyShortcut: ['/'],
  },
}

export interface CalculatorInput {
  a: number
  b: number
}

export interface CalculatorOutput {
  result: number
}

export interface ApiErrorResponse {
  error: string
}
