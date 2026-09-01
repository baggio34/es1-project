import type {
  ApiErrorResponse,
  CalculatorInput,
  CalculatorOutput,
  OperationType,
} from '../models/calculator'

export class CalculatorApiError extends Error {
  public readonly code: string
  public readonly statusCode?: number

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode?: number) {
    super(message)
    this.name = 'CalculatorApiError'
    this.code = code
    this.statusCode = statusCode
  }
}

const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'divisionByZero':
      return 'Não é possível dividir por zero'
    default:
      return `Erro na operação: ${errorCode}`
  }
}

const API_BASE = import.meta.env.VITE_API_URL || ''

export const calculatorApi = {
  /**
   * Executa uma operação matemática através do backend Fastify.
   */
  async calculate(operation: OperationType, a: number, b: number): Promise<number> {
    const payload: CalculatorInput = { a, b }
    const endpoint = `${API_BASE}/calculator/${operation}`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 200) {
        const data = (await response.json()) as CalculatorOutput
        return data.result
      }

      if (response.status === 400) {
        const errorData = (await response.json()) as ApiErrorResponse
        const translatedMessage = getErrorMessage(errorData.error)
        throw new CalculatorApiError(translatedMessage, errorData.error, 400)
      }

      throw new CalculatorApiError(
        `Erro do servidor (Status ${response.status})`,
        'SERVER_ERROR',
        response.status,
      )
    } catch (err: unknown) {
      if (err instanceof CalculatorApiError) {
        throw err
      }

      if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
        throw new CalculatorApiError(
          'Servidor backend offline ou inacessível na porta 3000.',
          'NETWORK_ERROR',
        )
      }

      const fallbackMsg = err instanceof Error ? err.message : 'Erro desconhecido ao calcular'
      throw new CalculatorApiError(fallbackMsg, 'UNKNOWN_ERROR')
    }
  },
}
