import type { CreateUserRequest, UpdateUserRequest } from "@/dtos/user.dto.ts"
import type { LoginReply, LoginRequest} from "@/dtos/auth.dto.ts"
import type { PrismaClient, User } from "@/generated/prisma/client.ts";
import { Err, Ok, type Result } from "@/lib/result.ts";
import { isAdmin, isDriver, isManager } from "@/lib/user.utils.ts";
import { PrismaContext } from "@/services/database/prisma_context.ts";
import assert from "assert";
import { hash } from "crypto";

/**
 * Gerencia os usuários do sistema, contém ações que afetam qualquer cargo de usuário.
 */
export class UserManager {
  private static instance: UserManager | null
  private prisma: PrismaClient
  
  private constructor() {
    this.prisma = PrismaContext.getClient()
  }

  public static getInstance(): UserManager {
    if (!this.instance) {
      this.instance = new UserManager()
    }
    return this.instance
  }

  public async get(username: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { username }
    })
  }

  /**
   * Retorna um usuário dado seu `username` somente se ele estiver ativo.
   */
  public async getActive(username: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { username, isActive: true }
    })
  }

  /**
   * Retorna todos os usuários.
   */
  public async getAll(): Promise<User[]> {
    return await this.prisma.user.findMany()
  }

  /**
   * Retorna todos os motoristas ativos.
   */
  public async getDrivers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: "DRIVER",
      }
    })
  }

  /**
   * Cria uma nova conta a pedido de [requester].
   * @param O gerente ou admin.
   */
  public async create(creator: User, data: CreateUserRequest): Promise<Result<'', 'usernameTaken'>> {
    assert(creator.isActive && isManager(creator))
    assert(isAdmin(creator) || (data.role != "ADMIN" && data.role != "MANAGER"))

    try {
      await this.prisma.user.create({
        data: {
          ...data,
          licenses: data.role == "DRIVER"
            ? {
                createMany: {
                  data: data.licenseIds.map(l => ({ licenseId: l }))
                }
              }
            : undefined,
          createdById: creator.id,
          passwordHash: hash('sha256', data.password),
        }
      })
    } catch (e) {
      return Err('usernameTaken')
    }
    return Ok('')
  }

  /**
   * Realiza o login e retorna o novo token de acesso para o usuário caso bem sucedido.
   * Apenas admins podem criar gerentes ou outros admins.
   */
  public async login({ username, password }: LoginRequest): Promise<Result<LoginReply, 'invalidCredentials'>> {
    const user = await this.prisma.user.findFirst({
      where: { username, isActive: true }
    })

    if (!user || user.passwordHash != hash('sha256', password)) return Err('invalidCredentials')

    const accessToken = crypto.randomUUID()
    await this.prisma.user.update({
      where: { username },
      data: { accessToken },
    })

    return Ok({
      token: accessToken,
      ...user
    })
  }

  /**
   * Altera os dados de um usuário por pedido de `requester`.
   * Apenas admins podem modificar gerentes ou outros admins.
   * @param requester gerente ou admin.
   */
  public async update(requester: User, username: string, data: UpdateUserRequest): Promise<Result<'', 'noSuchUser' | 'notAuthorized' | 'badRequest' | 'usernameTaken'>> {
    assert(isManager(requester))

    const user = await this.prisma.user.findFirst({ where: { username } })
    if (!user) return Err('noSuchUser')
    if (isManager(user) && !isAdmin(requester)) return Err('notAuthorized')

    // Checar se o novo nome de usuário está live
    if (data.username && await this.prisma.user.findFirst({ where: { username: data.username }})) {
      return Err('usernameTaken')
    }

    const passwordHash = data.password ? hash('sha256', data.password) : undefined
    try {
      await this.prisma.user.update({
        where: { username },
        data: {
          ...data,
          passwordHash,
          licenses: isDriver(user) && data.licenseIds
            ? {
                createMany: {
                  skipDuplicates: true,
                  data: data.licenseIds.map(l => ({ licenseId: l }))
                }
              }
            : undefined
        }
      })

      // Remover licensas antigas
      if (isDriver(user) && data.licenseIds) {
        await this.prisma.driverToLicense.deleteMany({
          where: { driverId: user.id, licenseId: { notIn: data.licenseIds } }
        })
      }
    } catch (e) {
      return Err('badRequest')
    }

    return Ok('')
  }
}
