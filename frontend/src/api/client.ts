
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

  // Manipula os headers usando a classe nativa Headers do navegador
  const headers = new Headers(options?.headers)
  
  // Adiciona Content-Type apenas se a requisição possuir um corpo (evita o erro 400 em métodos DELETE/GET)
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Respostas vazias intencionais (Status 204 No Content)
    if (response.status === 204) {
      return {} as T
    }

    const textData = await response.text()
    let data: any = {}

    if (textData) {
      try {
        data = JSON.parse(textData)
      } catch {
        // Se a requisição foi bem-sucedida, mas o retorno foi apenas texto puro (ex: 201 Created)
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

    // Se o status HTTP representar sucesso (200 a 299)
    if (response.ok) {
      return data as T
    }

    // Trata retornos de erro formatados enviados pelo Fastify
    const errorMessage = data.message || data.error || `Erro na requisição (Status ${response.status})`
    const errorCode = data.code || data.error || 'BAD_REQUEST'

    throw new ApiError(errorMessage, errorCode, response.status)
  } catch (err: unknown) {
    // Repassa os erros de API já formatados
    if (err instanceof ApiError) {
      throw err
    }

    // Captura erros estruturais de rede (ex: servidor Fastify desligado ou bloqueio de CORS)
    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new ApiError(
        'Servidor backend offline ou inacessível na porta 3000.',
        'NETWORK_ERROR'
      )
    }

    // Fallback de segurança para qualquer outra falha não mapeada
    const fallbackMsg = err instanceof Error ? err.message : 'Erro desconhecido na comunicação com a API'
    throw new ApiError(fallbackMsg, 'UNKNOWN_ERROR')
  }
}