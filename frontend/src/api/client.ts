// frontend/src/api/client.ts

export class ApiError extends Error {
  public readonly code: string
  public readonly statusCode?: number

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
  }
}

// Usa a variável de ambiente do vite ou o valor padrão de localhost na porta 3000
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// frontend/src/api/client.ts

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {

  const url = `${API_BASE}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    // Status 204 (No Content)
    if (response.status === 204) {
      return {} as T
    }

    const textData = await response.text()
    let data: any = {}

    if (textData) {
      try {
        data = JSON.parse(textData)
      } catch {
        // Se a requisição foi bem-sucedida (ex: 200 ou 201), mas o texto não era JSON válido
        if (response.ok) {
          return { message: textData } as T
        }

        throw new ApiError(
          `Resposta inválida do servidor (${response.status}).`,
          'INVALID_JSON',
          response.status
        )
      }
    }

    // Se o status for de sucesso (200-299) e o corpo veio vazio
    if (response.ok) {
      return data as T
    }

    const errorMessage = data.message || data.error || `Erro na requisição (Status ${response.status})`
    const errorCode = data.code || data.error || 'BAD_REQUEST'

    throw new ApiError(errorMessage, errorCode, response.status)
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err
    }

    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new ApiError(
        'Servidor backend offline ou inacessível na porta 3000.',
        'NETWORK_ERROR'
      )
    }

    const fallbackMsg = err instanceof Error ? err.message : 'Erro desconhecido na comunicação com a API'
    throw new ApiError(fallbackMsg, 'UNKNOWN_ERROR')
  }
}