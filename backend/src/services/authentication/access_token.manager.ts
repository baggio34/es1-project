import { BiMap } from "@/lib/bimap.ts"
import * as date from 'date-fns'
import type { UUID } from "crypto"
import { Err, Ok, type Result } from "@/lib/result.ts"

export type AccessToken = UUID

const TIME_TO_LIVE_IN_HOURS = 12

/**
 * Gerencia os tokens de acesso, relacionando cada um com um nome de usuário e guardando
 * o tempo de expiração de cada um.
 */
class AccessTokenManager {
  private accessTokens = new BiMap<string, AccessToken>
  private tokensExpiration = new Map<AccessToken, Date>

  /**
   * Gera um novo access token associado à `username`.
   * Não checa se o usuário realmente existe, isso é responsabilidade do chamador.
   */
  public logUserIn(username: string): AccessToken {
    // Deletar token antigo
    const oldToken = this.accessTokens.getVal(username)
    if (oldToken) this.tokensExpiration.delete(oldToken)
    
    const expiresOn = date.addHours(new Date(), TIME_TO_LIVE_IN_HOURS)
    const token = crypto.randomUUID()
    this.tokensExpiration.set(token, expiresOn)

    this.accessTokens.associate(username, token)
    return token
  }

  /**
   * Retorna o nome do usuário associado ao token se ele for válido.
   */
  public getUsername(token: AccessToken): Result<string, 'invalidToken' | 'expiredToken'> {
    const username = this.accessTokens.getKey(token)
    if (!username) return Err('invalidToken')

    const expiresOn = this.tokensExpiration.get(token)!
    if (date.isAfter(new Date(), expiresOn)) return Err('expiredToken')
    return Ok(username)
  }
}

export const accessTokenManager = new AccessTokenManager()
