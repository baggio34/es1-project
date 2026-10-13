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

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const url = `${API_BASE}${endpoint}`

  const headers = new Headers(options?.headers)
  
  const token = localStorage.getItem('token')
  if (token) headers.set('token', token)

  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 204) {
      return {} as T
    }

    const textData = await response.text()
    let data: any = {}

    if (textData) {
      try {
        data = JSON.parse(textData)
      } catch {
        if (response.ok) {
          return { message: textData } as T
        }
        throw new ApiError(textData, 'BAD_REQUEST', response.status)
      }
    }

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
      throw new ApiError('Servidor backend offline ou inacessível.', 'NETWORK_ERROR')
    }
    const fallbackMsg = err instanceof Error ? err.message : 'Erro desconhecido na comunicação com a API'
    throw new ApiError(fallbackMsg, 'UNKNOWN_ERROR')
  }
}