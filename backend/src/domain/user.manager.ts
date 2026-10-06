import type { LoginPayload, LoginReply } from "@/endpoints/dtos/auth.dto.ts";
import type { Role, UserPatchPayload, UserRegistrationPayload } from "@/endpoints/dtos/user.dto.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import { isAdmin, isDriver, isManager } from "@/lib/user.utils.ts";
import type { TransportationStatus } from "@/models/driver.ts";
import type { User } from "@/models/user.ts";
import { accessTokenManager } from "@/services/authentication/access_token.manager.ts";
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts";
import { hash } from "crypto";

/**
 * Gerencia os usuários do sistema, contém ações que afetam qualquer cargo de usuário.
 */
class UserManager {
  private users = new Map<string, User>()

  UserManager() {
    const result = loadObjectFromFile<Record<string, User>>('./data/users.json')
    if (result.isOk) {
      this.users = new Map(Object.entries(result.ok))
    } else {
      console.error(`Error loading users: '${result.err}'\nStarting with new data.`)
    }
  }

  saveUsers(): Result<'saved', string> {
    const result = saveObjectToFile('./data/users.json', Object.fromEntries(this.users.entries()))
    if (result.isErr) {
      console.error(result.err)
      return result
    }
    return Ok('saved')
  }

  /**
   * Retorna um usuário dado seu `username`.
   */
  public get(username: string): User | undefined {
    return this.users.get(username)
  }

  /**
   * Retorna um usuário dado seu `username` somente se ele estiver ativo.
   */
  public getActive(username: string): User | undefined {
    const user = this.users.get(username)
    if (user?.condition == 'active') return user
    return undefined
  }

  /**
   * Retorna todos os usuários. Pode também fornecer um query de cargo, ao filtrar
   * motoristas também é possível indicar as licenças que ele deve possuir.
   */
  public getAll(roleQuery?: Role): User[] {
    if (!roleQuery) return [...this.users.values()]
    return this.users.values()
      .filter(user => {
        if (roleQuery.role != 'driver') return user.role == roleQuery.role
        return user.role == 'driver' && roleQuery.licenses.every(user.licenses.includes)
      })
      .toArray()
  }

  /**
   * Cria uma nova conta a pedido de [requesterId].
   * @param requesterId nome de usuário do gerente ou admin.
   */
  public register(requesterId: string, data: UserRegistrationPayload): Result<'created', 'usernameTaken' | 'notAuthorized'> {
    const requester = this.get(requesterId)
    if (!requester || !isManager(requester)) return Err('notAuthorized')

    // Apenas admins podem cadastrar gerentes e outros admins.
    if ((data.role == 'manager' || data.role == 'admin') && !isAdmin(requester)) {
      return Err('notAuthorized')
    }
    if (this.users.has(data.username)) return Err('usernameTaken')
    
    const user = {
      ...data,
      condition: 'active' as const,
      registeredOn: new Date().toISOString(),
      registeredBy: requesterId,
      passwordHash: hash('sha256', data.password),
      // Marca o estado inicial como 'free' se for motorista.
      status: 'free' as const
    }

    this.users.set(data.username, user as User)

    return Ok('created')
  }

  /**
   * Realiza o login e retorna o novo token de acesso para o usuário caso bem sucedido.
   * Apenas admins podem criar gerentes ou outros admins.
   */
  public login({ username, password }: LoginPayload): Result<LoginReply, 'invalidCredentials'> {
    const user = this.get(username)
    if (!user || user.condition != 'active' || user.passwordHash != hash('sha256', password)) return Err('invalidCredentials')

    return Ok({
      token: accessTokenManager.logUserIn(username),
      ...user
    })
  }

  /**
   * Altera os dados de um usuário por pedido de `requesterId`.
   * Apenas admins podem modificar gerentes ou outros admins.
   * @param requesterId nome de usuário do gerente ou admin.
   */
  public patch(requesterId: string, username: string, data: UserPatchPayload): Result<'edited', 'noSuchUser' | 'notAuthorized'> {
    const requester = this.get(requesterId)
    if (!requester || !isManager(requester)) return Err('notAuthorized')

    const user = this.get(username)
    if (!user) return Err('noSuchUser')
    if (isManager(user) && !isAdmin(requester)) return Err('notAuthorized')

    if (data.password) user.passwordHash = hash('sha256', data.password)
    if (data.name) user.name = data.name
    if (data.condition) user.condition = data.condition

    return Ok('edited')
  }

  /**
   * Permite atualizar o status de um motorista.
   * Não deve ser acessível para fora do programa.
   */
  public updateDriverStatus(username: string, data: TransportationStatus): Result<'ok', 'noSuchDriver'> {
    const driver = this.users.get(username)
    if (!driver || !isDriver(driver)) return Err('noSuchDriver')

    this.users.set(username, { ...driver, ...data })
    return Ok('ok')
  }


  /// DELETE:
  // public has(username: string): boolean {
  //   return this.users.has(username)
  // }

  // public isActive(username: string): boolean {
  //   return this.users.get(username)?.condition == 'active'
  // }

  // public isActiveAnd(username: string, func: (user: User) => boolean): boolean {
  //   const user = this.get(username)
  //   return !!user && user.condition == 'active' && func(user)
  // }
}

export const userManager = new UserManager()
