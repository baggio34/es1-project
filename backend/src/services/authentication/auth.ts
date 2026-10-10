import type { User } from "@/models/user.ts";
import { accessTokenManager, type AccessToken } from "./access_token.manager.ts";
import { Ok, Err, type Result } from "@/lib/result.ts";
import { userManager } from "@/domain/user.manager.ts";

/**
 * Retorna um usuário a partir de um token se:
 * - O token pertence a um usuário;
 * - O token não está expirado; e
 * - O usuário está com a conta ativa.
 */
export function authenticate(token: AccessToken): Result<User, 'invalidToken' | 'expiredToken' | 'deactivatedUser'> {
  const username = accessTokenManager.getUsername(token)
  if (username.isErr) return Err(username.err)

  const user = userManager.get(username.ok)
  if (!user) return Err('invalidToken')
  if (user.condition == 'deactivated') return Err('deactivatedUser')

  return Ok(user)
}
